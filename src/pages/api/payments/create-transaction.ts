import type { APIRoute } from 'astro';
import midtransClient from 'midtrans-client';

const MIDTRANS_SERVER_KEY = import.meta.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_CLIENT_KEY = import.meta.env.MIDTRANS_CLIENT_KEY || import.meta.env.PUBLIC_MIDTRANS_CLIENT_KEY;
const MIDTRANS_IS_PRODUCTION = String(import.meta.env.MIDTRANS_IS_PRODUCTION || import.meta.env.PUBLIC_MIDTRANS_IS_PRODUCTION || 'false') === 'true';

const snap = MIDTRANS_SERVER_KEY
  ? new midtransClient.Snap({
      isProduction: MIDTRANS_IS_PRODUCTION,
      serverKey: MIDTRANS_SERVER_KEY,
      clientKey: MIDTRANS_CLIENT_KEY,
    })
  : null;

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!snap) {
    return new Response(JSON.stringify({ error: 'Midtrans server key is not configured' }), { status: 500 });
  }

  try {
    const payload = await request.json();
    const {
      orderId,
      grossAmount,
      items,
      customer,
      shippingAddress,
    } = payload || {};

    if (!orderId || !grossAmount || !items?.length || !customer?.email) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    const transactionParams = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(grossAmount),
      },
      item_details: items.map((item: any) => ({
        id: item.id,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.name?.slice(0, 50) || 'Item',
      })),
      customer_details: {
        first_name: customer.name || 'UMKM User',
        email: customer.email,
        phone: customer.phone || '',
        shipping_address: shippingAddress
          ? {
              first_name: shippingAddress.name,
              phone: shippingAddress.phone,
              address: shippingAddress.fullAddress,
              city: shippingAddress.city || '',
              postal_code: shippingAddress.postalCode || '',
              country_code: 'IDN',
            }
          : undefined,
      },
    };

    const transaction = await snap.createTransaction(transactionParams);

    return new Response(JSON.stringify(transaction), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('[payments/create-transaction] error', error);
    return new Response(JSON.stringify({ error: error?.message || 'Failed to create transaction' }), {
      status: 500,
    });
  }
};

