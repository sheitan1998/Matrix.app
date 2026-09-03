import { createClientFromRequest } from 'npm:@base44/sdk@0.8.46';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // Vérification d'authentification : rejette les requêtes anonymes
    const user = await base44.auth.me();
    if (!user) {
      return Response.json(
        { error: "Non autorisé : authentification requise." },
        { status: 401 }
      );
    }

    // Logique métier avec asServiceRole après validation de l'utilisateur
    const users = await base44.asServiceRole.entities.User.list();

    return Response.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      total_users: users.length,
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}