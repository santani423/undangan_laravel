# Gallery

`memory-01.svg` … `memory-06.svg` and `portrait-kirana.svg` are **illustrated placeholders**. They are composed from the asset pack illustrations by `npm run generate:gallery`.

Replace them with real photos (JPG/PNG/WebP, landscape 4:3 works best; the portrait is shown as a circle):

- Gallery: edit `src/data/gallery.ts` (`src`, `alt`, `caption`) and remove `demo: true`.
- Portrait: set `child.portrait` in `src/config/invitation.config.ts`.

If a photo fails to load, the invitation shows the toy-blocks illustration instead.
