import { defineField, defineType } from "sanity";

export const cloudinaryAssetType = defineType({
  name: "cloudinary.asset",
  title: "Cloudinary Asset",
  type: "object",
  fields: [
    defineField({
      name: "public_id",
      title: "Public ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "secure_url",
      title: "Secure URL",
      type: "url",
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
    }),
    defineField({
      name: "width",
      title: "Width",
      type: "number",
    }),
    defineField({
      name: "height",
      title: "Height",
      type: "number",
    }),
    defineField({
      name: "format",
      title: "Format",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "public_id",
      subtitle: "format",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Cloudinary asset",
        subtitle: subtitle ? `Format: ${subtitle}` : "Cloudinary image",
      };
    },
  },
});
