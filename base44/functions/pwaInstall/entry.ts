import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function parseUserAgent(ua) {
  let browser = 'Unknown';
  let os = 'Unknown';

  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/')) browser = 'Safari';

  if (ua.includes('Windows NT 10')) os = 'Windows';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return { browser, os };
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if this user already has an installation record (avoid duplicates)
    const existing = await base44.asServiceRole.entities.PWAInstallations.filter({
      user_email: user.email,
    });
    if (existing.length > 0) {
      return Response.json({ success: true, alreadyRecorded: true });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const { browser, os } = parseUserAgent(userAgent);

    await base44.asServiceRole.entities.PWAInstallations.create({
      user_id: user.id,
      user_email: user.email,
      user_pseudo: user.pseudo || '',
      browser,
      os,
      user_agent: userAgent,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}