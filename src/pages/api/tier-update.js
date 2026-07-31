export const prerender = false;

export async function POST({ request }) {
  try {
    const secret = request.headers.get('x-bot-secret');
    console.log('Received secret:', JSON.stringify(secret));
    console.log('Expected secret:', JSON.stringify(import.meta.env.BOT_SECRET));

    if (secret !== import.meta.env.BOT_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { ign, tier, gamemode, userId, guildId } = body;

    console.log(`${ign} -> ${tier} (${gamemode})`);

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