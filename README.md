# UttaraJālam (उत्तरजालम्)

RNode-Firmware für das **Seeed XIAO nRF52840 mit Wio-SX1262**, installierbar über einen Web-Flasher im Browser.
Das Projekt ist ein Fork der [RNode_Firmware_CE](https://github.com/liberatedsystems/RNode_Firmware_CE)
(Original-README: [README.CE.md](README.CE.md)). Der Node arbeitet als `RNodeInterface` unter
[Reticulum](https://reticulum.network).

## Status

Das Board läuft als RNode unter Reticulum. Die Funkparameter (Frequenz, Bandbreite, Spreading Factor, Sendeleistung)
stellt Reticulum ein, nicht der Flasher. Hardware-Messungen wie Sendeleistung und Reichweite sind noch nicht
durchgeführt.

## Hardware

| Parameter | Wert |
| :--- | :--- |
| Board-Modell | `0x53` (`BOARD_XIAO_NRF52840`) |
| Produkt | `0xEC` |
| Modelle | `0xED` (433 MHz, 410–525 MHz), `0xEE` (868/915 MHz, 850–950 MHz) |
| Applikations-Start | `0x27000` (SoftDevice S140 7.3.0) |
| Arduino-Pins | CS `D4`, SCK `D8`, MOSI `D10`, MISO `D9`, BUSY `D3`, DIO1 `D1`, RESET `D2`, RXEN `D5` |
| RF / TCXO | 1,8 V über `DIO3`, `DIO2` als TX-Switch |
| LEDs | RGB on-board, active low (RX grün, TX rot) |

## Web-Flasher

Der Flasher läuft in Chrome oder Edge (Web Serial) und liegt im Ordner `site/`. Er wird bei jedem Stand von `main`
mit frisch gebauter Firmware über GitHub Pages veröffentlicht:
<https://ffuhrnew.github.io/uttarajalam/>

1. Frequenzvariante wählen (`0xEE` für 868/915 MHz, `0xED` für 433 MHz) und **Flashen** klicken.
2. Beim ersten Mal das EEPROM einrichten: **a. EEPROM leeren**, USB trennen und wieder anstecken, dann
   **b. Einrichten (EEPROM und Hash)**. Bei einem reinen Firmware-Update genügt es, den Hash neu zu setzen.
3. Mit **Status prüfen** kontrollieren, ob EEPROM und Firmware-Hash stimmen.
4. Optional **Bluetooth**: „Bluetooth einschalten“ und „Bluetooth ausschalten“ speichern den Zustand im Board
   (nach dem Ausschalten startet die Seite das Board neu, damit es sofort nicht mehr sendet). „Pairing starten“
   zeigt einen PIN, der am Smartphone eingegeben wird; das Pairing-Fenster bleibt 35 Sekunden offen.

Die Seite gibt es auf Deutsch und Englisch, die Sprache wählst du oben rechts (voreingestellt nach der Browsersprache).

**Wichtig:** Ist ein Smartphone oder Computer per Bluetooth mit dem Board verbunden, antwortet die Firmware nur dort
und nicht mehr über USB. Dann melden weder der Web-Flasher noch `rnodeconf` eine Antwort. Abhilfe: Bluetooth am
Gerät ausschalten oder das Board dort vergessen und neu anstecken.

`rnodeconf --autoinstall` kennt das XIAO nRF52840 nicht; dafür ist der Web-Flasher gedacht.

## Selbst bauen

Das Repository-Verzeichnis muss `RNode_Firmware_CE` heißen (so erwartet es der Build):

```bash
make prep-index prep-xiao_nrf52840
make release-xiao_nrf52840
python3 release_hashes.py > Release/release.json
```

Manuelles Flashen des DFU-Pakets:

```bash
adafruit-nrfutil dfu serial --package Release/rnode_firmware_xiao_nrf52840.zip -p <PORT> -b 115200 -t 1200
```

Ein Release entsteht, wenn ein Tag gepusht wird, der genau der Firmware-Version aus `Config.h` entspricht
(zum Beispiel `1.75`). Der Workflow `.github/workflows/release.yml` veröffentlicht dann das DFU-Paket und
`release.json`.

## Lizenz

Dieses Projekt steht wie das Original unter der **GNU General Public License Version 3** oder, nach deiner Wahl,
einer späteren Version. Den Lizenztext enthält die Datei [LICENSE](LICENSE). Die Quelldateien tragen ihre
ursprünglichen Copyright-Hinweise.

Herkunft und Urheber:

- **RNode Firmware** von Mark Qvist: <https://github.com/markqvist/RNode_Firmware>
- **RNode Firmware Community Edition** von Liberated Embedded Systems und Mitwirkenden:
  <https://github.com/liberatedsystems/RNode_Firmware_CE>
- **XIAO nRF52840 Board-Unterstützung, Web-Flasher und Build** in diesem Repository: `ffuhrnew`
- `Radio.cpp` und `Radio.hpp` gehen auf die LoRa-Bibliothek von Sandeep Mistry zurück und stehen unter der
  **MIT-Lizenz** (Hinweis im Dateikopf).
- Der Web-Flasher in `site/` verwendet Code von
  [liamcottle/rnode-flasher](https://github.com/liamcottle/rnode-flasher) (**MIT**, siehe
  [site/vendor/LICENSE-rnode-flasher.txt](site/vendor/LICENSE-rnode-flasher.txt)) sowie zip.js und CryptoJS.
  Einzelheiten stehen in [site/vendor/THIRD-PARTY.md](site/vendor/THIRD-PARTY.md).

Es gibt keine Gewährleistung. Flashen geschieht auf eigene Gefahr. Der Funkbetrieb ist nur im Rahmen der örtlichen
Vorschriften zu Frequenz, Sendeleistung und Sendedauer erlaubt.
