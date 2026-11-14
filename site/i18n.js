// Texte der Seite auf Deutsch und Englisch.
// Statische Texte stehen im HTML mit data-i18n (reiner Text) oder data-i18n-html (mit <strong>, <code>, <a>).
// Texte aus dem Programm holt t("schlüssel", { platzhalter: wert }).

const STR = {
  de: {
    "meta.desc": "RNode Firmware CE (UttaraJālam) direkt im Browser auf Seeed XIAO nRF52840 + Wio-SX1262 flashen.",
    "sub": "RNode Firmware CE für <strong>Seeed XIAO nRF52840 + Wio-SX1262</strong> direkt im Browser flashen und einrichten.",
    "nosupport": "<strong>Dieser Browser kann nicht per USB flashen.</strong> Bitte Chrome oder Edge am Computer verwenden (Web Serial). Firefox und Safari werden nicht unterstützt.",

    "h.board": "1. Board wählen",
    "board.eu.sub": "Produkt 0xEC · Modell 0xEE",
    "board.433.sub": "Produkt 0xEC · Modell 0xED",
    "board.h3.eu.sub": "Produkt 0xC1 · Modell 0xCA · ungetestet",
    "board.h3.433.sub": "Produkt 0xC1 · Modell 0xC5 · ungetestet",
    "board.xs3.eu.sub": "Produkt 0xEB · Modell 0xDD · ungetestet",
    "board.xs3.433.sub": "Produkt 0xEB · Modell 0xDE · ungetestet",
    "esp.s1": "Board per USB anstecken. Die Seite versucht, den Download-Modus selbst einzuschalten.",
    "esp.s2": "Auf „Flashen“ klicken und den Port des Boards wählen.",
    "esp.s3": "Das Board wird von der Seite selbst in den Update-Modus geschaltet, ein Knopfdruck ist nicht nötig. Klappt die Verbindung nicht, USB-Kabel neu stecken (ein Datenkabel, kein reines Ladekabel) und nochmal „Flashen“.",
    "confirm.full": "„Neu einrichten“ löscht den ganzen Flash des Boards (Einstellungen, Identität). Fortfahren?",
    "log.attempt": "Verbindung mit automatischem Reset",
    "log.notconn": "Nicht verbunden: {msg}",
    "err.noconn": "Keine Verbindung zum Chip. USB-Kabel neu stecken (ein Datenkabel, kein reines Ladekabel) und nochmal Flashen.",
    "err.badzip": "Im Firmware-Paket fehlt {name}.",
    "log.nostart": "Falls das Board nicht von selbst startet: kurz USB abziehen und wieder einstecken.",
    "log.noanswer.reset": "Keine Antwort, starte das Board einmal neu …",
    "log.waiting": "Warte auf das Board … {s} s, {n} Bytes empfangen",
    "log.received": "Empfangen vom Board ({n} Bytes, letzte Ausgabe):\n{text}",
    "log.nothing": "(nichts)",
    "h.flash": "2. Flashen",
    "mode.update": "Update",
    "mode.update.sub": "nur Firmware, Einstellungen und Identität bleiben",
    "mode.full": "Neu einrichten",
    "mode.full.sub": "neuer oder leerer Node, löscht alles",
    "flash.s1": "Board per USB anstecken. Ein Knopfdruck am Board ist nicht nötig, die Seite schaltet den Update-Modus selbst ein.",
    "flash.s2": "Auf „Flashen“ klicken und den Port des Boards wählen.",
    "flash.s3": "Nur beim allerersten Mal verlangt der Browser eine zweite Auswahl, weil sich das Board im Update-Modus als neues USB-Gerät meldet. Dann noch einmal „Flashen“ klicken und den Port wählen.",
    "btn.flash": "Flashen",

    "h.after": "3. Nach dem Flashen",
    "after.update": "<strong>Update:</strong> nur Schritt c. Der Firmware-Hash ändert sich mit jeder neuen Firmware und muss danach gesetzt werden.",
    "after.full": "<strong>Neu einrichten:</strong> nach dem vollen Flash nur noch b (setzt auch den Hash). Schritt a nur bei einem Node, der vorher schon benutzt wurde. Jeder Schritt fragt den Port neu ab, weil das Board dazwischen neu startet.",
    "btn.wipe": "a. EEPROM leeren",
    "btn.provision": "b. Einrichten (EEPROM und Hash)",
    "btn.hash": "c. Firmware-Hash setzen",
    "btn.inspect": "Status prüfen",
    "after.note": "Das Leeren dauert bis zu 30 Sekunden. Eine Gerätesignatur wird hier nicht erzeugt (wie im rnode-flasher), <code>rnodeconf</code> kann sie deshalb als nicht bestätigt melden.",

    "h.bt": "4. Bluetooth",
    "bt.intro": "Hier schaltest du Bluetooth am Board ein oder aus (der Zustand wird im Board gespeichert) und startest das Pairing. „Pairing starten“ zeigt einen PIN, und das Board hält das Pairing-Fenster 35 Sekunden offen. In dieser Zeit am Smartphone das Board suchen und den PIN eingeben. Solange die USB-Verbindung der Seite offen ist, sind Flashen und Einrichten gesperrt.",
    "btn.bton": "Bluetooth einschalten",
    "btn.btoff": "Bluetooth ausschalten",
    "btn.btpair": "Pairing starten",
    "btn.btclose": "Verbindung trennen",
    "bt.pin.label": "Pairing-PIN:",
    "bt.note": "„Bluetooth ausschalten“ startet das Board neu, damit es sofort nicht mehr sendet, und speichert „aus“. „Bluetooth einschalten“ speichert „an“. „Pairing starten“ schaltet Bluetooth bei Bedarf ebenfalls dauerhaft ein. „Verbindung trennen“ beendet nur die USB-Verbindung der Seite. Ist ein Smartphone per Bluetooth mit dem Board verbunden, antwortet das Board nicht über USB. Dann am Smartphone Bluetooth ausschalten oder das Board dort vergessen. Gekoppelte Geräte kann diese Firmware auf dem Board nicht löschen, das geht nur am Smartphone.",

    "h.log": "Protokoll",
    "log.ready": "Bereit.",
    "h.more": "Mehr",
    "link.src": "Quellcode",
    "link.issues": "Fehler melden",
    "footer": "GPL-3.0. Der Flasher benutzt Code von <a href=\"https://github.com/liamcottle/rnode-flasher\">liamcottle/rnode-flasher</a> (MIT), siehe <a href=\"vendor/THIRD-PARTY.md\">THIRD-PARTY.md</a>. Die Firmware wird bei jedem Stand von <code>main</code> automatisch gebaut. Flashen geschieht auf eigene Gefahr.",

    "act.flash": "Flashen (nRF52)",
    "act.wipe": "EEPROM leeren",
    "act.provision": "EEPROM einrichten",
    "act.hash": "Firmware-Hash setzen",
    "act.inspect": "Status prüfen",
    "act.btpair": "Bluetooth-Pairing starten",
    "act.btclose": "Bluetooth-Verbindung trennen",
    "act.btoff": "Bluetooth ausschalten",
    "act.bton": "Bluetooth einschalten",
    "what.readhash": "Firmware-Hash lesen",

    "run.start": "→ {title}",
    "run.done": "✓ {title} fertig",
    "run.failed": "✗ {title} fehlgeschlagen: {msg}",
    "run.noport": "Kein Port gewählt, abgebrochen.",

    "fw.loading": "Firmware-Stand wird geladen …",
    "fw.info": "Firmware-Stand: Commit {commit}, gebaut {built} UTC",
    "fw.unknown": "Firmware-Stand unbekannt (manifest.json fehlt).",

    "err.cancelled": "abgebrochen",
    "err.notfound": "{path} nicht gefunden (HTTP {status}). Wurde die Firmware schon gebaut?",
    "err.newid": "Das Board ist im Update-Modus, meldet sich aber unter einer neuen USB-Kennung. Einmalig: noch einmal auf „Flashen“ klicken und den Port des Boards wählen. Danach geht es ohne zweite Auswahl.",
    "err.portopen": "Der Port lässt sich nicht öffnen.",
    "err.noanswer": "Das gewählte Gerät meldet sich nicht als RNode. Ist ein Smartphone oder Computer per Bluetooth mit dem Board verbunden? Dann antwortet das Board nur dort und nicht über USB. Bluetooth am Smartphone ausschalten (oder das Board dort vergessen), das Board neu anstecken und noch einmal versuchen.",
    "err.nopin": "Das Board hat keinen PIN gemeldet. Ist schon ein Smartphone verbunden? Dort die Verbindung trennen und noch einmal starten.",
    "err.provisioned": "Der EEPROM ist schon eingerichtet. Erst Schritt a (EEPROM leeren).",
    "err.readback": "Beim Zurücklesen stimmen die Werte nicht: {json}. Erst Schritt a (EEPROM leeren), dann nochmal b.",
    "err.nodenoanswer": "Der Node antwortet nicht auf: {what}.",
    "err.nohash": "Der Node meldet noch keinen Firmware-Hash. Board neu anstecken und Schritt c ausführen.",
    "err.unreachable": "Der Node ist nach dem Neustart nicht wieder erreichbar{last}. Board neu anstecken und Schritt c ausführen.",
    "err.openTimeout": "Zeitüberschreitung beim Öffnen.",
    "err.notprov": "Der EEPROM ist nicht eingerichtet. Erst Schritt b.",
    "confirm.wipe": "Das löscht den EEPROM des Nodes (Gerätedaten und Funk-Einstellungen). Fortfahren?",

    "log.dfu": "Board wird in den Update-Modus versetzt …",
    "log.zip": "{name}: {n} Bytes",
    "log.flashing": "Flashen …",
    "log.after.update": "Danach: Schritt 3 (Firmware-Hash setzen).",
    "log.after.full": "Danach: Schritt 3 (Firmware-Hash setzen, vorher EEPROM einrichten).",
    "log.wiping": "EEPROM wird geleert, das dauert bis zu 30 Sekunden …",
    "log.afterwipe": "Danach Board kurz neu anstecken, dann Schritt b.",
    "log.readback": "Zurückgelesen: Produkt 0x{product}, Modell 0x{model}, Prüfsumme stimmt.",
    "log.restarting": "Node startet neu, warte auf ihn …",
    "log.back": "Node ist wieder da, öffne die Verbindung …",
    "log.opening": "Öffne …",
    "log.finished": "Fertig.",
    "log.hashsent": "Firmware-Hash gesendet ({hash} …) – Node startet jetzt neu.",
    "log.pin": "Bluetooth-Pairing-PIN: {pin}",
    "log.btrestart": "Board wird neu gestartet, damit Bluetooth sofort aus ist …",
    "log.noeeprom": "EEPROM: nicht eingerichtet (Info-Sperre fehlt). Schritt b.",
    "log.eeprom": "EEPROM: {state}, Produkt 0x{product}, Modell 0x{model}, Hardware-Rev {rev}, Seriennr. {serial}",
    "log.eeprom.ok": "eingerichtet",
    "log.eeprom.bad": "Prüfsumme passt NICHT",
    "log.checksum": "Prüfsumme gespeichert {stored}, berechnet {calc}",
    "log.configured": "Konfiguriert: {value}",
    "yes": "ja",
    "no": "nein",
    "log.hash.set": "Firmware-Hash gesetzt:   {hash}",
    "log.hash.actual": "Firmware-Hash tatsächlich: {hash}",
    "log.hash.match": "Hash passt",
    "log.hash.mismatch": "Hash passt NICHT, Schritt c",

    "bt.status.idle": "Pairing nicht gestartet.",
    "bt.lost": "Verbindung zum Board verloren.",
    "bt.starting": "Starte Pairing …",
    "bt.nopin": "Kein PIN empfangen.",
    "bt.window.left": "PIN am Smartphone eingeben, das Pairing-Fenster ist noch {n} s offen.",
    "bt.window.expired": "Pairing-Fenster abgelaufen. Mit „Pairing starten“ einen neuen PIN holen.",
    "bt.closed": "Verbindung getrennt. Der Bluetooth-Zustand am Board bleibt unverändert.",
    "bt.on.done": "Bluetooth eingeschaltet und gespeichert. Ist ein Smartphone verbunden, antwortet das Board nicht mehr über USB.",
    "bt.off.done": "Bluetooth ausgeschaltet und gespeichert. Das Board startet neu und sendet danach nicht mehr."
  },

  en: {
    "meta.desc": "Flash RNode Firmware CE (UttaraJālam) onto the Seeed XIAO nRF52840 + Wio-SX1262 right in your browser.",
    "sub": "Flash and set up RNode Firmware CE for the <strong>Seeed XIAO nRF52840 + Wio-SX1262</strong> right in your browser.",
    "nosupport": "<strong>This browser cannot flash over USB.</strong> Please use Chrome or Edge on a computer (Web Serial). Firefox and Safari are not supported.",

    "h.board": "1. Choose board",
    "board.eu.sub": "Product 0xEC · Model 0xEE",
    "board.433.sub": "Product 0xEC · Model 0xED",
    "board.h3.eu.sub": "Product 0xC1 · Model 0xCA · untested",
    "board.h3.433.sub": "Product 0xC1 · Model 0xC5 · untested",
    "board.xs3.eu.sub": "Product 0xEB · Model 0xDD · untested",
    "board.xs3.433.sub": "Product 0xEB · Model 0xDE · untested",
    "esp.s1": "Connect the board via USB. The page tries to switch to download mode by itself.",
    "esp.s2": "Click “Flash” and choose the board's port.",
    "esp.s3": "The page puts the board into update mode by itself, no button press is needed. If the connection fails, reconnect the USB cable (a data cable, not a charge-only cable) and click “Flash” again.",
    "confirm.full": "“Set up from scratch” erases the whole flash of the board (settings, identity). Continue?",
    "log.attempt": "Connecting with automatic reset",
    "log.notconn": "Not connected: {msg}",
    "err.noconn": "No connection to the chip. Reconnect the USB cable (a data cable, not a charge-only cable) and flash again.",
    "err.badzip": "The firmware package is missing {name}.",
    "log.nostart": "If the board does not start by itself: unplug USB briefly and plug it in again.",
    "log.noanswer.reset": "No answer, restarting the board once …",
    "log.waiting": "Waiting for the board … {s} s, {n} bytes received",
    "log.received": "Received from the board ({n} bytes, last output):\n{text}",
    "log.nothing": "(nothing)",
    "h.flash": "2. Flash",
    "mode.update": "Update",
    "mode.update.sub": "firmware only, settings and identity are kept",
    "mode.full": "Set up from scratch",
    "mode.full.sub": "new or empty node, erases everything",
    "flash.s1": "Connect the board via USB. No button press on the board is needed, the page switches it to update mode by itself.",
    "flash.s2": "Click “Flash” and choose the board's port.",
    "flash.s3": "Only the very first time, the browser asks for a second selection because the board shows up as a new USB device in update mode. Then click “Flash” again and choose the port.",
    "btn.flash": "Flash",

    "h.after": "3. After flashing",
    "after.update": "<strong>Update:</strong> only step c. The firmware hash changes with every new firmware and has to be set afterwards.",
    "after.full": "<strong>Set up from scratch:</strong> after the full flash only b (it sets the hash too). Step a only for a node that was used before. Each step asks for the port again because the board restarts in between.",
    "btn.wipe": "a. Erase EEPROM",
    "btn.provision": "b. Set up (EEPROM and hash)",
    "btn.hash": "c. Set firmware hash",
    "btn.inspect": "Check status",
    "after.note": "Erasing takes up to 30 seconds. No device signature is created here (like in rnode-flasher), so <code>rnodeconf</code> may report it as unverified.",

    "h.bt": "4. Bluetooth",
    "bt.intro": "Here you turn Bluetooth on the board on or off (the setting is stored in the board) and start pairing. “Start pairing” shows a PIN, and the board keeps the pairing window open for 35 seconds. During that time, search for the board on your smartphone and enter the PIN. While the page's USB connection is open, flashing and setup are locked.",
    "btn.bton": "Turn Bluetooth on",
    "btn.btoff": "Turn Bluetooth off",
    "btn.btpair": "Start pairing",
    "btn.btclose": "Close connection",
    "bt.pin.label": "Pairing PIN:",
    "bt.note": "“Turn Bluetooth off” restarts the board so that it stops transmitting at once, and stores “off”. “Turn Bluetooth on” stores “on”. “Start pairing” also turns Bluetooth on permanently if needed. “Close connection” only ends the page's USB connection. If a smartphone is connected to the board over Bluetooth, the board does not answer over USB. Then turn Bluetooth off on the smartphone or forget the board there. This firmware cannot delete paired devices on the board, that is only possible on the smartphone.",

    "h.log": "Log",
    "log.ready": "Ready.",
    "h.more": "More",
    "link.src": "Source code",
    "link.issues": "Report an issue",
    "footer": "GPL-3.0. The flasher uses code from <a href=\"https://github.com/liamcottle/rnode-flasher\">liamcottle/rnode-flasher</a> (MIT), see <a href=\"vendor/THIRD-PARTY.md\">THIRD-PARTY.md</a>. The firmware is built automatically for every state of <code>main</code>. Flash at your own risk.",

    "act.flash": "Flash (nRF52)",
    "act.wipe": "Erase EEPROM",
    "act.provision": "Set up EEPROM",
    "act.hash": "Set firmware hash",
    "act.inspect": "Check status",
    "act.btpair": "Start Bluetooth pairing",
    "act.btclose": "Close Bluetooth connection",
    "act.btoff": "Turn Bluetooth off",
    "act.bton": "Turn Bluetooth on",
    "what.readhash": "reading the firmware hash",

    "run.start": "→ {title}",
    "run.done": "✓ {title} done",
    "run.failed": "✗ {title} failed: {msg}",
    "run.noport": "No port selected, cancelled.",

    "fw.loading": "Loading firmware version …",
    "fw.info": "Firmware version: commit {commit}, built {built} UTC",
    "fw.unknown": "Firmware version unknown (manifest.json is missing).",

    "err.cancelled": "cancelled",
    "err.notfound": "{path} not found (HTTP {status}). Has the firmware been built yet?",
    "err.newid": "The board is in update mode but shows up under a new USB ID. Just once: click “Flash” again and choose the board's port. After that it works without a second selection.",
    "err.portopen": "The port cannot be opened.",
    "err.noanswer": "The selected device does not answer as an RNode. Is a smartphone or computer connected to the board over Bluetooth? Then the board only answers there and not over USB. Turn Bluetooth off on the smartphone (or forget the board there), reconnect the board and try again.",
    "err.nopin": "The board did not report a PIN. Is a smartphone already connected? Disconnect it there and start again.",
    "err.provisioned": "The EEPROM is already set up. Run step a (erase EEPROM) first.",
    "err.readback": "The values do not match when read back: {json}. Run step a (erase EEPROM) first, then b again.",
    "err.nodenoanswer": "The node does not answer to: {what}.",
    "err.nohash": "The node does not report a firmware hash yet. Reconnect the board and run step c.",
    "err.unreachable": "The node cannot be reached again after the restart{last}. Reconnect the board and run step c.",
    "err.openTimeout": "Timed out while opening.",
    "err.notprov": "The EEPROM is not set up. Run step b first.",
    "confirm.wipe": "This erases the node's EEPROM (device data and radio settings). Continue?",

    "log.dfu": "Putting the board into update mode …",
    "log.zip": "{name}: {n} bytes",
    "log.flashing": "Flashing …",
    "log.after.update": "Next: step 3 (set the firmware hash).",
    "log.after.full": "Next: step 3 (set the firmware hash, set up the EEPROM first).",
    "log.wiping": "Erasing the EEPROM, this takes up to 30 seconds …",
    "log.afterwipe": "Now reconnect the board briefly, then step b.",
    "log.readback": "Read back: product 0x{product}, model 0x{model}, checksum is correct.",
    "log.restarting": "Node is restarting, waiting for it …",
    "log.back": "Node is back, opening the connection …",
    "log.opening": "Opening …",
    "log.finished": "Done.",
    "log.hashsent": "Firmware hash sent ({hash} …) – the node restarts now.",
    "log.pin": "Bluetooth pairing PIN: {pin}",
    "log.btrestart": "Restarting the board so that Bluetooth is off at once …",
    "log.noeeprom": "EEPROM: not set up (info lock missing). Step b.",
    "log.eeprom": "EEPROM: {state}, product 0x{product}, model 0x{model}, hardware rev {rev}, serial no. {serial}",
    "log.eeprom.ok": "set up",
    "log.eeprom.bad": "checksum does NOT match",
    "log.checksum": "Checksum stored {stored}, calculated {calc}",
    "log.configured": "Configured: {value}",
    "yes": "yes",
    "no": "no",
    "log.hash.set": "Firmware hash set:    {hash}",
    "log.hash.actual": "Firmware hash actual: {hash}",
    "log.hash.match": "Hash matches",
    "log.hash.mismatch": "Hash does NOT match, step c",

    "bt.status.idle": "Pairing not started.",
    "bt.lost": "Connection to the board lost.",
    "bt.starting": "Starting pairing …",
    "bt.nopin": "No PIN received.",
    "bt.window.left": "Enter the PIN on your smartphone, the pairing window stays open for {n} more s.",
    "bt.window.expired": "Pairing window expired. Use “Start pairing” to get a new PIN.",
    "bt.closed": "Connection closed. The Bluetooth setting on the board is unchanged.",
    "bt.on.done": "Bluetooth turned on and stored. If a smartphone is connected, the board no longer answers over USB.",
    "bt.off.done": "Bluetooth turned off and stored. The board restarts and no longer transmits afterwards."
  },
};

let lang = "de";

export const getLang = () => lang;

export function detectLang() {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "de" || saved === "en") return saved;
  } catch (_) { /* Speicher gesperrt: Standard nehmen */ }
  return (navigator.language || "de").toLowerCase().startsWith("de") ? "de" : "en";
}

// Beim Start: gespeicherte oder Browser-Sprache nehmen, ohne sie zu speichern.
export function initLang() { lang = detectLang(); }

export function setLang(l) {
  lang = l === "en" ? "en" : "de";
  try { localStorage.setItem("lang", lang); } catch (_) { /* nicht schlimm */ }
}

export function t(key, params) {
  let s = (STR[lang] && STR[lang][key]) ?? STR.de[key] ?? key;
  if (params) for (const k of Object.keys(params)) s = s.split("{" + k + "}").join(String(params[k]));
  return s;
}

// Setzt alle statischen Texte der Seite in der gewählten Sprache.
export function applyStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", t("meta.desc"));
  document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
}

export const STRINGS = STR;
