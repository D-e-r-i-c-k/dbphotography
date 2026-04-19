import { defineField, defineType } from "sanity";

export const siteConfigType = defineType({
  name: "siteConfig",
  title: "Site configuration",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "home", title: "Home page" },
    { name: "testimonial", title: "Testimonial" },
    { name: "general", title: "General" },
  ],
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site title",
      type: "string",
      group: "general",
      initialValue: "DB Photography",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      group: "hero",
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero headline",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroSubheadline",
      title: "Hero subheadline",
      type: "text",
      group: "hero",
    }),
    defineField({
      name: "featuredGallery",
      title: "Featured gallery (home)",
      type: "reference",
      to: [{ type: "gallery" }],
      group: "home",
    }),
    defineField({
      name: "testimonialQuote",
      title: "Quote text",
      type: "text",
      group: "testimonial",
      description: "The testimonial quote to display on the homepage.",
    }),
    defineField({
      name: "testimonialAuthor",
      title: "Author name",
      type: "string",
      group: "testimonial",
      description: 'e.g. "Lana M."',
    }),
    defineField({
      name: "testimonialDetail",
      title: "Author detail",
      type: "string",
      group: "testimonial",
      description: 'e.g. "Bride, Franschhoek Estate Wedding"',
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site configuration" };
    },
  },
});
