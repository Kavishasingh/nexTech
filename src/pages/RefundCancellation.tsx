import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export function RefundCancellation() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </Link>

      <div className="bg-card border border-card-border rounded-xl p-8 md:p-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
          Cancellation & Refund Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: July 2026</p>

        <div className="prose prose-slate max-w-none text-sm text-muted-foreground space-y-6">
          <p className="text-base text-foreground font-medium">
            Thank you for choosing OkSchool. We strive to provide the best study resources, mock tests, and educational materials for Indian students.
          </p>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              No Cancellations
            </h2>
            <p>
              Due to the digital nature of our products, services, and study materials, orders cannot be cancelled once access or downloading capabilities have been granted.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              Refund Eligibility
            </h2>
            <p>
              Because our study materials, notes, and test series are digital products delivered instantly online, all sales are final. We do not offer refunds, returns, or exchanges once a transaction is successfully completed.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              Technical Issues
            </h2>
            <p>
              If you experience any technical difficulties or face issues accessing your purchased content after a successful payment, please contact our support team immediately at <span className="text-foreground font-medium">support@okschool.in</span>. We will resolve the issue and ensure access is restored within 24 to 48 hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
