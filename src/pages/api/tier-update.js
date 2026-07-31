export const prerender = false;

export async function POST({ request }) {
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

    console.log(`${ign} -> ${tier} (${gamemode})`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}