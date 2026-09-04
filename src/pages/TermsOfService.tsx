import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </Link>

      <div className="bg-card border border-card-border rounded-xl p-8 md:p-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: July 2026</p>

        <div className="prose prose-slate max-w-none text-sm text-muted-foreground space-y-6">
          <p className="text-base text-foreground font-medium">
            By accessing or using OK School, you agree to follow and be bound by these Terms of Service. Please read them carefully before using our file sharing, document downloading, or mock test hosting services.
          </p>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              1. Account Security
            </h2>
            <p>
              You are responsible for keeping your login credentials secure. You are legally liable for all activity and file uploads that occur under your user account.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              2. Acceptable Use and Hosting Rules
            </h2>
            <p>
              OK School allows users to host and share mock tests, notes, and website projects. You strictly agree NOT to upload, share, or host:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Copyrighted materials that you do not own the rights to.</li>
              <li>Malware, viruses, or malicious scripts.</li>
              <li>Illegal, offensive, or harmful content.</li>
            </ul>
            <p className="mt-3">
              Abusing our hosting resources or bandwidth will result in immediate account termination.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              3. Payments and Content Delivery
            </h2>
            <p>
              While mock tests, PDFs, and notes are generally free, specific premium Word files require a small fee. All payments are processed through Razorpay. Paid digital downloads are delivered immediately online or via download link upon successful confirmation of payment.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              4. Cancellation and Refund Policy
            </h2>
            <p>
              Due to the digital nature of premium Word files and immediate content delivery, all sales are final. We do not offer cancellations or refunds once a download link has been generated. If you face a technical error or double-deduction during your checkout process via Razorpay, please reach out to our support team with your transaction ID for a manual resolution.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              5. Limitation of Liability
            </h2>
            <p>
              OK School is provided on an "as-is" and "as-available" basis. While we strive to protect your data, we do not guarantee uninterrupted server uptime or zero data loss. We are not liable for any disruptions, server downtime, or loss of hosted mock tests caused by our underlying infrastructure providers.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              6. Termination Clause
            </h2>
            <p>
              We reserve the right to suspend, restrict, or completely delete your account at our sole discretion, without prior notice, if you violate any part of these terms.
            </p>
          </section>

          <div className="pt-6 border-t border-card-border text-center">
            <p className="text-sm text-muted-foreground mb-2">Want to learn more about us?</p>
            <Link href="/about" className="text-primary hover:underline font-medium">About OK School</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
