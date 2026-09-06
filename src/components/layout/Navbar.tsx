import { Link } from "wouter";
import { Menu, Search, User, LogOut, Sun, Moon, History, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (session) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || "");
        setIsAdmin(session.user.email === "kartik1911k@gmail.com");
      }
    };

    checkUser();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || "");
        setIsAdmin(session.user.email === "kartik1911k@gmail.com");
      } else {
        setIsAuthenticated(false);
        setUserEmail("");
        setIsAdmin(false);
      }
    });

    return () => data?.subscription?.unsubscribe?.();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-[#1E3A8A] hover:bg-slate-100" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-white border-slate-200">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/" className="text-lg font-medium text-[#1E3A8A] hover:text-[#1E40AF] transition-colors">Home</Link>
              <Link href="/mock-tests" className="text-lg font-medium text-[#1E3A8A] hover:text-[#1E40AF] transition-colors">Mock Tests</Link>
              <Link href="/amazon-store" className="text-lg font-medium text-[#1E3A8A] hover:text-[#1E40AF] transition-colors">Amazon Store</Link>
              {isAuthenticated && (
                <>
                  <Link href="/mock-test-history" className="text-lg font-medium text-[#1E3A8A] hover:text-[#1E40AF] transition-colors">Mock Test History</Link>
                  <Link href="/purchase-history" className="text-lg font-medium text-[#1E3A8A] hover:text-[#1E40AF] transition-colors">Purchase History</Link>
                </>
              )}
              {isAdmin && <Link href="/admin" className="text-lg font-medium text-[#1E3A8A] hover:text-[#1E40AF] transition-colors">Admin Panel</Link>}
              {isAuthenticated && (
                <>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <User className="h-4 w-4" />
                    <span>{userEmail}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="w-full border-slate-200 text-[#1E3A8A] hover:bg-slate-50">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
              {!isAuthenticated && <Link href="/login" className="text-lg font-medium text-[#1E3A8A] hover:text-[#1E40AF] transition-colors">Login</Link>}
            </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <img src="favicon.png" alt="nextech" className="h-9 w-9" />
            <span className="font-serif font-bold text-xl tracking-tight text-[#1E3A8A]">nextech</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-[#1E40AF] transition-colors">Home</Link>
            <Link href="/mock-tests" className="hover:text-[#1E40AF] transition-colors">Mock Tests</Link>
            <Link href="/amazon-store" className="hover:text-[#1E40AF] transition-colors">Amazon Store</Link>
            {isAuthenticated && (
              <>
                <Link href="/mock-test-history" className="hover:text-[#1E40AF] transition-colors">Mock Test History</Link>
                <Link href="/purchase-history" className="hover:text-[#1E40AF] transition-colors">Purchase History</Link>
              </>
            )}
            {isAdmin && <Link href="/admin" className="hover:text-[#1E40AF] transition-colors">Admin Panel</Link>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form action="/search" method="GET" className="relative hidden sm:block w-64" data-testid="form-search">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              name="q"
              placeholder="Search notes, tests..."
              className="pl-9 bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-[#1E40AF]"
            />
          </form>
          <div className="hidden sm:flex items-center gap-4">
            {!isAuthenticated ? (
              <Link href="/login">
                <Button variant="outline" size="sm" data-testid="button-login" className="border-slate-200 text-[#1E3A8A] hover:bg-slate-50">Login</Button>
              </Link>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">{userEmail}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  data-testid="button-logout"
                  className="border-slate-200 text-[#1E3A8A] hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="border-slate-200 text-[#1E3A8A] hover:bg-slate-50"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
