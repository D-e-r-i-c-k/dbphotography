# True Cloudinary Photography Workflow

I completely understand the problem. Even with the Cloudinary plugin installed in Sanity, **having to manually click and select 600 individual photos in Sanity Studio is still too slow for a professional photography workflow.**

To achieve a "full switch", we need to remove Sanity from the *image management process entirely*, and use it only for *text and routing*.

This plan will shift your website to a **Folder-Based Sync Architecture**. You will simply drop 600 photos into a Cloudinary folder, and the website will automatically pull them all into the gallery.

## The New Workflow (What You Will Do)

Once this plan is executed, your workflow for a new gallery will be:
1. **Upload**: Open the Cloudinary App. Create a folder (e.g., `galleries/wedding-2026`) and drag-and-drop your 600 photos.
2. **Setup**: Open Sanity Studio. Create a Wedding Gallery document.
3. **Link**: Instead of clicking "Add Image" 600 times, you will just see one text box called `Cloudinary Folder Name`. You simply type `galleries/wedding-2026` into it and click Publish.
4. **Done**: The Next.js website will automatically talk to the Cloudinary API, grab all 600 photos from that folder, and display them instantly.

---

## Technical Proposed Changes

### Dependencies
#### [MODIFY] package.json
- Install the official `cloudinary` Node.js library. We need this to use the Cloudinary Admin/Search API on the server to look up folders.

---

### Sanity Studio Configuration
#### [MODIFY] sanity/schema/gallery.ts
- Delete the large `images` array field. You will never select individual images in Sanity again.
- Add a new string field `cloudinaryFolder` (e.g., "Folder path in Cloudinary").
- **Note on Covers**: We will keep the `coverImage` field so you can pick *one* hero image to represent the gallery on the homepage, but the inner contents are pure Cloudinary.

#### [MODIFY] sanity/sanity.config.ts & package.json
- We can actually *remove* the `sanity-plugin-cloudinary` from the galleries completely if we want to, but we'll leave it just for picking the `coverImage`.

---

### Frontend E-commerce & Types
#### [MODIFY] lib/sanity/types.ts & lib/sanity/queries.ts
- Update the types and GROQ queries. We are no longer querying an `images` array from Sanity. We only query `cloudinaryFolder`.

#### [MODIFY] lib/cloudinary.ts (NEW)
- Create a server-side utility that securely connects to the Cloudinary API.
- Create a function `fetchImagesFromFolder(folderPath: string)` that searches Cloudinary and returns a list of image objects (resolving their public_ids, widths, heights, and formats).

#### [MODIFY] app/galleries/[slug]/page.tsx
- In the Next.js Server Component, we will first fetch the Sanity document to get the text metadata and the `cloudinaryFolder` string.
- Then, we call `fetchImagesFromFolder(gallery.cloudinaryFolder)`.
- We map those directly into the masonry grid. All 600 photos will load automatically without any further Sanity input.

#### [MODIFY] app/api/checkout/route.ts
- Refactor the e-commerce logic. Currently, it tries to match cart items against the Sanity `images` array. We will update it to verify the selected image `public_id` directly against Cloudinary's folder contents to ensure the item isn't spoofed.

---

## User Review Required

> [!CAUTION]
> **Captions and Individual Prices:** Because we are pulling the raw photos directly from a Cloudinary folder automatically, we lose the ability to set *individual captions* or *custom individual prices* via the Sanity UI (because the images aren't in Sanity anymore).
> - **Prices**: All photos in the gallery will use the `defaultPrice` set on the Sanity Gallery document.
> - **Captions**: If you want captions, we can configure Next.js to read the original filename (e.g. `DSC001.jpg`) or the Title metadata directly embedded in the file, but you won't type captions into Sanity.
>
> **Does this limitation work for your photography business?**

> [!IMPORTANT]
> **API Keys Required**: The Cloudinary Search API requires strict authentication. You must have your `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` ready to put into `.env.local` to make this folder-syncing work securely on the backend.

If you are ready for this massive workflow improvement and accept the captions/pricing behavior, reply **"Approve"** and we will execute the switch!
