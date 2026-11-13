# UttaraJālam (उत्तरजालम्, "northern network")

RNode modem firmware for the **Seeed XIAO nRF52840 + Wio-SX1262** kit, installable with
`rnodeconf`. Fork of [RNode_Firmware_CE](https://github.com/liberatedsystems/RNode_Firmware_CE)
(GPL-3.0); the original README is kept as [README.CE.md](README.CE.md).

## Board

| | |
|---|---|
| Board model | `0x53` (`BOARD_XIAO_NRF52840`) |
| Product | `0xEC` |
| Models | `0xED` 433 MHz, `0xEE` 868/915 MHz |
| Radio pins (Arduino numbers) | CS D4, SCK D8, MOSI D10, MISO D9, BUSY D3, DIO1 D1, RESET D2, RXEN D5 |
| TCXO / RF switch | 1.8 V via DIO3, DIO2 as TX switch |
| LEDs | on-board RGB, active low (RX green, TX red) |

## Build

    make prep-index prep-xiao_nrf52840
    make release-xiao_nrf52840      # writes Release/rnode_firmware_xiao_nrf52840.zip (DFU package)
    python3 release_hashes.py > Release/release.json

Pushing a tag equal to the firmware version (for example `1.75`) builds and publishes both
files as a GitHub release (`.github/workflows/release.yml`).

## Install

The XIAO is flashed with `adafruit-nrfutil dfu serial --package <zip> -t 1200`
(1200-baud touch, then serial DFU).

`rnodeconf --autoinstall --fw-url https://github.com/ffuhrnew/uttarajalam/releases/`
only offers the 16 built-in device types, so the XIAO nRF52840 is not in its menu yet.
See [HANDOVER.md](HANDOVER.md) for the open work on that.

## Status

Early. The board definition compiles in a header-level check only; no hardware test yet.
