# SIAT Component Builder

Build interactive components for the SIAT website, then paste them into SFU's AEM through an **HTML component**. Nothing to install for editors: open the builder, pick a component, edit, and copy.

## For the website editor

1. **Pick** a component on the left: Split Gallery, Hero / Carousel, Image Hover Reveal, Card Grid, Stats, Accordion, Tabs, or Custom Block.
2. **Edit:**
   - Click anything in the preview to jump to its settings.
   - Double-click text to type in place.
   - Drag items in the preview or the panel to reorder them.
   - Drop image files onto images to preview them.
3. **Style:** use the **Style** tab for variants, theme, colours, corners and width, and the **Motion** tab for entrance animations, hover effects and component behaviour.
4. **Check** each size with the toolbar icons (Full, Column, Tablet, Phone) or drag the frame edges. Turn on **Live SFU CSS** to see it with sfu.ca's real stylesheet.
5. **Export:** copy the HTML. In AEM, add an **HTML** component, click Edit, paste and save.
6. **Images:** upload them to AEM Assets and paste their `/content/dam/…` path into the image field. Dropped files only show in the preview, and Export will warn you.
7. **Edit later:** keep "Include edit data" on when you export. Then **Open** (folder icon) and paste the snippet back in. **Saved** (bookmark icon) keeps named versions in this browser.

## For developers

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # contract tests for every component
npm run build      # static site in dist/
```

- **Add a component:** `npm run new:component -- my-thing "My Thing"`, then follow [docs/ADDING_A_COMPONENT.md](docs/ADDING_A_COMPONENT.md). An agent can do this from that doc plus [CLAUDE.md](CLAUDE.md).
- **Deploy:** the output is a static folder.
  - **GitHub Pages:** push to `main`; `.github/workflows/deploy.yml` builds with `BASE_PATH=/<repo>/`.
  - **Vercel or Netlify:** build command `npm run build`, output directory `dist`.
