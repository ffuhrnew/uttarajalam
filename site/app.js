// Nutzt vendor/rnode.js (RNode, ROM, Utils), vendor/nrf52_dfu_flasher.js (Nrf52DfuFlasher) und zip.js
// aus liamcottle/rnode-flasher (MIT).

const BOARDS = {
  xiao_nrf52840: { kind: "nrf52", product: 0xEC, model: 0xEE, zip: "firmware/rnode_firmware_xiao_nrf52840.zip" },
  xiao_nrf52840_433: { kind: "nrf52", product: 0xEC, model: 0xED, zip: "firmware/rnode_firmware_xiao_nrf52840.zip" },
};

const $ = (id) => document.getElementById(id);
const logEl = $("log");
const progressEl = $("progress");
let busy = false;
let btSession = null;   // offene USB-Verbindung zum Board, solange die Bluetooth-Karte benutzt wird
let btTimer = null;
const BT_PIN_WAIT_MS = 5000;      // so lange wartet die Seite auf den PIN
const BT_PAIRING_WINDOW_S = 35;   // BT_PAIRING_TIMEOUT der Firmware (Bluetooth.h)

function updateButtons() {
  document.querySelectorAll("button").forEach((b) => {
    let off = false;
    if (b.id === "btn-bt-close") off = !btSession;
    else if (!b.id.startsWith("btn-bt-")) off = !!btSession;   // Flashen und Einrichten brauchen denselben Port
    b.disabled = busy || off;
  });
}

function log(text, cls) {
  const line = document.createElement("div");
  line.textContent = new Date().toLocaleTimeString("de-DE") + "  " + text;
  if (cls) line.className = cls;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}
function setProgress(pct) {
  progressEl.classList.toggle("hidden", pct == null);
  if (pct != null) progressEl.value = pct;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const board = () => BOARDS[document.querySelector('input[name="board"]:checked').value];
const mode = () => document.querySelector('input[name="mode"]:checked').value;

function setBusy(on) {
  busy = on;
  updateButtons();
}

// Jede Aktion läuft über run(): ein Vorgang gleichzeitig, Fehler landen im Protokoll.
async function run(title, fn) {
  if (busy) return;
  setBusy(true);
  log("→ " + title);
  try {
    await fn();
    log("✓ " + title + " fertig", "ok");
  } catch (e) {
    if (e && e.name === "NotFoundError") log("Kein Port gewählt, abgebrochen.");
    else log("✗ " + title + " fehlgeschlagen: " + (e && e.message ? e.message : e), "err");
    console.error(e);
  } finally {
    setProgress(null);
    setBusy(false);
  }
}

async function pickPort() {
  return await navigator.serial.requestPort({ filters: [] });
}

// Gibt einen Port frei, auch wenn er schon zu ist. Ohne das bleibt er nach einem Fehler belegt,
// und alle weiteren Versuche scheitern, bis die Seite neu geladen wird.
async function releasePort(port) {
  try { await port.close(); } catch (_) { /* war schon zu */ }
}

const hex = (bytes) => Array.from(bytes || [], (b) => b.toString(16).padStart(2, "0")).join("");

async function fetchBytes(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(path + " nicht gefunden (HTTP " + res.status + "). Wurde die Firmware schon gebaut?");
  return new Uint8Array(await res.arrayBuffer());
}

function toBinaryString(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return s;
}

// ---- Flashen ---------------------------------------------------------------

// Versetzt das Board per Software in den Update-Modus (Port kurz mit 1200 Baud öffnen und schließen)
// und liefert den Port, über den geflasht wird. Im Update-Modus meldet sich das Board unter einer anderen
// USB-Kennung. Hat der Browser diese Kennung noch nie gesehen, darf die Seite sie nur nach einer neuen Auswahl
// durch den Nutzer öffnen: dann kommt null zurück (einmalig, danach ist sie bekannt).
async function toDfuPort(port) {
  const vid = port.getInfo().usbVendorId;
  let gone = false, fresh = null;
  const onGone = (e) => { if (e.target === port) gone = true; };
  const onNew = (e) => { if (e.target && e.target !== port && e.target.getInfo().usbVendorId === vid) fresh = e.target; };
  navigator.serial.addEventListener("disconnect", onGone);
  navigator.serial.addEventListener("connect", onNew);
  try {
    log("Board wird in den Update-Modus versetzt …");
    await new Nrf52DfuFlasher(port).enterDfuMode();   // wartet selbst 1,5 s
    for (let i = 0; i < 20; i++) {
      if (!gone && i >= 3) return port;                // meldet sich nicht ab: war schon im Update-Modus
      if (gone) {
        const ports = await navigator.serial.getPorts();
        const cand = fresh || ports.find((p) => p !== port && p.getInfo().usbVendorId === vid);
        if (cand) return cand;
      }
      await sleep(400);
    }
    return null;
  } finally {
    navigator.serial.removeEventListener("disconnect", onGone);
    navigator.serial.removeEventListener("connect", onNew);
  }
}

async function flashNrf() {
  const b = board();
  const port = await pickPort();   // zuerst, solange die Klick-Erlaubnis gilt
  const bytes = await fetchBytes(b.zip);
  log(b.zip.split("/").pop() + ": " + bytes.length + " Bytes");
  let target = null;
  try {
    target = await toDfuPort(port);
    if (!target) {
      throw new Error("Das Board ist im Update-Modus, meldet sich aber unter einer neuen USB-Kennung. " +
        "Einmalig: noch einmal auf „Flashen“ klicken und den Port des Boards wählen. Danach geht es ohne zweite Auswahl.");
    }
    log("Flashen …");
    await new Nrf52DfuFlasher(target).flash(new Blob([bytes]), (pct) => setProgress(Math.floor(pct)));
  } finally {
    if (target && target !== port) await releasePort(target);
    await releasePort(port);
  }
  log("Danach: Schritt 3 (Firmware-Hash setzen" + (mode() === "full" ? ", vorher EEPROM einrichten" : "") + ").");
}

// ---- Nach dem Flashen ------------------------------------------------------


const withTimeout = (promise, ms, msg) =>
  Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms))]);
const closeQuiet = (rnode) => withTimeout(rnode.close(), 3000, "close").catch(() => {});

// XIAO nRF52840: eigener nRF52-Weg. Die Firmware sendet über USB nur, solange DTR gesetzt ist.
async function openRNodeNrf(port) {
  const rnode = await withTimeout(RNode.fromSerialPort(port), 8000, "Der Port lässt sich nicht öffnen.");
  await port.setSignals({ dataTerminalReady: true, requestToSend: false }).catch(() => {});
  try {
    const start = Date.now();
    while (Date.now() - start < 20000) {
      if (await rnode.detect()) return rnode;
      const rom = await Promise.race([rnode.getRom().catch(() => null), sleep(1500).then(() => null)]);
      if (rom && rom.length >= 0x9c) return rnode;
      await sleep(500);
    }
    throw new Error("Das gewählte Gerät meldet sich nicht als RNode. Ist ein Smartphone oder Computer per Bluetooth mit dem Board verbunden? " +
      "Dann antwortet das Board nur dort und nicht über USB. Bluetooth am Smartphone ausschalten (oder das Board dort vergessen), " +
      "das Board neu anstecken und noch einmal versuchen.");
  } catch (e) {
    await closeQuiet(rnode);
    throw e;
  }
}

async function openRNode(port) {
  port = port || await pickPort();
  return openRNodeNrf(port);
}

// ---- Bluetooth -------------------------------------------------------------
// Die Firmware erzeugt den PIN beim Befehl "Pairing starten" (nicht erst, wenn das Smartphone fragt) und hält das
// Pairing-Fenster 35 Sekunden offen. Die USB-Verbindung bleibt offen, bis sie getrennt wird.

const btStatus = (text) => { $("bt-status").textContent = text; };

function btHidePin() {
  clearInterval(btTimer);
  $("bt-pin-wrap").classList.add("hidden");
  $("bt-pin").textContent = "------";
}

function btOnDisconnect(e) {
  if (!btSession || e.target !== btSession.serialPort) return;
  const rnode = btSession;
  btEnd("Verbindung zum Board verloren.");
  btClose(rnode);   // Leser und Port freigeben, sonst bleibt der alte Port belegt
}

function btEnd(text) {
  btSession = null;
  navigator.serial.removeEventListener("disconnect", btOnDisconnect);
  btHidePin();
  btStatus(text);
  updateButtons();
}

async function btOpen() {
  if (btSession) return btSession;
  const port = await pickPort();   // zuerst, solange die Klick-Erlaubnis gilt
  btSession = await openRNode(port);
  navigator.serial.addEventListener("disconnect", btOnDisconnect);
  updateButtons();
  return btSession;
}

async function btClose(rnode) {
  delete rnode.callbacks[rnode.CMD_BT_PIN];
  await closeQuiet(rnode);
}

async function bluetoothPair() {
  const rnode = await btOpen();
  btHidePin();
  btStatus("Starte Pairing …");
  let gotPin;
  const pinPromise = new Promise((resolve) => { gotPin = resolve; });
  await rnode.startBluetoothPairing(gotPin);
  let pin;
  try {
    pin = await withTimeout(pinPromise, BT_PIN_WAIT_MS,
      "Das Board hat keinen PIN gemeldet. Ist schon ein Smartphone verbunden? Dort die Verbindung trennen und noch einmal starten.");
  } catch (e) {
    delete rnode.callbacks[rnode.CMD_BT_PIN];
    btStatus("Kein PIN empfangen.");
    throw e;
  }
  $("bt-pin").textContent = String(pin).padStart(6, "0");
  $("bt-pin-wrap").classList.remove("hidden");
  log("Bluetooth-Pairing-PIN: " + pin, "ok");
  let left = BT_PAIRING_WINDOW_S;
  const tick = () => {
    if (left <= 0) {
      btHidePin();
      btStatus("Pairing-Fenster abgelaufen. Mit „Pairing starten“ einen neuen PIN holen.");
      return;
    }
    btStatus("PIN am Smartphone eingeben, das Pairing-Fenster ist noch " + left + " s offen.");
    left--;
  };
  tick();
  btTimer = setInterval(tick, 1000);
}

async function bluetoothClose() {
  if (!btSession) return;
  await btClose(btSession);
  btEnd("Verbindung getrennt. Bluetooth am Board bleibt eingeschaltet.");
}

async function bluetoothOff() {
  const rnode = await btOpen();
  try {
    await rnode.disableBluetooth();
    await sleep(300);
  } finally {
    await btClose(rnode);
    btEnd("Bluetooth ausgeschaltet (gespeichert). Vollständig aus ist es spätestens nach dem nächsten Neustart des Boards.");
  }
}

async function wipeEeprom() {
  const port = await pickPort();   // zuerst, solange die Klick-Erlaubnis gilt
  if (!confirm("Das löscht den EEPROM des Nodes (Gerätedaten und Funk-Einstellungen). Fortfahren?")) throw new Error("abgebrochen");
  const rnode = await openRNode(port);
  log("EEPROM wird geleert, das dauert bis zu 30 Sekunden …");
  await rnode.wipeRom();
  await rnode.close();
  log("Danach Board kurz neu anstecken, dann Schritt b.");
}

async function provisionEeprom() {
  const b = board();
  const rnode = await openRNode();
  try {
    const rom = await rnode.getRomAsObject();
    if (rom.parse()) throw new Error("Der EEPROM ist schon eingerichtet. Erst Schritt a (EEPROM leeren).");
    const hwRev = 0x1;
    const serial = Utils.packUInt32BE(1);
    const made = Utils.packUInt32BE(Math.floor(Date.now() / 1000));
    const checksum = Utils.md5([b.product, b.model, hwRev, ...serial, ...made]);
    await rnode.writeRom(ROM.ADDR_PRODUCT, b.product);
    await rnode.writeRom(ROM.ADDR_MODEL, b.model);
    await rnode.writeRom(ROM.ADDR_HW_REV, hwRev);
    for (let i = 0; i < 4; i++) await rnode.writeRom(ROM.ADDR_SERIAL + i, serial[i]);
    for (let i = 0; i < 4; i++) await rnode.writeRom(ROM.ADDR_MADE + i, made[i]);
    for (let i = 0; i < 16; i++) await rnode.writeRom(ROM.ADDR_CHKSUM + i, checksum[i]);
    for (let i = 0; i < 128; i++) await rnode.writeRom(ROM.ADDR_SIGNATURE + i, 0x00);
    await rnode.writeRom(ROM.ADDR_INFO_LOCK, ROM.INFO_LOCK_BYTE);
    await sleep(2000); // EEPROM-Schreibvorgänge abwarten
    const back = (await rnode.getRomAsObject()).parse();
    if (!back || !back.is_provisioned || back.product !== b.product || back.model !== b.model) {
      throw new Error("Beim Zurücklesen stimmen die Werte nicht: " + JSON.stringify(back) + ". Erst Schritt a (EEPROM leeren), dann nochmal b.");
    }
    log("Zurückgelesen: Produkt 0x" + back.product.toString(16) + ", Modell 0x" + back.model.toString(16) + ", Prüfsumme stimmt.");
    // Die Firmware berechnet ihren Hash erst nach einem Neustart: neu starten, denselben Port wieder öffnen, Hash setzen.
    const port = rnode.serialPort;
    const watch = watchReconnect(port);
    try { await withTimeout(rnode.reset(), 3000, "reset"); } catch (_) { /* hat sich vielleicht schon selbst neu gestartet */ }
    await closeQuiet(rnode);
    log("Node startet neu, warte auf ihn …");
    const again = await reopenAfterReset(port, watch);
    try {
      await applyFirmwareHash(again);
    } finally {
      await closeQuiet(again);
    }
  } finally {
    await closeQuiet(rnode);
  }
  log("Fertig.");
}

// Trägt den Hash der laufenden Firmware als erwarteten Wert ein und liest ihn zurück.
// Direkt nach dem Einrichten des EEPROMs meldet die Firmware noch nur Nullen: sie berechnet den Hash erst beim
// nächsten Start. Nullen werden deshalb nie eingetragen, sondern es wird auf den echten Wert gewartet.
const isZeroHash = (h) => h.every((b) => b === 0);

// Befehl mit Zeitgrenze und Wiederholung: eine verlorene Antwort darf den Ablauf nicht für immer blockieren.
async function askRetry(fn, what) {
  for (let i = 0; i < 6; i++) {
    try { return await withTimeout(fn(), 3000, "keine Antwort"); } catch (_) { await sleep(300); }
  }
  throw new Error("Der Node antwortet nicht auf: " + what + ".");
}

async function applyFirmwareHash(rnode) {
  let actual = await askRetry(() => rnode.getFirmwareHash(), "Firmware-Hash lesen");
  for (let i = 0; i < 10 && isZeroHash(actual); i++) {
    await sleep(1000);
    actual = await askRetry(() => rnode.getFirmwareHash(), "Firmware-Hash lesen");
  }
  if (isZeroHash(actual)) throw new Error("Der Node meldet noch keinen Firmware-Hash. Board neu anstecken und Schritt c ausführen.");
  await rnode.setFirmwareHash(actual);
  log("Firmware-Hash gesendet (" + hex(actual).slice(0, 16) + " …) – Node startet jetzt neu.");
}

// Merkt sich, wenn das Board nach einem Neustart als neues USB-Gerät wieder auftaucht.
function watchReconnect(port) {
  const info = port.getInfo();
  const same = (p) => { const pi = p.getInfo(); return pi.usbVendorId === info.usbVendorId && pi.usbProductId === info.usbProductId; };
  const state = { port: null, same };
  const onConnect = (e) => { if (e.target && same(e.target)) state.port = e.target; };
  navigator.serial.addEventListener("connect", onConnect);
  state.stop = () => navigator.serial.removeEventListener("connect", onConnect);
  return state;
}

// Öffnet nach einem Neustart des Boards denselben Port wieder, ohne neue Auswahl (die Erlaubnis bleibt bestehen).
// Nach dem Neustart meldet sich das Board als neues USB-Gerät: das alte Port-Objekt ist dann ungültig.
async function reopenAfterReset(oldPort, watch) {
  const start = Date.now();
  let noted = false, lastErr = "";
  try {
    while (Date.now() - start < 70000) {
      await sleep(1000);
      const ports = await navigator.serial.getPorts();
      const waited = Date.now() - start;
      const cand = watch.port
        || ports.find((p) => p !== oldPort && watch.same(p))
        || (waited > 10000 ? ports.find(watch.same) : null);   // kein Neuanmelden bemerkt: altes Objekt versuchen
      if (!cand) continue;
      if (!noted) { log("Node ist wieder da, öffne die Verbindung …"); noted = true; }
      log("Öffne …");
      try {
        return await withTimeout(openRNode(cand), 40000, "Zeitüberschreitung beim Öffnen.");
      } catch (e) {
        lastErr = e && e.message ? e.message : String(e);
        watch.port = null;
      }
    }
  } finally {
    watch.stop();
  }
  throw new Error("Der Node ist nach dem Neustart nicht wieder erreichbar" + (lastErr ? " (" + lastErr + ")" : "") +
    ". Board neu anstecken und Schritt c ausführen.");
}

async function setFirmwareHash() {
  const rnode = await openRNode();
  try {
    const details = (await rnode.getRomAsObject()).parse();
    if (!details || !details.is_provisioned) throw new Error("Der EEPROM ist nicht eingerichtet. Erst Schritt b.");
    await applyFirmwareHash(rnode);
    try { await rnode.reset(); } catch (_) { /* hat sich vielleicht selbst neu gestartet */ }
  } finally {
    await rnode.close();
  }
}

async function inspectNode() {
  const rnode = await openRNode();
  try {
    const d = (await rnode.getRomAsObject()).parse();
    if (!d) {
      log("EEPROM: nicht eingerichtet (Info-Sperre fehlt). Schritt b.");
    } else {
      log("EEPROM: " + (d.is_provisioned ? "eingerichtet" : "Prüfsumme passt NICHT") +
        ", Produkt 0x" + d.product.toString(16) + ", Modell 0x" + d.model.toString(16) +
        ", Hardware-Rev " + d.hardware_revision + ", Seriennr. " + d.serial_number);
      log("Prüfsumme gespeichert " + d.checksum + ", berechnet " + d.calculated_checksum);
      log("Konfiguriert: " + (d.is_configured ? "ja" : "nein"));
    }
    const target = await rnode.getTargetFirmwareHash();
    const actual = await rnode.getFirmwareHash();
    log("Firmware-Hash gesetzt:   " + hex(target));
    log("Firmware-Hash tatsächlich: " + hex(actual));
    log("Hash " + (hex(target) === hex(actual) ? "passt" : "passt NICHT, Schritt c"), hex(target) === hex(actual) ? "ok" : "err");
  } finally {
    await rnode.close();
  }
}

// ---- Oberfläche -----------------------------------------------------------

async function loadManifest() {
  try {
    const m = await (await fetch("firmware/manifest.json", { cache: "no-cache" })).json();
    $("fwinfo").textContent = "Firmware-Stand: Commit " + m.commit.slice(0, 7) + ", gebaut " + m.built.replace("T", " ").replace("Z", " UTC");
  } catch (_) {
    $("fwinfo").textContent = "Firmware-Stand unbekannt (manifest.json fehlt).";
  }
}

if (!("serial" in navigator)) {
  $("nosupport").classList.remove("hidden");
  document.querySelectorAll("button").forEach((b) => (b.disabled = true));
} else {
  $("btn-flash-nrf").onclick = () => run("Flashen (nRF52)", flashNrf);
  $("btn-wipe").onclick = () => run("EEPROM leeren", wipeEeprom);
  $("btn-provision").onclick = () => run("EEPROM einrichten", provisionEeprom);
  $("btn-hash").onclick = () => run("Firmware-Hash setzen", setFirmwareHash);
  $("btn-inspect").onclick = () => run("Status prüfen", inspectNode);
  $("btn-bt-pair").onclick = () => run("Bluetooth-Pairing starten", bluetoothPair);
  $("btn-bt-close").onclick = () => run("Bluetooth-Verbindung trennen", bluetoothClose);
  $("btn-bt-off").onclick = () => run("Bluetooth ausschalten", bluetoothOff);
  updateButtons();
}
loadManifest();
