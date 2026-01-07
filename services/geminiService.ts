import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// Jika 2.5 sering overloaded, kita bisa coba fallback ke model lain
// Pilihan: "gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash-001"
const MODEL_NAME = "gemini-2.5-flash";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// Helper untuk delay (menunggu)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendMessageToGemini(message: string): Promise<string> {
  console.log("[Gemini] API Key:", GEMINI_API_KEY ? "Found" : "Not Found");
  console.log("[Gemini] API Key length:", GEMINI_API_KEY?.length);

  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === "") {
    throw new Error("Gemini API key tidak ditemukan atau kosong");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: { temperature: 0.7 },
  });

  // KITA LAKUKAN MAKSIMAL 3 KALI PERCOBAAN
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(message);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.warn(`Percobaan ke-${attempt} gagal:`, error.message);

      // Cek apakah errornya 503 (Overloaded)
      const isOverloaded =
        error.message?.includes("503") || error.message?.includes("overloaded");

      // Jika errornya 503 DAN kita masih punya sisa kesempatan mencoba
      if (isOverloaded && attempt < MAX_RETRIES) {
        // Tunggu sebentar sebelum mencoba lagi (Exponential Backoff)
        // Percobaan 1: tunggu 1 detik, Percobaan 2: tunggu 2 detik
        const waitTime = attempt * 1000;
        console.log(
          `Server sibuk (503). Menunggu ${waitTime}ms sebelum mencoba lagi...`
        );
        await delay(waitTime);
        continue; // Lanjut ke loop berikutnya (coba lagi)
      }

      // Jika error bukan 503, atau sudah habis kesempatan mencoba -> Lempar Error
      let errorMessage = "Gagal memproses AI.";
      console.error("[Gemini] Error details:", error);

      if (isOverloaded) {
        errorMessage =
          "Server AI sedang sangat sibuk. Silakan coba lagi nanti.";
      } else if (
        error.message?.includes("API_KEY_INVALID") ||
        error.message?.includes("API key")
      ) {
        errorMessage = "API Key tidak valid. Periksa konfigurasi.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      throw new Error(errorMessage);
    }
  }

  throw new Error("Gagal menghubungi AI setelah beberapa kali mencoba.");
}
