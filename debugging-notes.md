# Debugging Notes

## 2026-05-22 — Image attachments lost their `src` after save

### Symptom
Upload an image into a note. It renders in the editor immediately. Reload the page → the image is gone. No `<img>` element in the DOM at all.

### Diagnostic path
1. **Checked the DB.** `notes.content` JSON for the affected row had the image node with `type: "image"` but no `src` in `attrs`. So the symptom was real, not a render-side artifact.
2. **Checked `editor.getJSON()` right after `setImage({src: url})`.** The returned tree had the full `src`. So TipTap was holding it correctly in memory.
3. **Suspected the upload helper.** Logged `url` before `setImage`. It was the correct Supabase public URL. Eliminated.
4. **Checked the network payload for the save request.** Server action POST to the page URL. `attrs` field across the tree showed as the literal string `"$T"` instead of an object.

### Root cause
React Server Components / Next.js Server Actions serialize function arguments using the Flight protocol. Flight handles plain JSON-ish data, but when it hits an object it can't cleanly inline-encode (frozen object, shared reference, prototype goo, proxy), it substitutes a reference marker — in this case `"$T"`. The marker is meant to be resolved on the receiving side, but in this configuration it wasn't, so the server saw `"$T"` as the literal value for `attrs`. The image node arrived without its `src`.

The `JSON.parse(JSON.stringify(content))` call already existed in `actions/notes.ts` (with a comment about "breaking the RSC client-reference wrapper"), but it ran on the **server**, after Flight had already mangled the data. Too late.

### Fix
Deep-clone the editor JSON on the **client**, before it crosses the server-action boundary. The chokepoint chosen was the `save` function in `components/notes/NoteEditor.tsx`, since both autosave and manual save funnel through it.

```ts
const cleaned: JSONContent = JSON.parse(JSON.stringify(contentToSave));
const result = await saveNote(noteId, title, cleaned, { createVersion });
```

The server-side clone in `actions/notes.ts` could be removed — it's now redundant — but it's harmless and a good defensive layer to keep.

### Verification
After fix: payload's `attrs` shows real objects with `src` instead of `"$T"`. Reloading the page renders the image.

### What I'd do differently
- Read existing comments before assuming code is wrong for unknown reasons. The `// Break the RSC client-reference wrapper` comment in `actions/notes.ts` was a direct pointer to the right problem, just applied at the wrong layer.
- When debugging "data is missing," walk the data from source to destination and check at every boundary. The fix took 10 seconds; finding *which* boundary corrupted the data took hours.

### Open questions
- Why exactly does TipTap's `getJSON()` output trip Flight's reference encoder? The objects look plain in DevTools. Most likely candidates: shared `attrs` instances across nodes (Flight dedupes), or `Object.freeze` on attrs. Didn't dig further once the fix worked, but worth knowing if it recurs.
