import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { rateLimitByIp } from '../../shared/security.ts';

export default async function(req: Request): Promise<Response> {
  try {
    // Rate limit all AI actions to protect integration credits
    // generateVideo costs 20-40 credits per call; chat costs 1+ credit per call
    if (!rateLimitByIp(req, 'aiStudio', 10, 60_000)) {
      return Response.json({ error: 'Trop de requêtes. Réessayez dans un instant.' }, { status: 429 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, ...params } = body;

    switch (action) {
      // ---- AI Chat ----
      case 'chat': {
        const { prompt, model, add_context_from_internet } = params;
        if (!prompt || typeof prompt !== 'string') {
          return Response.json({ error: 'Prompt is required' }, { status: 400 });
        }
        // Enforce max length to protect credits
        if (prompt.length > 8000) {
          return Response.json({ error: 'Prompt too long (max 8000 chars)' }, { status: 400 });
        }
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          model: model || undefined,
          add_context_from_internet: !!add_context_from_internet,
        });
        return Response.json({ response });
      }

      // ---- AI Video Generation (stricter rate limit — 20-40 credits per call) ----
      case 'generateVideo': {
        // Separate, stricter bucket for video generation
        if (!rateLimitByIp(req, 'aiStudioVideo', 3, 60_000)) {
          return Response.json({ error: 'Limite de génération vidéo atteinte. Réessayez plus tard.' }, { status: 429 });
        }
        const { prompt, duration, aspect_ratio } = params;
        if (!prompt || typeof prompt !== 'string') {
          return Response.json({ error: 'Prompt is required' }, { status: 400 });
        }
        if (prompt.length > 2000) {
          return Response.json({ error: 'Prompt too long (max 2000 chars)' }, { status: 400 });
        }
        const validDurations = [4, 6, 8];
        const dur = validDurations.includes(duration) ? duration : 6;
        const result = await base44.asServiceRole.integrations.Core.GenerateVideo({
          prompt,
          duration: dur,
          aspect_ratio: aspect_ratio === '9:16' ? '9:16' : '16:9',
          generate_audio: false,
        });
        return Response.json({ url: result.url });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}