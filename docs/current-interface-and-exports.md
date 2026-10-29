# Current interface and file exports

Updated October 26, 2026 for **27.0.0 (development)**. The active catalogue has 47 entries: 45 internal tools and two external games. My system info, What is my IP and the empty System category have been removed from the catalogue, docs, sitemap and routing configuration.

## Saving a file

1. Provide input, choose settings and request a downloadable export.
2. Once the file is ready, keep or edit its suggested name in the save dialog. The extension follows the generated format; Persian and other Unicode names are supported.
3. Select **Save file** to hand the file to the browser, or **Cancel** to close without starting a download. The browser controls the final location and any operating-system save prompt.

There is no filename panel above tool pages. Pending exports stay in memory and are cancelled when navigating away. Code-editor files connected to disk keep the editor's own save controls. Pinned-tool backups keep their existing export dialog.

## Inline status

| Operation | Location and meaning |
| --- | --- |
| Reading a selected file | Beside input controls; a local read, not a server upload |
| Receiving a model, engine or requested resource | Beside the relevant controls; received/total bytes when known and transfer speed while running |
| Processing | A separate short inline message for running, completed, cancelled or failed processing |
| Saving generated output | Beside output controls; confirms handoff to the browser, not a completed disk write |

The floating activity-history panel has been removed. Unknown totals use indeterminate progress. Finished notices expire; errors remain visible longer. Internal Blob reads are not shown as new user-file uploads. Resource caches contain public engines/models, not user input.

## Navigation and accessibility

The header floats away from the viewport edges and uses a theme-aware translucent surface with backdrop blur. Text, inputs, cards and visible keyboard focus follow shared light/dark tokens. Persian UI uses the supplied Persian font; English UI retains Latin digits. Cards, filters and layout controls adapt to narrow viewports.

The save dialog selects the suggested filename, traps focus, blocks background scrolling and supports Escape. Closing restores focus to the initiating control. Text-file import uses a native button with Enter support. Reduced-motion preferences and the reduced-transparency header fallback are retained.

## Developer integration

Use `saveFile(blob, suggestedName, mime?)` from `src/lib/file-export.ts`, or `saveText(...)` from `src/lib/transfer.ts`, for downloadable output. The returned promise resolves to `true` after confirmation or `false` on cancellation. Anchor/downloadjs paths, XLSX serialization and PDF Blob generation feed this flow. Native download initiation belongs in `downloadExport`, after confirmation.

`ExportDialog` mounts once in `SiteLayout`. `ActivityCenter` now routes inline notices to the initiating controls. `activity-origin.ts` scopes notices to the current route and retains nearby placement if controls are replaced. `OutputNameSettings` is a compatibility no-op with no visible panel.

Registry entries drive the catalogue, categories, sitemap and Apache configuration. In-app documentation contains one entry per active tool, with duplicate guides merged, missing entries filled and links taken from the registry. Retired IDs are filtered from loaded/imported pins. Retired localized, legacy and Markdown URLs were checked for HTTP 404 locally. Static-export development mode allows those parameters to reach the category's not-found guard; production category exports include active categories only.

## Verification and limits

```text
node scripts/verify-documentation.mjs
node scripts/verify-interface.mjs
node scripts/verify-ui-contrast.mjs
node scripts/verify-output-names.mjs
node scripts/verify-export-flow.mjs
node scripts/verify-processing.mjs
```

Targeted browser checks covered Persian/English home views, search and filters, representative text/image/JSON tools, filename editing and cancellation, a real Markdown download with verified contents, keyboard file import, inline notices, focus restoration and narrow layouts. Contrast checks cover 52 text/control/header combinations, including the glass header against its worst-case background.

These checks do not recertify all interactions in all 47 entries. Full-project TypeScript retains 32 pre-existing diagnostics with no additional diagnostics from these changes. A successful production build is not recorded for this revision. Apache HTTP checks require a running server; port 4186 was unavailable. Rebuild and verify the complete `out/` before publishing.
