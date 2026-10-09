import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// Seed data — the hardcoded permissions that were previously in RoleManager
// These are created as NexusPermission records on first load if the entity is empty
export const SEED_PERMISSIONS = [
  { key: "view_channels", label: "Voir les salons", category: "Général", default_value: true, sort_order: 0, is_active: true },
  { key: "manage_channels", label: "Gérer les salons", category: "Général", default_value: false, sort_order: 1, is_active: true },
  { key: "manage_roles", label: "Gérer les rôles", category: "Général", default_value: false, sort_order: 2, is_active: true },
  { key: "manage_emojis", label: "Créer et gérer les expressions (émojis/stickers)", category: "Général", default_value: false, sort_order: 3, is_active: true },
  { key: "view_logs", label: "Voir les logs", category: "Général", default_value: false, sort_order: 4, is_active: true },
  { key: "create_invite", label: "Créer une invitation", category: "Général", default_value: true, sort_order: 5, is_active: true },
  { key: "change_nicknames", label: "Changer le pseudo des membres", category: "Général", default_value: false, sort_order: 6, is_active: true },
  { key: "administrator", label: "Administrateur global du serveur", category: "Général", default_value: false, highlight: true, sort_order: 7, is_active: true },
  { key: "kick_members", label: "Expulser des membres", category: "Membres", default_value: false, sort_order: 0, is_active: true },
  { key: "accept_members", label: "Accepter ou refuser des membres", category: "Membres", default_value: false, sort_order: 1, is_active: true },
  { key: "ban_members", label: "Bannir des membres", category: "Membres", default_value: false, sort_order: 2, is_active: true },
  { key: "timeout_members", label: "Exclure temporairement (timeout)", category: "Membres", default_value: false, sort_order: 3, is_active: true },
  { key: "send_messages", label: "Envoyer des messages", category: "Messages", default_value: true, sort_order: 0, is_active: true },
  { key: "attach_files", label: "Joindre des fichiers", category: "Messages", default_value: true, sort_order: 1, is_active: true },
  { key: "embed_links", label: "Intégrer des liens", category: "Messages", default_value: true, sort_order: 2, is_active: true },
  { key: "use_emojis", label: "Utiliser des émojis", category: "Messages", default_value: true, sort_order: 3, is_active: true },
  { key: "use_stickers", label: "Utiliser des stickers", category: "Messages", default_value: true, sort_order: 4, is_active: true },
  { key: "use_gifs", label: "Utiliser des GIFs", category: "Messages", default_value: true, sort_order: 5, is_active: true },
  { key: "voice_connect", label: "Se connecter aux salons vocaux", category: "Vocal", default_value: true, sort_order: 0, is_active: true },
  { key: "voice_move_members", label: "Déplacer des membres", category: "Vocal", default_value: false, sort_order: 1, is_active: true },
];

/**
 * Fetches all NexusPermission records dynamically from the database.
 * Seeds defaults on first load if empty.
 * Returns permissions grouped by category — same shape as the old hardcoded PERMISSION_CATEGORIES.
 */
export function useNexusPermissions() {
  const qc = useQueryClient();

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["nexus-permissions"],
    queryFn: async () => {
      let res = await base44.entities.NexusPermission.filter({}, "sort_order", 200);
      let list = Array.isArray(res) ? res : res?.items || [];

      if (list.length === 0) {
        await base44.entities.NexusPermission.bulkCreate(SEED_PERMISSIONS);
        res = await base44.entities.NexusPermission.filter({}, "sort_order", 200);
        list = Array.isArray(res) ? res : res?.items || [];
      }

      return list;
    },
    staleTime: 30000,
  });

  // Group by category, same shape as PERMISSION_CATEGORIES
  const categoryMap = {};
  for (const p of permissions) {
    const cat = p.category || "Général";
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(p);
  }

  const permissionCategories = Object.entries(categoryMap).map(([title, perms]) => ({
    title,
    permissions: perms.map((p) => ({
      key: p.key,
      label: p.label,
      default: p.default_value,
      highlight: p.highlight,
    })),
  }));

  // Flat defaults map
  const permDefaults = {};
  for (const p of permissions) {
    permDefaults[p.key] = p.default_value;
  }

  return { permissions, permissionCategories, permDefaults, isLoading };
}