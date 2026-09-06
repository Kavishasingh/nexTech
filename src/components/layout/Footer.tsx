import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="nextech-logo.png" alt="nextech" className="h-9 w-9" />
              <span className="font-serif font-bold text-xl tracking-tight text-[#1E3A8A]">nextech</span>
            </Link>
            <p className="text-slate-600 max-w-sm">
              Your next-generation learning platform. Master skills, track progress, and unlock personalized courses with iGOT Karmayogi.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-[#1E3A8A]">Legal</h3>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-600">
              <li><Link href="/about" className="hover:text-[#1E40AF] transition-colors">About Us</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-[#1E40AF] transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-[#1E40AF] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund-cancellation" className="hover:text-[#1E40AF] transition-colors">Refund & Cancellation Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 mt-12 pt-8 text-center text-sm text-slate-500 flex flex-col sm:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} nextech. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Crafted with passion for learners.</p>
        </div>
      </div>
    </footer>
  );
}
