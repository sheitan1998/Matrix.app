import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { requireUser, rateLimitByIp } from '../../shared/security.ts';

export default async function(req: Request): Promise<Response> {
  try {
    // Require authentication — prevents anonymous credit consumption
    const user = await requireUser(req);
    if (!user) return Response.json({ safe: false, reason: 'Authentification requise.' }, { status: 401 });

    // Rate limit — each call triggers a billable multimodal LLM inference
    if (!rateLimitByIp(req, 'moderateImage', 20, 60_000)) {
      return Response.json({ safe: false, reason: 'Trop de requêtes de modération. Réessayez plus tard.' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { file_url } = body;

    if (!file_url || typeof file_url !== "string") {
      return Response.json({ safe: false, reason: "URL de fichier manquante." });
    }

    const base44 = createClientFromRequest(req);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt:
        "You are a content moderation system. Analyze this image and determine if it contains any of the following: pornography, nudity, sexual content, graphic violence, gore, illegal drugs, hate symbols, or any other content that violates community guidelines. Respond with a JSON object: { \"safe\": true/false, \"reason\": \"short explanation in French if not safe, empty string if safe\" }. Be strict: any nudity or sexual content = not safe. Any graphic violence = not safe. Bikinis/swimwear in non-sexual context = safe. Medical images = safe.",
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          safe: { type: "boolean" },
          reason: { type: "string" },
        },
        required: ["safe", "reason"],
      },
    });

    const safe = result?.safe === true;
    return Response.json({
      safe,
      reason: safe ? "" : (result?.reason || "Image non conforme aux règles de la communauté."),
    });
  } catch (err) {
    console.error("Moderation error:", err);
    // Fail closed — if moderation service is down, reject the image
    return Response.json({ safe: false, reason: "Le service de modération est indisponible. Réessayez plus tard." });
  }
}