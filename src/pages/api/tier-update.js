import { createClient } from 'redis';

export const prerender = false;

async function getRedisClient() {
  const client = createClient({ url: import.meta.env.REDIS_URL });
  await client.connect();
  return client;
}

export async function POST({ request }) {
  let client;
  try {
    const secret = request.headers.get('x-bot-secret');

    if (secret !== import.meta.env.BOT_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { ign, tier, gamemode, userId, guildId } = body;

    const normalizedGamemode = gamemode.trim().toUpperCase();

    const tierPoints = {
      HT1: 60, LT1: 45, HT2: 30, LT2: 20,
      HT3: 10, LT3: 6,  HT4: 4,  LT4: 3,
      HT5: 2,  LT5: 1
    };

    client = await getRedisClient();

    const existingRaw = await client.hGet('players', ign);
    const existing = existingRaw ? JSON.parse(existingRaw) : {
      name: ign,
      region: 'EU',
      avatar: `https://mc-heads.net/avatar/${ign}/64`,
      tiers: {}
    };

    existing.tiers[normalizedGamemode] = {
      tier,
      pts: tierPoints[tier] || 0
    };

    await client.hSet('players', ign, JSON.stringify(existing));

    console.log(`${ign} -> ${tier} (${normalizedGamemode})`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('POST error:', error);
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    if (client) await client.disconnect();
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Allow': 'POST, GET, HEAD, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-bot-secret'
    }
  });
}

export async function GET() {
  return new Response(JSON.stringify({ status: 'ok', message: 'Tier update endpoint is live' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}