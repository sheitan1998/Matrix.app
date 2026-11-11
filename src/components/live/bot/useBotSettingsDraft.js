import { useState, useEffect } from "react";

// Brouillon local des réglages : on édite, puis on enregistre une seule fois.
export default function useBotSettingsDraft(integration) {
  const [draft, setDraft] = useState(integration?.settings || null);

  useEffect(() => {
    setDraft(integration?.settings || null);
  }, [integration?.id, integration?.updated_at]);

  const dirty = !!integration && !!draft && JSON.stringify(draft) !== JSON.stringify(integration.settings);

  const patchSection = (section, key, value) => {
    setDraft((prev) => ({
      ...(prev || {}),
      [section]: { ...((prev || {})[section] || {}), [key]: value },
    }));
  };

  const patchTop = (key, value) => setDraft((prev) => ({ ...(prev || {}), [key]: value }));

  return { draft, setDraft, dirty, patchSection, patchTop };
}