import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const ULTRA_HOURLY_LIMIT = 30;
const PLAN_LIMITS: Record<string, number> = { starter: 10, plus: 100 };
const MAX_RESULTS = 5;
const HISTORY_SIZE = 8;
const MAX_CONTENT = 4000;
const CHAT_MODEL = 'gpt_6_luna';
const WEB_MODEL = 'gemini_3_8_flash';

const PLATFORM_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  twitch: 'Twitch',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  snapchat: 'Snapchat',
};

const SYSTEM_PROMPT = `Tu es Matrix AI, l'assistant officiel de Matrix (matrix-hub.app), le hub tout-en-un dédié au gaming, au streaming, aux créateurs et aux communautés.

MISSION
1. Aider les membres à découvrir les meilleurs serveurs communautaires et créateurs présents sur Matrix en utilisant tes outils de recherche interne.
2. Aider les administrateurs de serveurs et créateurs à rédiger des descriptions attractives, structurer leurs annonces et trouver des idées de contenu.
3. Répondre aux questions gaming, techniques ou communautaires avec clarté et dynamisme.

RÈGLES ABSOLUES
- Ton amical, moderne, direct, adapté à la culture gaming/créateurs. Réponds en français par défaut, ou dans la langue de l'utilisateur.
- ZÉRO HALLUCINATION : n'invente jamais de serveur, de créateur, de fonctionnalité, de prix, de récompense (TRIX coins) ou de statut officiel absent des données retournées par tes outils. Si une recherche interne ne donne aucun résultat, dis-le honnêtement et propose à l'utilisateur de créer ou référencer son serveur sur Best Serveur (matrix-hub.app/best-serveurs).
- INFORMATIONS EXTERNES : tu n'es pas limité à Matrix. Pour toute question hors du périmètre Matrix (actualité, jeu, sortie, prix, culture générale, technique), appuie-toi sur les résultats de recherche web fournis et cite tes sources en liens Markdown. Si la recherche web ne renvoie rien d'utile, dis-le clairement au lieu d'inventer.
- SÉCURITÉ : refuse toute demande liée à la triche (cheats, hacks, aimbots), au piratage, au contournement de sécurité ou à des contenus illégaux ou toxiques.
- Réponses concises et structurées en Markdown (titres courts, listes, gras). Pas de blabla inutile.`;

function escapeRegex(value: string): string {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Retire les mots d'intention ("tendance", "actif", "top"...) pour ne garder que le sujet réel.
const INTENT_WORDS = new Set([
  'tendance', 'tendances', 'populaire', 'populaires', 'top', 'meilleur', 'meilleurs', 'meilleures',
  'best', 'actif', 'actifs', 'active', 'actives', 'connu', 'connus', 'connue', 'hot', 'trending',
  'maintenant', 'actuellement', 'aujourdhui', 'recent', 'recents', 'bon', 'bons', 'bien', 'note',
  'sur', 'de', 'du', 'des', 'les', 'le', 'la', 'un', 'une', 'mon', 'ma', 'mes', 'pour', 'avec', 'en',
  'quel', 'quels', 'quelles', 'quelle', 'sont', 'est', 'ce', 'cet', 'cette', 'ces', 'moment', 'moi',
  'toi', 'tu', 'me', 'moi', 'donne', 'affiche', 'voir', 'dans', 'il', 'y', 'a', 'peux', 'stp', 'svp',
  'serveur', 'serveurs', 'createur', 'createurs', 'createur', 'createurs', 'streamer', 'streamers',
  'chaine', 'chaines', 'communaute', 'communautes', 'jeu', 'jeux', 'gaming', 'matrix', 'hub', 'liste',
  'trouve', 'cherche', 'recommand', 'decouvre', 'montre', 'existe', 'des', 'aux', 'au', 'et', 'ou',
]);

function cleanTerm(term: string): string {
  const normalize = (word: string) => word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return String(term || '')
    .split(/[^a-zA-Z0-9àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ'-]+/)
    .filter((word) => word && !INTENT_WORDS.has(normalize(word)))
    .join(' ')
    .trim();
}

function titleFrom(content: string): string {
  const clean = String(content || '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'Nouvelle discussion';
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean;
}

function planLimit(tier: string, extra: number): number {
  if (tier === 'ultra') return Infinity;
  const base = PLAN_LIMITS[tier] ?? PLAN_LIMITS.starter;
  return base + Math.max(0, Number(extra) || 0);
}

function normalizeTier(value: string): string {
  return value === 'plus' || value === 'ultra' ? value : 'starter';
}

/** Lit le quota en appliquant le reset glissant 24h / anti-spam horaire (100% serveur). */
async function loadQuota(base44, userId: string) {
  const user = await base44.asServiceRole.entities.User.get(userId);
  const now = Date.now();
  const tier = normalizeTier(user.plan_tier);

  let used = Math.max(0, Number(user.ai_messages_used) || 0);
  const lastReset = user.ai_last_reset_at ? Date.parse(user.ai_last_reset_at) : 0;
  let resetAt = lastReset ? lastReset + DAY_MS : now + DAY_MS;
  const resetPatch: Record<string, unknown> = {};

  if (!lastReset || now - lastReset >= DAY_MS) {
    used = 0;
    resetAt = now + DAY_MS;
    resetPatch.ai_messages_used = 0;
    resetPatch.ai_last_reset_at = new Date(now).toISOString();
  }

  let hourCount = Math.max(0, Number(user.ai_hour_count) || 0);
  const hourStart = user.ai_hour_started_at ? Date.parse(user.ai_hour_started_at) : 0;
  let hourResetAt = hourStart ? hourStart + HOUR_MS : now + HOUR_MS;

  if (!hourStart || now - hourStart >= HOUR_MS) {
    hourCount = 0;
    hourResetAt = now + HOUR_MS;
    resetPatch.ai_hour_count = 0;
    resetPatch.ai_hour_started_at = new Date(now).toISOString();
  }

  const limit = planLimit(tier, user.ai_daily_extra_credits);

  return { user, tier, used, limit, resetAt, hourCount, hourResetAt, resetPatch };
}

function quotaPayload(quota) {
  const unlimited = quota.limit === Infinity;
  return {
    plan_tier: quota.tier,
    unlimited,
    limit: unlimited ? null : quota.limit,
    used: quota.used,
    remaining: unlimited ? null : Math.max(0, quota.limit - quota.used),
    next_reset_at: new Date(quota.resetAt).toISOString(),
    hourly_limit: quota.tier === 'ultra' ? ULTRA_HOURLY_LIMIT : null,
    hourly_used: quota.tier === 'ultra' ? quota.hourCount : null,
    hourly_next_reset_at: quota.tier === 'ultra' ? new Date(quota.hourResetAt).toISOString() : null,
  };
}

function serverCard(server) {
  const game = server.game || (Array.isArray(server.games) ? server.games[0] : '') || '';
  const category = (Array.isArray(server.categories) ? server.categories[0] : '') || server.category || '';
  return {
    type: 'server',
    id: server.id,
    name: server.title || 'Serveur Matrix',
    slug: server.slug || server.id,
    subtitle: [game, category].filter(Boolean).join(' · ') || 'Serveur Matrix',
    image: server.banner_url || server.cover_image || server.logo_url || server.profile_image || '',
    votes: server.votes_month ?? server.votes ?? 0,
    url: `/servers/${server.slug || server.id}`,
  };
}

function creatorCard(creator) {
  return {
    type: 'creator',
    id: creator.id,
    name: creator.name || 'Créateur Matrix',
    slug: creator.slug || creator.id,
    subtitle: PLATFORM_LABELS[creator.platform] || 'Créateur Matrix',
    image: creator.avatar_url || creator.banner_url || '',
    votes: creator.votes_month ?? creator.votes ?? 0,
    url: `/createur/${creator.slug || creator.id}`,
  };
}

// ---- Outils internes : requêtes ciblées, max 5 résultats ----
async function searchServers(base44, term: string, category: string) {
  const cleaned = cleanTerm(term);
  const conditions = [];
  if (cleaned) {
    const rx = { $regex: escapeRegex(cleaned), $options: 'i' };
    conditions.push(
      { title: rx },
      { description: rx },
      { games: rx },
      { categories: rx },
      { tags: rx },
      { game: rx },
      { category: rx },
    );
  }
  if (category) {
    const crx = { $regex: escapeRegex(category), $options: 'i' };
    conditions.push(
      { category_slugs: category },
      { category_slug: category },
      { categories: crx },
      { category: crx },
      { games: crx },
    );
  }
  const query: Record<string, unknown> = { type: 'server' };
  if (conditions.length) query.$or = conditions;

  const page = await base44.asServiceRole.entities.ServerAd.filter(query, '-votes_month', 20);
  const items = (page?.items || page || []).slice(0, MAX_RESULTS);
  return items.map((s) => ({
    id: s.id,
    name: s.title,
    slug: s.slug || s.id,
    game: s.game || (Array.isArray(s.games) ? s.games.join(', ') : ''),
    category: (Array.isArray(s.categories) ? s.categories.join(', ') : '') || s.category || '',
    description_short: String(s.description || '').slice(0, 160),
    banner_url: s.banner_url || s.cover_image || s.logo_url || '',
    votes: s.votes_month ?? s.votes ?? 0,
    _card: serverCard(s),
  }));
}

async function searchCreators(base44, term: string, platform: string) {
  const cleaned = cleanTerm(term);
  const conditions = [];
  if (cleaned) {
    const rx = { $regex: escapeRegex(cleaned), $options: 'i' };
    conditions.push({ name: rx }, { description: rx }, { platform: rx });
  }
  if (platform) {
    const p = String(platform).toLowerCase();
    if (PLATFORM_LABELS[p]) conditions.push({ platform: p });
  }
  const query: Record<string, unknown> = {};
  if (conditions.length) query.$or = conditions;

  const page = await base44.asServiceRole.entities.CreatorChannel.filter(query, '-votes_month', 20);
  const items = (page?.items || page || []).slice(0, MAX_RESULTS);
  return items.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug || c.id,
    platform: PLATFORM_LABELS[c.platform] || c.platform,
    description_short: String(c.description || '').slice(0, 160),
    avatar_url: c.avatar_url || c.banner_url || '',
    votes: c.votes_month ?? c.votes ?? 0,
    _card: creatorCard(c),
  }));
}

async function getGames(base44) {
  const page = await base44.asServiceRole.entities.Game.filter({ is_active: true }, 'sort_order', 40);
  return (page?.items || page || []).slice(0, 20).map((g) => ({
    name: g.name,
    slug: g.slug,
    description: String(g.description || '').slice(0, 120),
  }));
}

async function runTool(base44, call) {
  const tool = call?.tool;
  if (tool === 'search_matrix_servers') {
    return { tool, results: await searchServers(base44, call.query || '', call.category || '') };
  }
  if (tool === 'search_matrix_creators') {
    return { tool, results: await searchCreators(base44, call.query || '', call.platform || '') };
  }
  if (tool === 'get_matrix_games') {
    return { tool, results: await getGames(base44) };
  }
  return null;
}

function parseJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return null;
  }
}

function looksLikeDiscovery(text: string): boolean {
  const domain = /(serveur|cr[ée]ateur|streamer|cha[îi]ne|twitch|youtube|tiktok|communaut[ée]|jeu)/i;
  const intent = /(trouve|cherche|recommand|d[ée]couvr|quel|quels|quelles|montre|liste|top|meilleur|tendance|populaire|existe)/i;
  return domain.test(text) && intent.test(text);
}

/**
 * Recherche web : lancée dès qu'une demande n'est pas purement interne à Matrix
 * ou de la simple rédaction. Elle n'est donc plus limitée aux actualités.
 */
function needsWebSearch(text: string): boolean {
  const t = String(text || '').trim();
  if (!t) return false;

  // Info datée / vérifiable : toujours web.
  const freshness = /(actualit|news|patch ?notes|mise à jour|mise a jour|derni[èe]re version|sortie|date de sortie|sort quand|saison \d|tier ?list|meta actuelle|esport|tournoi|r[ée]compense du mois|combien co[ûu]te|prix|bug connu|serveur down|hors ligne|statut)/i;
  if (freshness.test(t)) return true;

  // Rédaction pure : pas besoin d'internet.
  const writing = /(r[ée]dige|r[ée]diger|corrige|reformule|traduis|description pour|annonce pour|id[ée]es? de (vid[ée]o|stream|contenu)|slogan|bio|titre pour)/i;
  if (writing.test(t)) return false;

  // Périmètre strictement Matrix (annuaire, TRIX, Nexus, profil, site).
  const matrixOnly = /(matrix|best[- ]serveurs?|best[- ]creators?|trix|nexus|matrix ai|mon serveur|mes serveurs|mon annonce|ma cha[îi]ne|mon profil|ce site|sur le site)/i;
  if (matrixOnly.test(t)) return false;

  // Découverte de serveurs / créateurs de l'annuaire : base Matrix uniquement.
  const directoryVocab = /(serveur|serveurs|cr[ée]ateur|cr[ée]ateurs|streamer|streamers|cha[îi]ne|cha[îi]nes|communaut[ée]|annuaire)/i;
  if (looksLikeDiscovery(t) && directoryVocab.test(t)) return false;

  // Tout le reste (culture générale, jeux, technique, questions diverses) : web.
  return true;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body?.action || 'status';

    // ---------- État du quota ----------
    if (action === 'status') {
      const quota = await loadQuota(base44, user.id);
      if (Object.keys(quota.resetPatch).length) {
        await base44.asServiceRole.entities.User.update(user.id, quota.resetPatch);
      }
      return Response.json(quotaPayload(quota));
    }

    if (action !== 'chat') {
      return Response.json({ error: 'Action inconnue' }, { status: 400 });
    }

    // ---------- Envoi d'un message ----------
    const content = String(body?.content || '').trim();
    if (!content) return Response.json({ error: 'Message vide' }, { status: 400 });
    if (content.length > MAX_CONTENT) {
      return Response.json({ error: 'Message trop long (4000 caractères maximum)' }, { status: 400 });
    }

    const quota = await loadQuota(base44, user.id);
    const unlimited = quota.limit === Infinity;
    const dailyBlocked = !unlimited && quota.used >= quota.limit;
    const hourlyBlocked = quota.tier === 'ultra' && quota.hourCount >= ULTRA_HOURLY_LIMIT;

    if (dailyBlocked || hourlyBlocked) {
      const nextResetAt = hourlyBlocked && !dailyBlocked
        ? new Date(quota.hourResetAt).toISOString()
        : new Date(quota.resetAt).toISOString();
      return Response.json(
        {
          error: 'quota_exceeded',
          reason: hourlyBlocked ? 'hourly_rate_limit' : 'daily_limit',
          next_reset_at: nextResetAt,
          quota: quotaPayload(quota),
        },
        { status: 429 },
      );
    }

    // Incrément serveur : la valeur vient d'être relue, jamais du client.
    const usedAfter = quota.used + 1;
    const hourAfter = quota.hourCount + 1;
    await base44.asServiceRole.entities.User.update(user.id, {
      ...quota.resetPatch,
      ai_messages_used: usedAfter,
      ai_hour_count: hourAfter,
      ai_hour_started_at: quota.resetPatch.ai_hour_started_at || user.ai_hour_started_at || new Date().toISOString(),
      ai_last_reset_at: quota.resetPatch.ai_last_reset_at || user.ai_last_reset_at || new Date().toISOString(),
    });

    // ---------- Conversation ----------
    const conversationId = String(body?.conversation_id || '');
    let conversation = null;
    if (conversationId) {
      conversation = await base44.asServiceRole.entities.AiConversation
        .get(conversationId)
        .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      // Vérification d'appartenance stricte : la discussion doit être celle de l'utilisateur connecté.
      if (!conversation || conversation.user_id !== user.id) {
        return Response.json({ error: 'Conversation introuvable' }, { status: 404 });
      }
    } else {
      conversation = await base44.asServiceRole.entities.AiConversation.create({
        user_id: user.id,
        user_email: user.email,
        title: titleFrom(content),
        last_message_at: new Date().toISOString(),
      });
    }

    await base44.asServiceRole.entities.AiMessage.create({
      conversation_id: conversation.id,
      user_id: user.id,
      user_email: user.email,
      role: 'user',
      content,
    });

    // Contexte limité aux 8 derniers messages, filtré sur le propriétaire.
    const historyPage = await base44.asServiceRole.entities.AiMessage.filter(
      { conversation_id: conversation.id, user_id: user.id },
      '-created_date',
      HISTORY_SIZE,
    );
    const history = (historyPage?.items || historyPage || []).slice().reverse();
    const transcript = history
      .map((m) => `${m.role === 'user' ? 'Utilisateur' : 'Matrix AI'}: ${m.content}`)
      .join('\n\n');

    const webLikely = needsWebSearch(content);
    const pseudo = user.pseudo || user.full_name || 'membre Matrix';

    // ---- Appel 1 : décision (réponse directe ou outils) ----
    const decisionPrompt = `${SYSTEM_PROMPT}

Contexte utilisateur : pseudo "${pseudo}", plan "${quota.tier}".

Conversation récente :
${transcript}

Analyse le dernier message.
- OBLIGATOIRE : si le message parle de serveurs, de créateurs/streamers/chaînes ou de jeux Matrix, tu DOIS renseigner "tool_calls" (1 à 3 appels) et laisser "answer" vide. Ne réponds jamais de mémoire sur ces sujets.
- Sinon, écris directement la réponse finale Markdown dans "answer".
- "needs_web" = true dès que la demande sort du périmètre Matrix (actualité, jeu, culture générale, technique, prix, sortie...) : tu t'appuies alors sur la recherche web fournie. false seulement pour l'annuaire Matrix (serveurs, créateurs, jeux du site), les infos internes Matrix ou la simple rédaction.`;

    const decisionSchema = {
      type: 'object',
      properties: {
        answer: { type: 'string' },
        needs_web: { type: 'boolean' },
        tool_calls: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tool: {
                type: 'string',
                enum: ['search_matrix_servers', 'search_matrix_creators', 'get_matrix_games'],
              },
              query: { type: 'string' },
              category: { type: 'string' },
              platform: { type: 'string' },
            },
            required: ['tool'],
          },
        },
      },
    };

    const decision = parseJson(
      await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: decisionPrompt,
        model: webLikely ? WEB_MODEL : CHAT_MODEL,
        add_context_from_internet: webLikely,
        response_json_schema: decisionSchema,
      }),
    ) || {};

    let toolCalls = Array.isArray(decision.tool_calls) ? decision.tool_calls.slice(0, 3) : [];

    // Filet de sécurité : une question de découverte passe toujours par la base Matrix.
    if (!toolCalls.length && looksLikeDiscovery(content)) {
      toolCalls = [
        { tool: 'search_matrix_servers', query: content },
        { tool: 'search_matrix_creators', query: content },
      ];
    }
    const needsWeb = webLikely || (Boolean(decision.needs_web) && !toolCalls.length);
    let answer = String(decision.answer || '').trim();
    let cards = [];

    if (toolCalls.length) {
      // ---- Outils internes ----
      const toolResults = [];
      for (const call of toolCalls) {
        const result = await runTool(base44, call);
        if (result) toolResults.push(result);
      }

      const flatResults = toolResults.flatMap((r) => r.results || []);
      const resultsForModel = toolResults.map((r) => ({
        tool: r.tool,
        results: (r.results || []).map(({ _card, ...rest }) => rest),
      }));

      const answerPrompt = `${SYSTEM_PROMPT}

Conversation récente :
${transcript}

Résultats des outils internes Matrix (JSON) :
${JSON.stringify(resultsForModel).slice(0, 6000)}

Rédige la réponse finale en Markdown à partir de ces résultats UNIQUEMENT.
- Si la liste est vide, dis-le honnêtement et propose de créer/référencer le serveur sur Best Serveur.
- N'invente aucun nom, chiffre, vote ou fonctionnalité.
- Ne mets aucun lien Markdown vers une fiche : les mini-cartes cliquables s'affichent automatiquement sous ta réponse.
- Renseigne "card_refs" avec les identifiants (ids) des éléments à afficher en mini-cartes (3 maximum).`;

      const answerSchema = {
        type: 'object',
        properties: {
          answer: { type: 'string' },
          card_refs: {
            type: 'array',
            items: {
              type: 'object',
              properties: { type: { type: 'string' }, id: { type: 'string' } },
            },
          },
        },
        required: ['answer'],
      };

      const final = parseJson(
        await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: answerPrompt,
          model: needsWeb ? WEB_MODEL : CHAT_MODEL,
          add_context_from_internet: needsWeb,
          response_json_schema: answerSchema,
        }),
      ) || {};

      answer = String(final.answer || answer || '').trim();
      const refs = Array.isArray(final.card_refs) ? final.card_refs : [];
      const refIds = refs.map((r) => String(r?.id || '')).filter(Boolean);

      const allCards = flatResults.map((item) => item._card).filter(Boolean);
      const picked = refIds.length
        ? allCards.filter((card) => refIds.includes(String(card.id)))
        : allCards;
      cards = picked.slice(0, 3);
    }

    if (!answer) {
      answer = "Je n'ai pas réussi à formuler une réponse. Reformule ta demande ou réessaie dans un instant.";
    }

    const assistantMessage = await base44.asServiceRole.entities.AiMessage.create({
      conversation_id: conversation.id,
      user_id: user.id,
      user_email: user.email,
      role: 'assistant',
      content: answer,
      attached_cards: cards,
    });

    await base44.asServiceRole.entities.AiConversation.update(conversation.id, {
      last_message_at: new Date().toISOString(),
    });

    return Response.json({
      conversation_id: conversation.id,
      conversation_title: conversation.title,
      message: {
        id: assistantMessage.id,
        role: 'assistant',
        content: answer,
        attached_cards: cards,
        created_date: assistantMessage.created_date,
      },
      quota: quotaPayload({
        ...quota,
        used: usedAfter,
        hourCount: hourAfter,
        resetPatch: {},
      }),
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}