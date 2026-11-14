# Third-party code in this folder

Taken from https://github.com/liamcottle/rnode-flasher (MIT, Copyright (c) 2024 Liam Cottle,
see `LICENSE-rnode-flasher.txt`). Only `rnode.js` was changed (two spots, marked `UttaraJālam:` in the code);
the other files are unmodified:

- `rnode.js` (RNode KISS protocol and EEPROM handling; hook `RNode.rawTap` for diagnostics; frame parser resyncs on every FEND)
- `nrf52_dfu_flasher.js` (Web Serial port of `adafruit-nrfutil dfu serial`)
- `zip.min.js` (zip.js, bundles pako: MIT AND Zlib)
- `crypto-js/` (CryptoJS 3.9.1, MD5 part)
- `esptool-js/bundle.js` (esptool-js 0.4.5 by Espressif, MIT/Apache-2.0 per upstream; used to flash ESP32 boards)

The licenses of zip.js, esptool-js and CryptoJS are those of their upstream projects.
