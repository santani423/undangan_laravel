# Sample invitation assets

Source files for `SampleInvitationSeeder`. On every seed run they are copied to
the `public` disk under `sample-invitations/` (served via `/storage/...`), so
the demo invitations never depend on external URLs.

- `{type}/*.jpg`: photos resized to max 800px. They come from
  [StockSnap.io](https://stocksnap.io), which publishes under CC0 (free for
  commercial use, no attribution needed).
- `music.mp3`: the background track bundled with the project's wedding themes.
- `qris-sample.png`: QR code that only encodes the text "CONTOH QRIS UNDESIA".
  It is **not** a payment code.

The folder and file prefix decide how the seeder uses each photo. For example,
`wedding/groom-*` is the groom portrait, `*/moment-*` goes to the gallery and
stories, and `birthday/child-*` is the profile photo. If you add files that
follow the same naming, the seeder picks them up without code changes.
