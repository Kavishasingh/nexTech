import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { API_BASE } from "@/lib/api";

export function useVisitTracking() {
  const [location] = useLocation();

  useEffect(() => {
    const track = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (!session?.user) return;

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('supabase_user_id', session.user.id)
          .single();

        if (error || !profile?.id) return;

        await fetch(`${API_BASE}/api/visits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profile.id,
            page: location,
            action: 'page_view',
            metadata: {
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString(),
            }
          })
        });
      } catch (err) {
        console.error('Visit tracking failed:', err);
      }
    };

    track();
  }, [location]);
}
