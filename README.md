# UttaraJālam (उत्तरजालम्)

RNode-Firmware für **Seeed XIAO nRF52840 + Wio-SX1262** (Fork von RNode_Firmware_CE, GPL-3.0; Original als `README.CE.md`).

## Hardware-Parameter

| Parameter | Wert |
| :--- | :--- |
| Board-Modell | `0x53` (`BOARD_XIAO_NRF52840`) |
| Produkt | `0xEC` |
| Frequenzbänder | `0xED` (410–525 MHz), `0xEE` (850–950 MHz) |
| Applikations-Start | `0x27000` (SoftDevice S140 7.3.0) |
| Arduino-Pins | CS `D4`, SCK `D8`, MOSI `D10`, MISO `D9`, BUSY `D3`, DIO1 `D1`, RESET `D2`, RXEN `D5` |
| RF / TCXO | 1.8V via `DIO3`, `DIO2` als TX-Switch |
| LEDs | RGB On-Board (active low: RX=grün, TX=rot) |

## Web-Serial-Flasher (Chrome/Edge via `site/`)

1. Frequenz wählen (`0xEE` bzw. `0xED`) und **Flashen** klicken.
2. EEPROM initialisieren: **a. EEPROM leeren** -> USB trennen/verbinden -> **b. Einrichten (EEPROM und Hash)**.
3. Mit **Status prüfen** verifizieren.

## CLI-Build

Das Repository-Verzeichnis muss `RNode_Firmware_CE` heißen:

```bash
make prep-index prep-xiao_nrf52840
make release-xiao_nrf52840
python3 release_hashes.py > Release/release.json
```

Manuelles DFU-Flashen:
```bash
adafruit-nrfutil dfu serial --package Release/rnode_firmware_xiao_nrf52840.zip -p <PORT> -b 115200 -t 1200
```
