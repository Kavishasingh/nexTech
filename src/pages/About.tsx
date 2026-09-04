import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export function About() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </Link>

      <div className="bg-card border border-card-border rounded-xl p-8 md:p-12">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
          About OK School
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: July 2026</p>

        <div className="prose prose-slate max-w-none text-sm text-muted-foreground space-y-6">
          <p className="text-base text-foreground font-medium">
            The name OK School might sound a bit satirical or humorous, but our mission is entirely serious.
          </p>

          <p>
            Our founder spent 14 years going through the traditional schooling system. Throughout that entire journey, one frustrating truth became clear: finding good, satisfactory, and accessible study resources was way harder than it should be. The system felt outdated, and the best materials were locked behind steep paywalls. OK School was built to break those barriers down.
          </p>

          <p>
            We designed this platform specifically for students who want to excel without draining their pockets. Here, you can find free PDFs, notes, and website projects, alongside interactive tools where you can host, build, and share your own mock tests with other students across the globe.
          </p>

          <p>
            Our philosophy on pricing is simple: school shouldn't cost a fortune. The vast majority of our resources are 100% free. On the rare occasion that we do charge for premium Word files or materials, the cost is set to an absolute bare minimum—literally less than what you would spend on a single day's junk food.
          </p>

          <p className="text-base text-foreground font-medium">
            Welcome to OK School, where the resources are great, the prices are practical, and the power is handed right back to the students.
          </p>
        </div>
      </div>
    </div>
  );
}
