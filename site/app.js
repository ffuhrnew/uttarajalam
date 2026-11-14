// Nutzt vendor/rnode.js (RNode, ROM, Utils), vendor/nrf52_dfu_flasher.js (Nrf52DfuFlasher) und zip.js
// aus liamcottle/rnode-flasher (MIT). Texte stehen in i18n.js (Deutsch und Englisch).

import { t, getLang, initLang, setLang, applyStatic } from "./i18n.js";

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
let logPristine = true;                       // noch nichts protokolliert: "Bereit." folgt der Sprache
let btStatusState = { key: "bt.status.idle" };  // letzter Bluetooth-Status, wird bei Sprachwechsel neu gesetzt
let fwState = { key: "fw.loading" };
const BT_PIN_WAIT_MS = 5000;      // so lange wartet die Seite auf den PIN
const BT_PAIRING_WINDOW_S = 35;   // BT_PAIRING_TIMEOUT der Firmware (Bluetooth.h)

function updateButtons() {
  document.querySelectorAll("button").forEach((b) => {
    if (b.id.startsWith("lang-")) return;   // Sprachwahl bleibt immer bedienbar
    let off = false;
    if (b.id === "btn-bt-close") off = !btSession;
    else if (!b.id.startsWith("btn-bt-")) off = !!btSession;   // Flashen und Einrichten brauchen denselben Port
    b.disabled = busy || off;
  });
}

function log(text, cls) {
  const line = document.createElement("div");
  logPristine = false;
  line.textContent = new Date().toLocaleTimeString(getLang() === "de" ? "de-DE" : "en-GB") + "  " + text;
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
async function run(titleKey, fn) {
  if (busy) return;
  setBusy(true);
  log(t("run.start", { title: t(titleKey) }));
  try {
    await fn();
    log(t("run.done", { title: t(titleKey) }), "ok");
  } catch (e) {
    if (e && e.name === "NotFoundError") log(t("run.noport"));
    else log(t("run.failed", { title: t(titleKey), msg: e && e.message ? e.message : e }), "err");
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
  if (!res.ok) throw new Error(t("err.notfound", { path, status: res.status }));
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
    log(t("log.dfu"));
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
  log(t("log.zip", { name: b.zip.split("/").pop(), n: bytes.length }));
  let target = null;
  try {
    target = await toDfuPort(port);
    if (!target) {
      throw new Error(t("err.newid"));
    }
    log(t("log.flashing"));
    await new Nrf52DfuFlasher(target).flash(new Blob([bytes]), (pct) => setProgress(Math.floor(pct)));
  } finally {
    if (target && target !== port) await releasePort(target);
    await releasePort(port);
  }
  log(t(mode() === "full" ? "log.after.full" : "log.after.update"));
}

// ---- Nach dem Flashen ------------------------------------------------------


const withTimeout = (promise, ms, msg) =>
  Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms))]);
const closeQuiet = (rnode) => withTimeout(rnode.close(), 3000, "close").catch(() => {});

// XIAO nRF52840: eigener nRF52-Weg. Die Firmware sendet über USB nur, solange DTR gesetzt ist.
async function openRNodeNrf(port) {
  const rnode = await withTimeout(RNode.fromSerialPort(port), 8000, t("err.portopen"));
  await port.setSignals({ dataTerminalReady: true, requestToSend: false }).catch(() => {});
  try {
    const start = Date.now();
    while (Date.now() - start < 20000) {
      if (await rnode.detect()) return rnode;
      const rom = await Promise.race([rnode.getRom().catch(() => null), sleep(1500).then(() => null)]);
      if (rom && rom.length >= 0x9c) return rnode;
      await sleep(500);
    }
    throw new Error(t("err.noanswer"));
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

const renderBtStatus = () => { $("bt-status").textContent = t(btStatusState.key, btStatusState.params); };
const btStatus = (key, params) => { btStatusState = { key, params }; renderBtStatus(); };

function btHidePin() {
  clearInterval(btTimer);
  $("bt-pin-wrap").classList.add("hidden");
  $("bt-pin").textContent = "------";
}

function btOnDisconnect(e) {
  if (!btSession || e.target !== btSession.serialPort) return;
  const rnode = btSession;
  btEnd("bt.lost");
  btClose(rnode);   // Leser und Port freigeben, sonst bleibt der alte Port belegt
}

function btEnd(key, params) {
  btSession = null;
  navigator.serial.removeEventListener("disconnect", btOnDisconnect);
  btHidePin();
  btStatus(key, params);
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
  btStatus("bt.starting");
  let gotPin;
  const pinPromise = new Promise((resolve) => { gotPin = resolve; });
  await rnode.startBluetoothPairing(gotPin);
  let pin;
  try {
    pin = await withTimeout(pinPromise, BT_PIN_WAIT_MS, t("err.nopin"));
  } catch (e) {
    delete rnode.callbacks[rnode.CMD_BT_PIN];
    btStatus("bt.nopin");
    throw e;
  }
  $("bt-pin").textContent = String(pin).padStart(6, "0");
  $("bt-pin-wrap").classList.remove("hidden");
  log(t("log.pin", { pin }), "ok");
  let left = BT_PAIRING_WINDOW_S;
  const tick = () => {
    if (left <= 0) {
      btHidePin();
      btStatus("bt.window.expired");
      return;
    }
    btStatus("bt.window.left", { n: left });
    left--;
  };
  tick();
  btTimer = setInterval(tick, 1000);
}

async function bluetoothClose() {
  if (!btSession) return;
  await btClose(btSession);
  btEnd("bt.closed");
}

// Schaltet Bluetooth am Board ein und speichert "an" (die Firmware sendet sofort).
async function bluetoothOn() {
  const rnode = await btOpen();
  try {
    await rnode.enableBluetooth();
    await sleep(1500);   // Zustand ins Board schreiben lassen
  } finally {
    await btClose(rnode);
    btEnd("bt.on.done");
  }
}

// Schaltet Bluetooth am Board aus und speichert "aus". Die nRF52-Firmware hört danach nicht sofort auf zu senden,
// erst ein Neustart beendet es: deshalb startet die Seite das Board nach dem Speichern neu.
async function bluetoothOff() {
  const rnode = await btOpen();
  try {
    await rnode.disableBluetooth();
    await sleep(1500);   // Zustand ins Board schreiben lassen, bevor es neu startet
    navigator.serial.removeEventListener("disconnect", btOnDisconnect);   // der Neustart trennt USB absichtlich
    log(t("log.btrestart"));
    try { await withTimeout(rnode.reset(), 3000, "reset"); } catch (_) { /* hat sich vielleicht schon selbst neu gestartet */ }
  } finally {
    await btClose(rnode);
    btEnd("bt.off.done");
  }
}

async function wipeEeprom() {
  const port = await pickPort();   // zuerst, solange die Klick-Erlaubnis gilt
  if (!confirm(t("confirm.wipe"))) throw new Error(t("err.cancelled"));
  const rnode = await openRNode(port);
  log(t("log.wiping"));
  await rnode.wipeRom();
  await rnode.close();
  log(t("log.afterwipe"));
}

async function provisionEeprom() {
  const b = board();
  const rnode = await openRNode();
  try {
    const rom = await rnode.getRomAsObject();
    if (rom.parse()) throw new Error(t("err.provisioned"));
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
      throw new Error(t("err.readback", { json: JSON.stringify(back) }));
    }
    log(t("log.readback", { product: back.product.toString(16), model: back.model.toString(16) }));
    // Die Firmware berechnet ihren Hash erst nach einem Neustart: neu starten, denselben Port wieder öffnen, Hash setzen.
    const port = rnode.serialPort;
    const watch = watchReconnect(port);
    try { await withTimeout(rnode.reset(), 3000, "reset"); } catch (_) { /* hat sich vielleicht schon selbst neu gestartet */ }
    await closeQuiet(rnode);
    log(t("log.restarting"));
    const again = await reopenAfterReset(port, watch);
    try {
      await applyFirmwareHash(again);
    } finally {
      await closeQuiet(again);
    }
  } finally {
    await closeQuiet(rnode);
  }
  log(t("log.finished"));
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
  throw new Error(t("err.nodenoanswer", { what: t(what) }));
}

async function applyFirmwareHash(rnode) {
  let actual = await askRetry(() => rnode.getFirmwareHash(), "what.readhash");
  for (let i = 0; i < 10 && isZeroHash(actual); i++) {
    await sleep(1000);
    actual = await askRetry(() => rnode.getFirmwareHash(), "what.readhash");
  }
  if (isZeroHash(actual)) throw new Error(t("err.nohash"));
  await rnode.setFirmwareHash(actual);
  log(t("log.hashsent", { hash: hex(actual).slice(0, 16) }));
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
      if (!noted) { log(t("log.back")); noted = true; }
      log(t("log.opening"));
      try {
        return await withTimeout(openRNode(cand), 40000, t("err.openTimeout"));
      } catch (e) {
        lastErr = e && e.message ? e.message : String(e);
        watch.port = null;
      }
    }
  } finally {
    watch.stop();
  }
  throw new Error(t("err.unreachable", { last: lastErr ? " (" + lastErr + ")" : "" }));
}

async function setFirmwareHash() {
  const rnode = await openRNode();
  try {
    const details = (await rnode.getRomAsObject()).parse();
    if (!details || !details.is_provisioned) throw new Error(t("err.notprov"));
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
      log(t("log.noeeprom"));
    } else {
      log(t("log.eeprom", { state: t(d.is_provisioned ? "log.eeprom.ok" : "log.eeprom.bad"),
        product: d.product.toString(16), model: d.model.toString(16), rev: d.hardware_revision, serial: d.serial_number }));
      log(t("log.checksum", { stored: d.checksum, calc: d.calculated_checksum }));
      log(t("log.configured", { value: t(d.is_configured ? "yes" : "no") }));
    }
    const target = await rnode.getTargetFirmwareHash();
    const actual = await rnode.getFirmwareHash();
    log(t("log.hash.set", { hash: hex(target) }));
    log(t("log.hash.actual", { hash: hex(actual) }));
    log(t(hex(target) === hex(actual) ? "log.hash.match" : "log.hash.mismatch"), hex(target) === hex(actual) ? "ok" : "err");
  } finally {
    await rnode.close();
  }
}

// ---- Oberfläche -----------------------------------------------------------

const renderFwInfo = () => {
  const info = fwState.manifest
    ? t("fw.info", { commit: fwState.manifest.commit.slice(0, 7), built: fwState.manifest.built.replace("T", " ").replace("Z", "") })
    : t(fwState.key);
  $("fwinfo").textContent = info;
};

async function loadManifest() {
  try {
    const m = await (await fetch("firmware/manifest.json", { cache: "no-cache" })).json();
    fwState = { manifest: m };
  } catch (_) {
    fwState = { key: "fw.unknown" };
  }
  renderFwInfo();
}

// Texte nach dem Sprachwechsel neu setzen, die aus dem Programm kommen (Status, Firmware-Stand, "Bereit.").
function renderDynamic() {
  renderBtStatus();
  renderFwInfo();
  if (logPristine) logEl.textContent = t("log.ready");
}

function chooseLang(l) {
  setLang(l);
  applyStatic();
  renderDynamic();
}

initLang();
applyStatic();
renderDynamic();
document.querySelectorAll("[data-lang]").forEach((b) => { b.onclick = () => chooseLang(b.dataset.lang); });

if (!("serial" in navigator)) {
  $("nosupport").classList.remove("hidden");
  document.querySelectorAll("button").forEach((b) => { if (!b.id.startsWith("lang-")) b.disabled = true; });
} else {
  $("btn-flash-nrf").onclick = () => run("act.flash", flashNrf);
  $("btn-wipe").onclick = () => run("act.wipe", wipeEeprom);
  $("btn-provision").onclick = () => run("act.provision", provisionEeprom);
  $("btn-hash").onclick = () => run("act.hash", setFirmwareHash);
  $("btn-inspect").onclick = () => run("act.inspect", inspectNode);
  $("btn-bt-on").onclick = () => run("act.bton", bluetoothOn);
  $("btn-bt-off").onclick = () => run("act.btoff", bluetoothOff);
  $("btn-bt-pair").onclick = () => run("act.btpair", bluetoothPair);
  $("btn-bt-close").onclick = () => run("act.btclose", bluetoothClose);
  updateButtons();
}
loadManifest();
