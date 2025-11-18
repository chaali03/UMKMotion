import type { APIRoute } from 'astro';

const RAJAONGKIR_API_KEY = import.meta.env.RAJAONGKIR_API_KEY;
const RAJAONGKIR_ORIGIN_CITY_ID =
  import.meta.env.RAJAONGKIR_ORIGIN_CITY_ID || import.meta.env.PUBLIC_RAJAONGKIR_ORIGIN_CITY_ID;

type RajaOngkirCity = {
  city_id: string;
  city_name: string;
  type: string;
  province: string;
};

type DeliveryOption = {
  id: string;
  name: string;
  provider: string;
  type: 'instant' | 'same-day' | 'regular';
  price: number;
  estimatedTime: string;
  icon: string;
  color: string;
  isCOD: boolean;
  distance?: number;
  source: 'rajaongkir' | 'instant' | 'fallback';
};

let cachedCities: RajaOngkirCity[] | null = null;
let cacheTimestamp = 0;
const CITY_CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function ensureCityCache() {
  if (!RAJAONGKIR_API_KEY) return;
  const now = Date.now();
  if (cachedCities && now - cacheTimestamp < CITY_CACHE_TTL) return;

  const res = await fetch('https://api.rajaongkir.com/starter/city', {
    headers: {
      key: RAJAONGKIR_API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load city list (${res.status})`);
  }

  const payload = await res.json();
  cachedCities = payload?.rajaongkir?.results ?? [];
  cacheTimestamp = now;
}

function normalizeCity(city?: string) {
  return (city || '')
    .toLowerCase()
    .replace(/kota\s+/g, '')
    .replace(/kabupaten\s+/g, '')
    .trim();
}

async function getCityId(name: string): Promise<string | null> {
  if (!RAJAONGKIR_API_KEY) return null;
  await ensureCityCache();
  if (!cachedCities) return null;
  const normalized = normalizeCity(name);
  const match = cachedCities.find((city) => normalizeCity(city.city_name) === normalized);
  return match?.city_id ?? null;
}

async function fetchCosts(originId: string, destinationId: string, weight: number, courier: string) {
  if (!RAJAONGKIR_API_KEY) return [];
  const body = new URLSearchParams({
    origin: originId,
    destination: destinationId,
    weight: String(Math.max(1000, Math.round(weight))), // grams
    courier,
  });

  const res = await fetch('https://api.rajaongkir.com/starter/cost', {
    method: 'POST',
    headers: {
      key: RAJAONGKIR_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`RajaOngkir cost error (${res.status})`);
  }

  const payload = await res.json();
  return payload?.rajaongkir?.results?.[0]?.costs ?? [];
}

function buildInstantOptions(distanceKm: number): DeliveryOption[] {
  const cappedDistance = Math.max(1, Math.min(distanceKm, 30));
  const instantProviders = [
    {
      id: 'gosend',
      name: 'GoSend Instant',
      provider: 'Gojek',
      icon: '🏍️',
      color: '#00AA13',
      base: 15000,
      perKm: 2500,
    },
    {
      id: 'grabexpress',
      name: 'GrabExpress',
      provider: 'Grab',
      icon: '🚗',
      color: '#00B14F',
      base: 16000,
      perKm: 2700,
    },
  ];

  return instantProviders.map((provider) => ({
    id: provider.id,
    name: provider.name,
    provider: provider.provider,
    type: cappedDistance <= 10 ? 'instant' : 'same-day',
    icon: provider.icon,
    color: provider.color,
    estimatedTime: cappedDistance <= 10 ? '1-2 jam' : 'Hari ini',
    price: Math.round(provider.base + cappedDistance * provider.perKm),
    isCOD: true,
    distance: distanceKm,
    source: 'instant' as const,
  }));
}

function buildRegularFallback(distanceKm: number): DeliveryOption[] {
  const safeDistance = Math.max(1, distanceKm);
  const tiers = [
    {
      id: 'jne-reg',
      name: 'JNE Regular',
      provider: 'JNE',
      type: 'regular' as const,
      price: safeDistance < 50 ? 10000 : safeDistance < 100 ? 15000 : 25000,
      estimatedTime: '2-3 hari',
      color: '#E31E24',
      isCOD: true,
    },
    {
      id: 'jne-yes',
      name: 'JNE YES',
      provider: 'JNE',
      type: 'same-day' as const,
      price: safeDistance < 50 ? 20000 : safeDistance < 100 ? 30000 : 45000,
      estimatedTime: '1 hari',
      color: '#E31E24',
      isCOD: false,
    },
    {
      id: 'sicepat-reg',
      name: 'SiCepat REG',
      provider: 'SiCepat',
      type: 'regular' as const,
      price: safeDistance < 50 ? 9000 : safeDistance < 100 ? 14000 : 23000,
      estimatedTime: '2-3 hari',
      color: '#FFD700',
      isCOD: true,
    },
    {
      id: 'jnt-reg',
      name: 'J&T Express',
      provider: 'J&T',
      type: 'regular' as const,
      price: safeDistance < 50 ? 8000 : safeDistance < 100 ? 13000 : 22000,
      estimatedTime: '2-4 hari',
      color: '#E74C3C',
      isCOD: true,
    },
  ];

  return tiers.map((tier) => ({
    ...tier,
    icon: '📦',
    distance: safeDistance,
    source: 'fallback' as const,
  }));
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      destinationCity,
      weight,
      distanceKm,
    }: { destinationCity?: string; weight?: number; distanceKm?: number } = body;

    if (!destinationCity || typeof distanceKm !== 'number') {
      const safeDistance = Math.max(1, Number(distanceKm) || 10);
      const fallback = [...buildInstantOptions(safeDistance), ...buildRegularFallback(safeDistance)].sort(
        (a, b) => a.price - b.price,
      );
      return new Response(
        JSON.stringify({
          options: fallback,
          note: 'Missing destinationCity/distanceKm. Returning estimated fallback options.',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        },
      );
    }

    const safeDistance = Math.max(1, distanceKm);
    const fallback = [...buildInstantOptions(safeDistance), ...buildRegularFallback(safeDistance)];
    const useInstant = safeDistance <= 30;
    const options: DeliveryOption[] = [];

    if (!RAJAONGKIR_API_KEY || !RAJAONGKIR_ORIGIN_CITY_ID) {
      return new Response(
        JSON.stringify({
          options: fallback.sort((a, b) => a.price - b.price),
          note: 'RajaOngkir tidak dikonfigurasi. Menggunakan tarif estimasi.',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        },
      );
    }

    if (useInstant) {
      options.push(...buildInstantOptions(distanceKm));
    }

    if (RAJAONGKIR_API_KEY && RAJAONGKIR_ORIGIN_CITY_ID) {
      const cityId = await getCityId(destinationCity);
      if (cityId) {
        const couriers = ['jne', 'pos', 'tiki', 'jnt'];
        for (const courier of couriers) {
          try {
            const costs = await fetchCosts(RAJAONGKIR_ORIGIN_CITY_ID, cityId, weight || 1000, courier);
            costs.forEach((service: any) => {
              const costDetail = service?.cost?.[0];
              if (!costDetail) return;
              options.push({
                id: `${courier}-${service.service}`.toLowerCase(),
                name: `${courier.toUpperCase()} ${service.service}`,
                provider: courier.toUpperCase(),
                type: distanceKm > 30 ? 'regular' : service.service.toLowerCase().includes('yes') ? 'same-day' : 'regular',
                price: costDetail.value,
                estimatedTime: costDetail.etd ? `${costDetail.etd} hari` : '2-4 hari',
                icon: '📦',
                color: courier === 'jne' ? '#E31E24' : courier === 'jnt' ? '#E74C3C' : '#1E3A8A',
                isCOD: courier !== 'pos',
                distance: distanceKm,
                source: 'rajaongkir',
              });
            });
          } catch (err) {
            console.warn(`[shipping/options] courier ${courier} failed: ${(err as Error).message}`);
          }
        }
      }
    }

    if (options.length === 0) {
      options.push(...fallback);
    }

    options.sort((a, b) => a.price - b.price);

    return new Response(
      JSON.stringify({
        options,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error: any) {
    console.error('[shipping/options] error', error);
    return new Response(
      JSON.stringify({
        error: error?.message || 'Shipping options error',
      }),
      { status: 500 },
    );
  }
};

