import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-[#0D0F12] border-t border-slate-800 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="favicon.png" alt="nextech" className="h-9 w-9" />
              <span className="font-serif font-bold text-xl tracking-tight bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">nextech</span>
            </Link>
            <p className="text-slate-400 max-w-sm">
              Your next-generation learning platform. Master skills, track progress, and unlock personalized courses with iGOT Karmayogi.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-slate-200">Legal</h3>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-orange-400 hover:to-pink-500 transition-all">About Us</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-orange-400 hover:to-pink-500 transition-all">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-orange-400 hover:to-pink-500 transition-all">Privacy Policy</Link></li>
              <li><Link href="/refund-cancellation" className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-orange-400 hover:to-pink-500 transition-all">Refund & Cancellation Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500 flex flex-col sm:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} nextech. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Crafted with passion for learners.</p>
        </div>
      </div>
    </footer>
  );
}
