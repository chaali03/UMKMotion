import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = (typeof window !== 'undefined' && window.ENV?.GEMINI_API_KEY) || 
                (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
                'your-gemini-api-key';

if (!API_KEY || API_KEY === 'your-gemini-api-key') {
  console.warn('Gemini API key not found. Please set GEMINI_API_KEY environment variable.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Preferred models in order per modality; start with v1beta-compatible (pro) to avoid 404s
const TEXT_MODEL_CANDIDATES = [
  "gemini-pro",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest"
];

const MULTIMODAL_MODEL_CANDIDATES = [
  "gemini-pro-vision",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest"
];

async function listAvailableModels(): Promise<string[]> {
  const versions = ['v1', 'v1beta'];
  for (const ver of versions) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/${ver}/models?key=${encodeURIComponent(API_KEY)}`);
      if (!res.ok) continue;
      const data = await res.json();
      const models: string[] = (data?.models || []).map((m: any) => m?.name?.replace(/^models\//, '')).filter(Boolean);
      if (models.length) return models;
    } catch {}
  }
  return [];
}

// System prompt for UMKM product-only assistant behavior
export const DINA_SYSTEM_PROMPT = `
Kamu adalah Dina, asisten AI UMKMotion yang HANYA membantu pencarian dan informasi PRODUK UMKM. Fokusmu adalah membantu pengguna menemukan produk UMKM yang relevan dan terdekat.

IDENTITAS:
- Nama: Dina
- Peran: Asisten pencarian produk UMKM di UMKMotion
- Kepribadian: Ramah, ringkas, solutif

TUGAS UTAMA (produk saja):
1) Memahami kebutuhan produk pengguna (kategori/jenis, merek/jenis bahan, kisaran harga, lokasi/daerah).
2) Menemukan dan merekomendasikan produk UMKM yang cocok, utamakan yang TERDEKAT dari lokasi pengguna bila tersedia.
3) Memberi detail produk: nama, kategori, kisaran harga, lokasi/daerah, kontak/tautan bila ada di platform.
4) Jika informasi tidak lengkap, ajukan pertanyaan klarifikasi (contoh: lokasi, anggaran, preferensi).

BATASAN KETAT:
- TOLAK atau ARAHKAN KEMBALI semua topik non-produk: promosi/marketing, keuangan, operasional bisnis, HR, legal, teknologi umum, dll.
- Jika pertanyaan bukan tentang produk UMKM, jawab singkat untuk mengarahkan: "Maaf, saya khusus bantu produk UMKM. Produk apa yang kamu cari dan di daerah mana?"
- Jangan membuat klaim stok yang pasti. Gunakan bahasa probabilistik ("kemungkinan", "tersedia di", "cek ketersediaan").
- Jangan membagikan data pribadi sensitif.

PERILAKU PENCARIAN:
- Selalu minta atau gunakan lokasi (kota/kecamatan) untuk memprioritaskan rekomendasi terdekat.
- Jika lokasi tidak ada, minta lokasinya terlebih dahulu sebelum memberi rekomendasi final.
- Rekomendasikan 3–5 item ringkas dan mudah dipindai (bullet/daftar), urutkan dari terdekat atau paling relevan.
- Akhiri dengan ajakan singkat: "Mau difilter lagi berdasarkan harga/lokasi?"

GAYA KOMUNIKASI:
- Hangat, jelas, dan to the point. Gunakan bahasa Indonesia.
- Hindari emoji berlebihan; maksimal 1 bila perlu.

Contoh penolakan halus non-produk:
"Maaf, aku fokus bantu cari produk UMKM. Sebutkan produk yang kamu cari dan lokasimu ya, biar aku carikan yang terdekat."
`;

export async function generateResponse(prompt: string, imageData?: string): Promise<string> {
  const fullPrompt = `${DINA_SYSTEM_PROMPT}\n\nPertanyaan pengguna: ${prompt}`;

  // Build REST body per Generative Language API
  const buildBody = (text: string, img?: string) => {
    const parts: any[] = [{ text }];
    if (img) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: img.split(',')[1],
        },
      });
    }
    return {
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    };
  };

  const versions = ['v1', 'v1beta'];
  const discovered = await listAvailableModels();
  const preferred = imageData ? MULTIMODAL_MODEL_CANDIDATES : TEXT_MODEL_CANDIDATES;
  // Merge discovered-first (preserve order), then preferred as fallback, then de-dupe
  const models = Array.from(new Set([...
    (imageData
      ? discovered.filter(n => /vision|image|1\.5|flash|pro/i.test(n))
      : discovered.filter(n => !/vision|image/i.test(n))
    ),
    ...preferred,
  ]));

  for (const ver of versions) {
    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/${ver}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(API_KEY)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildBody(fullPrompt, imageData)),
          }
        );

        if (!res.ok) {
          const txt = await res.text();
          // Try next model/version on 404 or not supported
          if (res.status === 404 || /not found|not supported/i.test(txt)) continue;
          // Surface other errors (401/403/etc.)
          throw new Error(txt || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const candidate = data?.candidates?.[0];
        const parts = candidate?.content?.parts || [];
        const textOut = parts.map((p: any) => p?.text).filter(Boolean).join('');
        if (textOut) return textOut;
        // If empty, try next model
      } catch (e) {
        const msg = String((e as any)?.message || e);
        if (/404|not found|not supported/i.test(msg)) continue;
        // For other errors, bubble up so user sees a meaningful message
        throw e;
      }
    }
  }

  return 'Maaf, model AI tidak tersedia saat ini. Silakan coba lagi nanti.';
}

export async function generateStreamResponse(prompt: string): Promise<ReadableStream> {
  const fullPrompt = `${DINA_SYSTEM_PROMPT}\n\nPertanyaan pengguna: ${prompt}`;

  let lastError: any = null;
  const discovered = await listAvailableModels();
  const candidates = Array.from(new Set([
    ...discovered.filter(n => !/vision|image/i.test(n)),
    ...TEXT_MODEL_CANDIDATES
  ])); // streaming for text prompts
  for (const modelName of candidates) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        },
      });
      const result = await model.generateContentStream(fullPrompt);
      return new ReadableStream({
        async start(controller) {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
          controller.close();
        }
      });
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || err);
      if (/404|not found|not supported/i.test(msg)) {
        continue;
      }
      throw err;
    }
  }

  console.error('Error generating stream response (all models failed):', lastError);
  throw new Error('Model streaming tidak tersedia saat ini.');
}
