import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
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

      // ---- AI Video Generation ----
      case 'generateVideo': {
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