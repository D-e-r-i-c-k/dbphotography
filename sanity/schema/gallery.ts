import { defineArrayMember, defineField, defineType } from "sanity";

export const galleryType = defineType({
  name: "gallery",
  title: "Gallery",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "event",
      title: "Event",
      type: "reference",
      to: [{ type: "event" }],
    }),
    defineField({
      name: "featured",
      title: "Featured on home",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "defaultPrice",
      title: "Default price per photo (ZAR)",
      type: "number",
      initialValue: 20,
      description: "Applied to all photos in this gallery.",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "cloudinary.asset",
      description: "Select the featured image for the gallery card.",
    }),
    defineField({
      name: "coverIndex",
      title: "Cover image index (0 = first)",
      type: "number",
      description: "Zero-based index to select which image in the Cloudinary folder will be used as the cover image. After changing this, run the Cloudinary → Sanity sync to apply.",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "cloudinaryFolder",
      title: "Cloudinary Folder Name",
      type: "string",
      description: "The exact folder path in Cloudinary (e.g. 'galleries/wedding-2026'). All photos in this folder will be synced automatically.",
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    { title: "Title A–Z", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
    { title: "Title Z–A", name: "titleDesc", by: [{ field: "title", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", event: "event.title", media: "coverImage", folder: "cloudinaryFolder", index: "coverIndex" },
    prepare({ title, event, media, folder, index }) {
      return {
        title: title || "Untitled gallery",
        subtitle: (event ? `Event: ${event}` : "") + (folder ? ` | Folder: ${folder}` : "") + (typeof index === "number" ? ` | cover:${index}` : ""),
        media,
      };
    },
  },
});
