import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Clock, Trophy, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { API_BASE } from "@/lib/api";

interface HistoryItem {
  id: number;
  title: string;
  score: number;
  maxScore: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  timeTaken: number;
  createdAt: string;
}

export function MockTestHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
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
        const res = await fetch(`${API_BASE}/api/mock-test/history/${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/mock-tests">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Mock Tests
        </button>
      </Link>

      <h1 className="font-serif text-3xl font-bold mb-6">Mock Test History</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-14 w-14 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-medium text-foreground mb-1">No tests taken yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Start a mock test to see your results here.</p>
          <Link href="/mock-tests"><Button>Browse Mock Tests</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="bg-card border border-card-border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(item.createdAt)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTime(item.timeTaken)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xl font-bold">{item.score}<span className="text-sm text-muted-foreground">/{item.maxScore}</span></div>
                    <div className="text-xs text-muted-foreground">
                      {item.correct} correct, {item.incorrect} incorrect, {item.unattempted} unattempted
                    </div>
                  </div>
                  <Trophy className={`h-8 w-8 ${item.score >= item.maxScore * 0.7 ? "text-yellow-500" : item.score >= item.maxScore * 0.4 ? "text-gray-400" : "text-red-400"}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
