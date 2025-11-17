import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const targetParam = url.searchParams.get('url');
    if (!targetParam) {
      return new Response('Missing url', { status: 400 });
    }

    let target: URL;
    try {
      target = new URL(targetParam);
    } catch {
      return new Response('Invalid url parameter', { status: 400 });
    }

    if (!/^https?:$/.test(target.protocol)) {
      return new Response('Only http/https targets are allowed', { status: 400 });
    }

    const targetHref = target.toString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(targetHref, {
      redirect: 'follow',
      headers: {
        // Attempt to bypass hotlink protections
        'User-Agent': 'Mozilla/5.0 (compatible; UMKMotionBot/1.0)',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': target.origin,
      },
      signal: controller.signal,
    }).catch((e) => {
      return new Response('Fetch error: ' + e?.message, { status: 502 });
    });
    clearTimeout(timeout);

    if (!(res instanceof Response)) {
      return res as any;
    }

    if (!res.ok) {
      return new Response(`Upstream error (${res.status})`, { status: 502 });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await res.arrayBuffer();
    return new Response(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    return new Response('Proxy error: ' + (err?.message || 'unknown'), { status: 500 });
  }
};
