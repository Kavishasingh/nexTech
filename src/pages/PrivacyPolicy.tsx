import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </Link>

      <div className="bg-card border border-card-border rounded-xl p-8 md:p-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: July 2026</p>

        <div className="prose prose-slate max-w-none text-sm text-muted-foreground space-y-6">
          <p className="text-base text-foreground font-medium">
            Welcome to OK School. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website, download our materials, or use our mock test hosting and sharing features.
          </p>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              1. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium text-foreground">Account Information:</span> When you register, we collect your name, email address, phone number, and account credentials.
              </li>
              <li>
                <span className="font-medium text-foreground">User-Generated Content:</span> We store the mock tests, documents, notes, and website projects you upload, host, or share on our platform.
              </li>
              <li>
                <span className="font-medium text-foreground">Payment Information:</span> When you make a purchase for premium Word documents, your payment is processed securely via our payment gateway partner, Razorpay. We do not store or copy your sensitive financial information (such as credit card details, CVV, or net banking credentials) on our local servers.
              </li>
              <li>
                <span className="font-medium text-foreground">Technical Log Data:</span> Our hosting servers automatically log standard information, including your IP address, browser type, and operating system, to ensure site stability and security.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              We use your data to maintain your account, deliver downloaded files, securely process your payments via Razorpay, and host the mock tests you choose to share with the community.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              3. Third-Party Services
            </h2>
            <p>
              We share necessary details only with trusted infrastructure providers, such as Razorpay (for handling payment transactions) and our server hosting networks, to keep the platform operational. We never sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-3">
              4. Data Deletion and Your Rights
            </h2>
            <p>
              You retain ownership of your uploaded files. You can update your profile information or request the permanent deletion of your account and files at any time by contacting our support team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
