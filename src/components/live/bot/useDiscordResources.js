import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Salons et rôles réels du serveur sélectionné (via le bot), pour éviter toute saisie d'ID.
export default function useDiscordResources(guildId) {
  const [data, setData] = useState({ channels: [], categories: [], roles: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!guildId) {
      setData({ channels: [], categories: [], roles: [] });
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("botDiscord", { action: "resources", guildId });
      if (res.data?.error) throw new Error(res.data.error);
      setData({
        channels: res.data?.channels || [],
        categories: res.data?.categories || [],
        roles: res.data?.roles || [],
      });
    } catch (invokeError) {
      setData({ channels: [], categories: [], roles: [] });
      setError(invokeError?.response?.data?.error || invokeError?.message || "discord_error");
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...data, loading, error, reload };
}