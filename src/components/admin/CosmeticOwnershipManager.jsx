import React, { useCallback, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Package, Search, ArrowLeftRight, Users } from "lucide-react";
import CosmeticOwnerRow from "@/components/admin/CosmeticOwnerRow";
import CosmeticRectifyModal from "@/components/admin/CosmeticRectifyModal";

export default function CosmeticOwnershipManager({ refreshKey }) {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [owners, setOwners] = useState([]);
  const [usersByEmail, setUsersByEmail] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await base44.entities.MatrixShopItem.list("-created_date", 200);
        setItems(data || []);
        setSelectedId((prev) => prev || data?.[0]?.id || "");
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, [refreshKey]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const list = await base44.entities.User.list("-created_date", 500);
        const map = {};
        (list || []).forEach((u) => { map[u.email] = u; });
        setUsersByEmail(map);
      } catch { /* silencieux */ }
    };
    loadUsers();
  }, []);

  const loadOwners = useCallback(async () => {
    if (!selectedId) { setOwners([]); return; }
    try {
      const res = await base44.functions.invoke("cosmeticAdmin", { action: "owners", item_id: selectedId });
      setOwners(res?.data?.owners || []);
    } catch {
      setOwners([]);
    }
  }, [selectedId]);

  useEffect(() => {
    loadOwners();
    const unsub = base44.entities.UserCosmetic.subscribe(() => loadOwners());
    return unsub;
  }, [loadOwners]);

  const currentItem = items.find((i) => i.id === selectedId) || null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return owners;
    return owners.filter((o) => {
      const u = usersByEmail[o.user_email];
      return (
        (o.user_email || "").toLowerCase().includes(q) ||
        (u?.pseudo || "").toLowerCase().includes(q) ||
        (u?.full_name || "").toLowerCase().includes(q)
      );
    });
  }, [owners, search, usersByEmail]);

  const totalQuantity = owners.reduce((s, o) => s + (o.quantity || 1), 0);
  const equipped = owners.filter((o) => o.is_equipped).length;

  const openAction = (mode, owner) => setModal({ mode, owners: [owner] });

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-white/30 text-center py-6">Aucun article dans la boutique.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
          <Package className="w-4 h-4 text-[#a855f7]" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Attributions & compensation</h3>
          <p className="text-[11px] text-white/40">
            Vois qui possède un article, remplace-le, retire-le ou crédite un dédommagement en Trix.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none focus:border-[#a855f7]"
        >
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · {item.category}
            </option>
          ))}
        </select>
        <button
          onClick={() => setModal({ mode: "replace", owners })}
          disabled={owners.length === 0}
          className="rounded-lg border border-[#a855f7]/40 px-3 py-2 text-[11px] font-bold text-[#c084fc] hover:bg-[#a855f7]/10 disabled:opacity-30 flex items-center justify-center gap-1.5"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" /> Remplacer pour tous
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[10px] text-white/40">
        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {owners.length} propriétaire(s)</span>
        <span>· {totalQuantity} exemplaire(s)</span>
        <span>· {equipped} équipé(s)</span>
      </div>

      {owners.length > 1 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un joueur…"
            className="w-full rounded-lg border border-white/10 bg-black/30 pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-[#a855f7]"
          />
        </div>
      )}

      {owners.length === 0 ? (
        <p className="text-xs text-white/30 text-center py-4">Personne ne possède cet article pour le moment.</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-white/30 text-center py-4">Aucun joueur ne correspond à cette recherche.</p>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
          {filtered.map((owner) => (
            <CosmeticOwnerRow
              key={owner.id}
              owner={owner}
              user={usersByEmail[owner.user_email]}
              onAction={openAction}
            />
          ))}
        </div>
      )}

      {modal && (
        <CosmeticRectifyModal
          mode={modal.mode}
          owners={modal.owners}
          items={items}
          currentItem={currentItem}
          onClose={() => setModal(null)}
          onDone={loadOwners}
        />
      )}
    </div>
  );
}