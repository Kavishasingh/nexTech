import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";

export function Contact() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </Link>

      <div className="bg-card border border-card-border rounded-xl p-8 md:p-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
          Contact Us
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: July 2026</p>

        <div className="prose prose-slate max-w-none text-sm text-muted-foreground space-y-6">
          <p className="text-base text-foreground font-medium">
            Have questions, feedback, or need support? We're here to help.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-foreground font-medium mb-1">
                <Mail className="h-4 w-4 text-primary" />
                <span>Email</span>
              </div>
              <p>support@okschool.in</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-foreground font-medium mb-1">
                <Phone className="h-4 w-4 text-primary" />
                <span>Phone</span>
              </div>
              <p>+91 98765 43210</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 sm:col-span-2">
              <div className="flex items-center gap-2 text-foreground font-medium mb-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Registered Address</span>
              </div>
              <p>OkSchool, 123 Education Lane, Tech Park, Bengaluru, Karnataka - 560001, India</p>
            </div>
          </div>

          <p>
            For payment-related issues, please include your Razorpay transaction ID in the email. We typically respond within 24–48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
