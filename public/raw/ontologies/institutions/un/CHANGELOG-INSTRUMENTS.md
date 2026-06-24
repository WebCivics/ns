# UN Instruments Changelog

This ledger tracks the addition, modification, or deprecation of the machine-readable United Nations human rights instruments within the `un-instruments/` directory.

All changes to this directory **MUST** be accompanied by executing `scripts/Generate-Manifest.ps1` to mathematically re-bind the graph constraints in `qualiaDB`.

---

## [0.0.1-init] - 2026-06-23

### Added
- **Initial Corpus Ingestion:** Ingested 101 foundational UN human rights and humanitarian law instruments.
- **Instrument Types:** Includes the core covenants (UDHR, ICCPR, ICESCR), treaties on vulnerable groups (CRPD, CRC), conventions against torture and discrimination (CAT, ICERD), and international humanitarian law (Geneva Conventions).
- **Manifest Generation:** Built the initial `MANIFEST.n3` using SHA-256 version pinning to cryptographically bind the instruments to the Webizen Charter.

### Changed
- **Manifest Generator Hardening:** Sorted instrument enumeration by filename for stable output and added generation-method metadata to `MANIFEST.n3`.
