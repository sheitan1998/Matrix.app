import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { SUPPORT_EMAIL, SUPPORT_NAME, SUPPORT_AVATAR } from '../../shared/supportAccount.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { user_email, user_pseudo } = body;

    if (!user_email) {
      return Response.json({ error: 'Missing user_email' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Authenticate the caller — only logged-in users can trigger their own welcome message
    const currentUser = await base44.auth.me();
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only the user themselves (or an admin) can trigger their welcome message
    if (currentUser.email !== user_email && currentUser.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Idempotency: check if a welcome message already exists for this user
    const existing = await base44.asServiceRole.entities.DirectMessage.filter({
      recipient_email: user_email,
      is_welcome_message: true,
    });

    if (existing && existing.length > 0) {
      return Response.json({ success: true, already_sent: true });
    }

    // Build the personalized welcome message
    const pseudo = user_pseudo || currentUser.pseudo || currentUser.full_name || '';
    const name = pseudo && pseudo.trim() ? pseudo.trim() : 'cher utilisateur';
    const content = [
      '🪐✨ Bienvenue sur Matrix !',
      '',
      `Salut ${name} ! 👋`,
      '',
      'Bienvenue officiellement à bord de Matrix ! Je suis ravi de te compter parmi nous.',
      '',
      "Puisque c'est ta première connexion, voici un petit tour d'horizon rapide pour t'aider à découvrir tout ce que tu peux faire ici :",
      '',
      "💬 Le serveur Nexus : Rejoins les espaces de discussion directement intégrés à l'application pour échanger, réagir et commenter en direct avec la communauté.",
      "🛠️ Les Outils & Fonctionnalités : Accède à une panoplie d'outils pensés pour ton quotidien, ton divertissement ou tes projets.",
      "🎮 Nexus Game : Envie de t'amuser ? Fais un tour dans cet univers dédié pour te détendre entre deux sessions.",
      "🎨 La Boutique : Personnalise ton profil à ton image et débloque des cosmétiques exclusifs.",
      '',
      "Un petit conseil pour commencer : N'hésite pas à faire un tour dans ton profil si tu as besoin de contacter le support ou de signaler le moindre souci. Et pour ne rien rater des actus et de l'ambiance, rejoins-nous aussi sur le serveur Discord officiel !",
      '',
      'Bonne exploration et amuse-toi bien sur Matrix ! 🚀',
    ].join('\n');

    // Create the welcome DM from "Équipe Matrix" (bypass RLS via asServiceRole)
    await base44.asServiceRole.entities.DirectMessage.create({
      sender_email: SUPPORT_EMAIL,
      sender_name: SUPPORT_NAME,
      sender_avatar: SUPPORT_AVATAR,
      recipient_email: user_email,
      recipient_name: pseudo || currentUser.full_name || user_email.split('@')[0],
      recipient_avatar: currentUser.avatar_url || '',
      content,
      is_read: false,
      is_read_only: true,
      is_welcome_message: true,
    });

    return Response.json({ success: true, already_sent: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}