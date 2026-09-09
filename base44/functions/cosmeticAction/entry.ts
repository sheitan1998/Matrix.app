import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function handler(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { cosmetic_id, action, user_email } = body;

    if (!cosmetic_id || !action) {
      return Response.json({ error: "Missing cosmetic_id or action" }, { status: 400 });
    }

    const b44 = createClientFromRequest(req);
    const user = await b44.auth.me();

    if (!user || !user.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch the cosmetic to equip/unequip
    const cosmetic = await b44.asServiceRole.entities.UserCosmetic.get(cosmetic_id);

    if (!cosmetic) {
      return Response.json({ error: "Cosmetic not found" }, { status: 404 });
    }

    if (cosmetic.user_email !== user.email) {
      return Response.json({ error: "Not authorized" }, { status: 403 });
    }

    if (action === "equip") {
      // Find all cosmetics in the same category that are equipped and unequip them
      const allCosmetics = await b44.asServiceRole.entities.UserCosmetic.filter({
        user_email: user.email,
        category: cosmetic.category,
        is_equipped: true
      });

      const updates = [];
      for (const c of allCosmetics) {
        if (c.id !== cosmetic_id) {
          updates.push(b44.asServiceRole.entities.UserCosmetic.update(c.id, { is_equipped: false }));
        }
      }
      updates.push(b44.asServiceRole.entities.UserCosmetic.update(cosmetic_id, { is_equipped: true }));

      await Promise.all(updates);

      return Response.json({
        success: true,
        action: "equip",
        cosmetic_id,
        unequipped: allCosmetics.filter(c => c.id !== cosmetic_id).map(c => c.id)
      });
    } else if (action === "unequip") {
      await b44.asServiceRole.entities.UserCosmetic.update(cosmetic_id, { is_equipped: false });

      return Response.json({
        success: true,
        action: "unequip",
        cosmetic_id
      });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error("[cosmeticAction] error:", e);
    return Response.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}