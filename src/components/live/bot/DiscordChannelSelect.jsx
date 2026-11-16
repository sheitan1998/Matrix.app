import React, { useMemo } from "react";
import DiscordSelect from "./DiscordSelect";

// Sélecteur de salon : salons textuels (type 0) et annonces (type 5), groupés par catégorie.
export default function DiscordChannelSelect({ value, onChange, resources, guildId, placeholder = "Choisir un salon" }) {
  const groups = useMemo(() => {
    const channels = resources?.channels || [];
    const categories = resources?.categories || [];
    const buckets = [...categories, { id: "", name: "Sans catégorie" }];
    return buckets.map((category) => ({
      label: category.name,
      items: channels
        .filter((channel) => (channel.parent_id || "") === category.id)
        .map((channel) => ({
          value: channel.id,
          label: channel.type === 5 ? `📢 ${channel.name}` : `#${channel.name}`,
          hint: channel.type === 5 ? "Annonces" : "",
        })),
    })).filter((group) => group.items.length);
  }, [resources]);

  return (
    <DiscordSelect
      value={value || ""}
      onChange={onChange}
      groups={groups}
      loading={!!guildId && resources?.loading}
      disabled={!guildId || !!resources?.error}
      emptyLabel="Aucun salon"
      placeholder={guildId ? placeholder : "Sélectionne d'abord un serveur"}
    />
  );
}