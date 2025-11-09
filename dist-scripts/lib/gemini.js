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
async function listAvailableModels() {
    const versions = ['v1', 'v1beta'];
    for (const ver of versions) {
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/${ver}/models?key=${encodeURIComponent(API_KEY)}`);
            if (!res.ok)
                continue;
            const data = await res.json();
            const models = (data?.models || []).map((m) => m?.name?.replace(/^models\//, '')).filter(Boolean);
            if (models.length)
                return models;
        }
        catch { }
    }
    return [];
}
// System prompt for UMKM-focused responses
export const DINA_SYSTEM_PROMPT = `
Kamu adalah Dina, asisten AI khusus untuk UMKMotion - platform direktori UMKM Indonesia. 

IDENTITAS:
- Nama: Dina
- Peran: Asisten AI UMKMotion
- Kepribadian: Ramah, profesional, dan membantu

TUGAS UTAMA:
1. Membantu pengguna mencari informasi tentang UMKM di Indonesia
2. Memberikan saran bisnis untuk pelaku UMKM
3. Menjelaskan fitur-fitur UMKMotion
4. Membantu dengan konsultasi bisnis UMKM

BATASAN:
- HANYA menjawab pertanyaan terkait UMKM, bisnis kecil, dan UMKMotion
- Jika ditanya hal di luar topik UMKM, arahkan kembali ke topik UMKM
- Selalu gunakan bahasa Indonesia yang ramah dan profesional
- Berikan jawaban yang praktis dan actionable

GAYA KOMUNIKASI:
- Gunakan sapaan yang hangat
- Berikan contoh konkret jika memungkinkan
- Tawarkan bantuan lebih lanjut di akhir respons
- Gunakan emoji secukupnya untuk membuat percakapan lebih friendly

Contoh respons jika ditanya hal di luar topik:
"Maaf, saya Dina, asisten khusus untuk UMKM dan UMKMotion. Saya hanya bisa membantu dengan pertanyaan seputar UMKM, bisnis kecil, dan platform kami. Ada yang bisa saya bantu terkait UMKM? 😊"
`;
export async function generateResponse(prompt, imageData) {
    const fullPrompt = `${DINA_SYSTEM_PROMPT}\n\nPertanyaan pengguna: ${prompt}`;
    // Build REST body per Generative Language API
    const buildBody = (text, img) => {
        const parts = [{ text }];
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
    const models = Array.from(new Set([...(imageData
            ? discovered.filter(n => /vision|image|1\.5|flash|pro/i.test(n))
            : discovered.filter(n => !/vision|image/i.test(n))),
        ...preferred,
    ]));
    for (const ver of versions) {
        for (const model of models) {
            try {
                const res = await fetch(`https://generativelanguage.googleapis.com/${ver}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(API_KEY)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(buildBody(fullPrompt, imageData)),
                });
                if (!res.ok) {
                    const txt = await res.text();
                    // Try next model/version on 404 or not supported
                    if (res.status === 404 || /not found|not supported/i.test(txt))
                        continue;
                    // Surface other errors (401/403/etc.)
                    throw new Error(txt || `HTTP ${res.status}`);
                }
                const data = await res.json();
                const candidate = data?.candidates?.[0];
                const parts = candidate?.content?.parts || [];
                const textOut = parts.map((p) => p?.text).filter(Boolean).join('');
                if (textOut)
                    return textOut;
                // If empty, try next model
            }
            catch (e) {
                const msg = String(e?.message || e);
                if (/404|not found|not supported/i.test(msg))
                    continue;
                // For other errors, bubble up so user sees a meaningful message
                throw e;
            }
        }
    }
    return 'Maaf, model AI tidak tersedia saat ini. Silakan coba lagi nanti.';
}
export async function generateStreamResponse(prompt) {
    const fullPrompt = `${DINA_SYSTEM_PROMPT}\n\nPertanyaan pengguna: ${prompt}`;
    let lastError = null;
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
        }
        catch (err) {
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
