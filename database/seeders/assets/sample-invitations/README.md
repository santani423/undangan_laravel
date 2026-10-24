# Sample invitation assets

Source files for `SampleInvitationSeeder`. On every seed run they are copied to
the `public` disk under `sample-invitations/` (served via `/storage/...`), so
the demo invitations never depend on external URLs.

- `{type}/*.jpg`: photos resized to max 800px. They come from
  [StockSnap.io](https://stocksnap.io), which publishes under CC0 (free for
  commercial use, no attribution needed).
- `music.mp3`: the background track bundled with the project's wedding themes.
  Birthday samples don't use it: they leave the music empty and play the
  default `public/audio/birthday-default.mp3` (see `App\Support\InvitationMusic`).
- `qris-sample.png`: QR code that only encodes the text "CONTOH QRIS UNDESIA".
  It is **not** a payment code.

The folder and file prefix decide how the seeder uses each photo. For example,
`wedding/groom-*` is the groom portrait, `*/moment-*` goes to the gallery and
stories, and `birthday/child-*` is the profile photo. If you add files that
follow the same naming, the seeder picks them up without code changes.

A folder named after a theme slug (for example `wedding_theme_14/`) holds that
theme's own artwork. It sits outside the shared pools and is only used where
`WeddingThemeSampleData` lists it under the theme's `photos` key. The
`wedding_theme_14` files are flat illustrations made for this project (bride in
paes ageng, groom in blangkon & beskap, Yogyakarta scenes). They are not stock
photos.

`BirthdayThemeSampleData` has no folders of its own: for each birthday theme it
names files from the shared `birthday/` pool (profile photo, then the gallery
and story order). Renaming or removing a file there breaks those samples.
