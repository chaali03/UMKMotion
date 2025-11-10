import type { APIRoute } from 'astro';
import { seedProduk } from '../../produkdata/produkdata';

export const prerender = false;

export const POST: APIRoute = async () => {
  try {
    await seedProduk();
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'seed failed' }), { status: 500 });
  }
};

export const GET = POST;
