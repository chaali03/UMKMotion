import type { APIRoute } from 'astro';
import * as admin from 'firebase-admin';

export const prerender = false;

const EXPIRES_IN = 60 * 60 * 24 * 7 * 1000; // 7 days

// Hardcoded for test (remove after ENV works)
const firebaseConfig = {
  projectId: "umkmotion-a39b9",
  clientEmail: "firebase-adminsdk-fbsvc@umkmotion-a39b9.iam.gserviceaccount.com",
  privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDSKGbhYYgozwmQ
BVk18d2oktxLxF2ZRN5baStQux2QCqC23tzdLNyFotJaj1VvhGE4DHkw8VXf+/6S
HfAphxE4ClN7hNuB9OtLoRsaMLiES75CySD0fA4aPNsiRNYt9XCTD6c7hAs02rp3
Zub8w0R7syT498YVgHGmCQMywXDxf1e1y5qi6ndO13LejroipqH5mmOCcRSf/uyi
VvJPCRXSrvFmb+dAkUyB5whRwFuGczTyh5V2ICJQ6kHErw/sAd+GAIKTeQHKru/e
iDbGwpA5bxrJdVQYDuIx6Jmprgh/GHBbR6lezlxYNaRJZLtnf1sZIYEpQQR6duDg
QkN+lFb5AgMBAAECggEABEOl2m5N/W79sDk4Oc9y2moYHnuelGmIyKp3V/5jT4ze
/TWZM23cOnlxmCe8Tu9CQOlZjFgkmw8sIjye3DGFicwFgjYm9T8kxu50TslyNbFV
lq8UVDr6rHFeQcF2EO1qok9GYEn8p2RF9ZOGKGw8D4r/ZcOy9nTPtDPkB4OpkNAw
XpyzkuD3Qku+OUyhdRx6q+ZWpukFNzPJYUxUgrN2cwfFI7UeILhgmnSNtSAKyzAC
OPvZ3GjsaRLO6QhfbHoCsU+oraeTmZwJ48nXAr4sgU054Tto3nEAVXw4of8SjtQv
D1o6IA0jEEJrU/jtbY9rp5hJY6rfsLi77KPv5s4agQKBgQDzC8i8ipBEJ54Nt/0q
CjqOo+/Jv5eXpQTzrlYvLj2rNRziZUMRR5MaNEpMrVAmwMyH4AIlASXeqGEjHvpT
aAwtc3zLEwWwMHF7DR/W6esZU/LQJDT1rTNdshvut9EGnHHo8mWQC56pfId2CQwy
Glx3FYpCboBhdyYNwGIVTOOJeQKBgQDdW+DF97bLmpovNxq98E/RdHNEiPVtHpcy
wy1LETTRz5r2LtbMhcxIIyY6GI4HaFAmx/UBZE+Kk0b0gHsUYLXzJLYb0e4RY2E1
GRLwJmjd94dwN6QFqpBJ9ExgVjn62obJNaLOnfd0iVZEL7mCUS8jULHjB93m3ORl
i6kdNulZgQKBgQCHtrXRagIivIiKGon4FpwaGDqGSkCowdGhDGE9mTGAT3kghfDM
Tk463KX8aO6PpSrQWGp6JUjzKsyK4vpe5oOeQZWWg7myZ2qGjo6P4DCSBQlZ5k3Y
PW2oTRNB2kySx3rn26qQo5xmAY5Wf7japVOqf1GjxLZVNkX+ecWLJVMM6QKBgAUH
fl7hFu0fURt7hAcGu7mFjMzk07ar+EF1/8Rx2qJdtiabv9Obwp1s9wRg5HE0pIWN
C3sBnXEHkZgihylaXSfuEJknNuJ8QIwlSrHcHYvVgOVCzl42ltqnS0jxDJYvetp9
dnp9Sk8Cg8w+zVcxowGJZtFCr378S9Am0SvRwJGBAoGBAN4CJV3ldv/4H+E18nz3
vk29ndPiiNOOUXq09RnS/1euCIcDMYZs/sS/jiB0+ZUQN4W46a6aqpGK1G6b2qft
Arq5rh0F6RBXkucBw1dsXPcNV5UDexy1b9WUIXASMWHqB/nlV/fgJ+ZH4kWn+2jk
0y3wxEqcqG+vcgDlnstdhmZ4
-----END PRIVATE KEY-----`
};

let app: admin.app.App | undefined;

function getTestAdminApp() {
  if (app) return app;
  if (admin.apps.length) {
    app = admin.app();
    return app;
  }

  app = admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
  });
  return app;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { idToken } = await request.json();
    if (!idToken) return new Response(JSON.stringify({ error: 'Missing idToken' }), { status: 400 });

    const auth = getTestAdminApp().auth();
    const decoded = await auth.verifyIdToken(idToken);
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN });

    const isProd = process.env.NODE_ENV === 'production';
    cookies.set('session', sessionCookie, {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: EXPIRES_IN / 1000,
    });

    return new Response(JSON.stringify({ uid: decoded.uid, success: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Session create failed' }), { status: 401 });
  }
};
