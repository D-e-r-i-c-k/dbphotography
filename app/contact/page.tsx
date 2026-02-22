import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Contact | DB Photography",
  description:
    "Get in touch for bookings, print enquiries, or any questions about photography services in South Africa.",
};

export default function ContactPage() {
  return (
    <div className="animate-fade-in-up pt-[72px]">
      <div className="border-b border-[rgba(255,255,255,0.05)] py-14 bg-[#0C0E15]">
        <div className="mx-auto max-w-xl px-6">
          <p className="text-[0.65rem] font-semibold tracking-[0.3em] uppercase text-[#94B8D0] mb-3">Say Hello</p>
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">
            Get in Touch
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-xl px-6 py-12">
        <p className="mb-8 text-[0.92rem] text-muted-foreground">
          Whether you&apos;re looking for event coverage, want to purchase prints, or have
          a question — I&apos;d love to hear from you.
        </p>
        <ContactForm />
      </div>
    </div>
  );
}
