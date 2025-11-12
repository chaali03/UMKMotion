import type { APIRoute } from 'astro';
import { upsertStoresByName } from '../../lib/stores';
import { stores } from '../../TokoData/stores';

export const prerender = false;

export const POST: APIRoute = async () => {
  try {
    const payload = stores.map((s) => {
      const base: any = {
        name: s.name,
        image: s.image || s.profileImage,
        profileImage: s.profileImage,
        email: s.email,
        phone: s.phone,
        address: s.address,
        rating: s.rating,
        openDays: s.openDays,
        openHours: s.openHours,
        mapsLink: s.mapsLink,
        description: (s as any).description,
      };
      const facilities = (s as any).facilities as string[] | undefined;
      if (Array.isArray(facilities) && facilities.length > 0) base.facilities = facilities;
      const paymentMethods = (s as any).paymentMethods as string[] | undefined;
      if (Array.isArray(paymentMethods) && paymentMethods.length > 0) base.paymentMethods = paymentMethods;

      // Remove undefined, null, and empty-string values
      return Object.fromEntries(
        Object.entries(base).filter(([, v]) => v !== undefined && v !== null && (typeof v !== 'string' || v.trim() !== ''))
      );
    });

    const result = await upsertStoresByName(payload as any);
    return new Response(JSON.stringify({ ok: true, count: result.length }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'seed stores failed' }), { status: 500 });
  }
};

export const GET = POST;
