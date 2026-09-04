import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Receipt, Calendar, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { API_BASE } from "@/lib/api";

interface PurchaseItem {
  id: number;
  documentId: number;
  amount: number;
  currency: string;
  status: string;
  razorpayPaymentId: string;
  createdAt: string;
}

export function PurchaseHistory() {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getUserId = async (): Promise<string | null> => {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user?.id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = await getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/payments/history/${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          setPurchases(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>
      </Link>

      <h1 className="font-serif text-3xl font-bold mb-6">Purchase History</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-16">
          <Receipt className="h-14 w-14 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-medium text-foreground mb-1">No purchases yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Your document purchases will appear here.</p>
          <Link href="/"><Button>Browse Documents</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((item) => (
            <div key={item.id} className="bg-card border border-card-border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Document #{item.documentId}</h3>
                    <Badge className={item.status === "captured" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>{item.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(item.createdAt)}</span>
                    <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> {item.razorpayPaymentId}</span>
                  </div>
                </div>
                <div className="text-xl font-bold">
                  ₹{item.amount / 100}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
