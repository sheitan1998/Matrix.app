import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const query = body.query || "";
    const limit = Math.min(body.limit || 24, 40);

    const apiKey = secrets.get("GIPHY_API_KEY");
    if (!apiKey) {
      return Response.json({ gifs: [], error: "GIPHY_API_KEY non configuré. Ajoutez la clé depuis le dashboard → Secrets." });
    }

    const endpoint = query.trim()
      ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query.trim())}&limit=${limit}&rating=pg`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${limit}&rating=pg`;

    const res = await fetch(endpoint);
    if (!res.ok) {
      return Response.json({ gifs: [], error: `Giphy API error: ${res.status}` });
    }
    const data = await res.json();

    const gifs = (data.data || []).map(g => ({
      id: g.id,
      url: g.images?.fixed_height?.url || g.images?.original?.url || "",
      preview: g.images?.fixed_height_small?.url || g.images?.preview_gif?.url || "",
      width: parseInt(g.images?.fixed_height?.width || "200"),
      height: parseInt(g.images?.fixed_height?.height || "200"),
    }));

    return Response.json({ gifs });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}