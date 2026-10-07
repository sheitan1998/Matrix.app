// Compute HMAC-SHA256 signature (hex) using the server's api_key as secret
export async function computeHmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b: number) => b.toString(16).padStart(2, '0')).join('');
}

// Send a signed POST request to the server owner's webhook URL after a vote
export async function sendVoteWebhook(webhookUrl: string, webhookToken: string, pseudo: string, serverId: string) {
  try {
    const bodyStr = JSON.stringify({
      pseudo,
      server_id: serverId,
      timestamp: new Date().toISOString(),
    });
    const signature = await computeHmacSha256(webhookToken, bodyStr);
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Matrix-Signature': signature,
      },
      body: bodyStr,
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error('[voteWebhook] Webhook delivery failed:', err);
  }
}