import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { pseudo, bio } = body;

    // Validate pseudo
    const cleanPseudo = String(pseudo || '').trim().slice(0, 30);
    if (!cleanPseudo) {
      return Response.json({ error: 'Le pseudo ne peut pas être vide.' }, { status: 400 });
    }
    if (cleanPseudo.includes('#')) {
      return Response.json({ error: 'Le pseudo ne doit pas contenir le caractère #.' }, { status: 400 });
    }

    const cleanBio = String(bio || '').trim().slice(0, 200);

    // Build update payload
    const updates: Record<string, string> = {
      pseudo: cleanPseudo,
      bio: cleanBio,
    };

    // Generate pseudo_tag if missing
    const freshUser = await base44.asServiceRole.entities.User.get(user.id);
    if (freshUser && !freshUser.pseudo_tag) {
      updates.pseudo_tag = String(Math.floor(1000 + Math.random() * 9000));
    }

    // Update via service role (bypasses RLS issues with updateMe endpoint)
    const updated = await base44.asServiceRole.entities.User.update(user.id, updates);

    return Response.json({
      success: true,
      user: {
        pseudo: updated.pseudo,
        bio: updated.bio,
        pseudo_tag: updated.pseudo_tag,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}