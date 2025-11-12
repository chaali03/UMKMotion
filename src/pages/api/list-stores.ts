import type { APIRoute } from 'astro';
import { listStores } from '../../lib/stores';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const items = await listStores();
    return new Response(JSON.stringify({ count: items.length, items }, null, 2), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'failed' }), { status: 500 });
  }
};
