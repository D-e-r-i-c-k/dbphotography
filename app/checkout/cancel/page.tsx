import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Payment Cancelled | DB Photography",
    description: "Your payment was cancelled.",
};

export default function CheckoutCancelPage() {
    return (
        <div className="animate-fade-in-up mx-auto flex max-w-lg flex-col items-center px-6 py-20 pt-[92px] text-center">
            <XCircle className="h-16 w-16 text-muted-foreground" />
            <h1 className="font-display mt-6 text-3xl font-semibold tracking-tight text-foreground">
                Payment cancelled
            </h1>
            <p className="mt-4 text-muted-foreground">
                Your payment was not completed. No charges were made.
            </p>
            <div className="mt-8 flex gap-4">
                <Button asChild>
                    <Link href="/cart">Return to cart</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/galleries">Browse galleries</Link>
                </Button>
            </div>
        </div>
    );
}
