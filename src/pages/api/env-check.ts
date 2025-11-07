import type { APIRoute } from 'astro';

function mask(value: string | undefined, left = 3, right = 4) {
  if (!value) return 'UNDEFINED';
  if (value.length <= left + right) return '*'.repeat(Math.max(4, value.length));
  return `${value.slice(0, left)}***${value.slice(-right)}`;
}

export const GET: APIRoute = async () => {
  const viteEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
  const nodeEnv = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || (viteEnv as any).NODE_ENV || undefined;
  const isProd = (nodeEnv || '').toLowerCase() === 'production';

  if (isProd) {
    return new Response(JSON.stringify({ error: 'Disabled in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const penv = (typeof process !== 'undefined' && process.env) || {} as Record<string, string>;
  const venv = (viteEnv as Record<string, string>) || {} as Record<string, string>;
  const get = (k: string) => penv[k] ?? venv[k];

  const payload = {
    NODE_ENV: nodeEnv || 'UNDEFINED',
    SMTP_HOST: get('SMTP_HOST') || 'UNDEFINED',
    SMTP_PORT: get('SMTP_PORT') || 'UNDEFINED',
    SMTP_SECURE: get('SMTP_SECURE') || 'UNDEFINED',
    SMTP_USER: mask(get('SMTP_USER')),
    SMTP_PASS: mask(get('SMTP_PASS')),
    SMTP_FROM: get('SMTP_FROM') ? (get('SMTP_FROM') as string).replace(/<([^>]+)>/, '<***@***>') : 'UNDEFINED',
    DEV_OTP_FALLBACK: get('DEV_OTP_FALLBACK') || 'UNDEFINED',
    _sources: {
      process: {
        SMTP_HOST: penv.SMTP_HOST ? 'set' : 'unset',
        SMTP_PORT: penv.SMTP_PORT ? 'set' : 'unset',
        SMTP_SECURE: penv.SMTP_SECURE ? 'set' : 'unset',
        SMTP_USER: penv.SMTP_USER ? 'set' : 'unset',
        SMTP_PASS: penv.SMTP_PASS ? 'set' : 'unset',
        SMTP_FROM: penv.SMTP_FROM ? 'set' : 'unset',
      },
      importMeta: {
        SMTP_HOST: (venv as any).SMTP_HOST ? 'set' : 'unset',
        SMTP_PORT: (venv as any).SMTP_PORT ? 'set' : 'unset',
        SMTP_SECURE: (venv as any).SMTP_SECURE ? 'set' : 'unset',
        SMTP_USER: (venv as any).SMTP_USER ? 'set' : 'unset',
        SMTP_PASS: (venv as any).SMTP_PASS ? 'set' : 'unset',
        SMTP_FROM: (venv as any).SMTP_FROM ? 'set' : 'unset',
      }
    }
  } as const;

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
};


