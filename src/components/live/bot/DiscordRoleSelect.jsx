import React, { useMemo } from "react";
import DiscordSelect from "./DiscordSelect";

// Sélecteur de rôle (couleur Discord affichée), avec mentions optionnelles.
export default function DiscordRoleSelect({
  value,
  onChange,
  resources,
  guildId,
  placeholder = "Choisir un rôle",
  allowNone = true,
  extras = [],
  hint = "",
}) {
  const groups = useMemo(() => {
    const list = [{ label: "Rôles du serveur", items: (resources?.roles || []).map((role) => ({
      value: role.id,
      label: `@${role.name}`,
      color: role.color,
      hint,
    })) }];
    if (extras.length) list.unshift({ label: "Mentions", items: extras });
    return list.filter((group) => group.items.length);
  }, [resources, extras, hint]);

  return (
    <DiscordSelect
      value={value || ""}
      onChange={onChange}
      groups={groups}
      loading={!!guildId && resources?.loading}
      disabled={!guildId || !!resources?.error}
      emptyLabel={allowNone ? "Aucun rôle" : ""}
      placeholder={guildId ? placeholder : "Sélectionne d'abord un serveur"}
    />
  );
}