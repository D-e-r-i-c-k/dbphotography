import Link from "next/link";
import { CartContents } from "./CartContents";

export const metadata = {
  title: "Cart | DB Photography",
  description: "Your selected photos. Proceed to checkout to purchase.",
};

export default function CartPage() {
  return (
    <div className="animate-fade-in-up pt-[72px]">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/galleries"
          className="mb-8 inline-block text-[0.8rem] text-muted-foreground transition-colors hover:text-ice"
        >
          ← Continue shopping
        </Link>
        <h1 className="font-display mb-8 text-3xl text-foreground sm:text-4xl">
          Your Cart
        </h1>
        <CartContents />
      </div>
    </div>
  );
}
