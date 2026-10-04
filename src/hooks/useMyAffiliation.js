import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export const isActiveAffiliation = (a) => a?.status === "affiliate" || a?.status === "partner";

// Current user's Affiliation record, kept live via realtime subscription
// so an admin approval shows up instantly without re-login.
export function useMyAffiliation(email) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["my-affiliation", email],
    queryFn: () => base44.entities.Affiliation.filter({ user_email: email }).then((r) => r?.items?.[0] || r?.[0] || null),
    enabled: !!email
  });

  useEffect(() => {
    if (!email) return;
    return base44.entities.Affiliation.subscribe((event) => {
      if (event?.type === "delete" || event?.data?.user_email === email) {
        qc.invalidateQueries({ queryKey: ["my-affiliation", email] });
      }
    });
  }, [email, qc]);

  return query;
}