import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export function ShippingDelivery() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </Link>

      <div className="bg-card border border-card-border rounded-xl p-8 md:p-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
          Shipping & Delivery Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: July 2026</p>

        <div className="prose prose-slate max-w-none text-sm text-muted-foreground space-y-6">
          <p className="text-base text-foreground font-medium">
            OkSchool provides digital educational resources, including online mock tests, digital notes, and study materials. We do not ship physical products.
          </p>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              Digital Delivery Only
            </h2>
            <p>
              All products sold on this website are strictly digital goods. No physical shipping, courier, or tracking number is applicable.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              Instant Access
            </h2>
            <p>
              Upon successful payment validation via our payment gateway, access to your purchased materials, test series, or premium sections will be granted immediately. You can access them directly through your account dashboard or via the email confirmation sent to your registered email address.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              Delivery Timeline
            </h2>
            <p>
              Digital delivery is instant. In case of rare server delays or network latency, access may take up to a maximum of 2 hours. If you do not receive access within this timeframe, please reach out to <span className="text-foreground font-medium">support@okschool.in</span> for manual verification.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
