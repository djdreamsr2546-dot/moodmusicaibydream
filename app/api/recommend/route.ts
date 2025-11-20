import { GoogleGenerativeAI } from "@google/generative-ai";
import SpotifyWebApi from "spotify-web-api-node";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let searchQuery = "Top Hits Thailand"; // ค่าเริ่มต้นกันเหนียว

  try {
    const body = await request.json();
    const { mood } = body;

    console.log(`📩 รับอารมณ์: "${mood}"`);

    // --- STEP 1: พยายามเรียก AI (The AI Attempt) ---
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      // ใช้รุ่น Flash Latest ที่โอกาสรอดสูงสุด
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

      const prompt = `
        User mood: "${mood}"
        Suggest a short Spotify search query (max 3 words). 
        Return ONLY the text.
      `;
      
      // ตั้งเวลา timeout 3 วินาที ถ้า AI ช้าเกินไปให้ตัดบทเลย
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
      ]) as any;

      searchQuery = result.response.text().trim();
      console.log(`✅ AI ทำงานสำเร็จ: "${searchQuery}"`);

    } catch (aiError) {
      // --- STEP 2: ระบบกันตาย (Fallback) ---
      // ถ้า AI พัง (Error 404 หรืออะไรก็ตาม) เราจะใช้ Logic ง่ายๆ แทน
      console.warn("⚠️ AI มีปัญหา (ไม่ต้องตกใจ ระบบกำลังใช้แผนสำรอง)");
      
      // กฎการแปลงอารมณ์แบบไม่ง้อ AI
      const m = mood.toLowerCase();
      if (m.includes("เศร้า") || m.includes("อกหัก") || m.includes("ร้องไห้")) searchQuery = "Sad Thai Songs";
      else if (m.includes("รัก") || m.includes("แฟน") || m.includes("love")) searchQuery = "Romantic Love Songs";
      else if (m.includes("สนุก") || m.includes("เต้น") || m.includes("มันส์")) searchQuery = "Dance Pop Party";
      else if (m.includes("นอน") || m.includes("ชิล") || m.includes("ผ่อนคลาย")) searchQuery = "Acoustic Chill";
      else if (m.includes("งาน") || m.includes("อ่าน") || m.includes("work")) searchQuery = "Lofi Study";
      else if (m.includes("เดือด") || m.includes("โกรธ") || m.includes("rock")) searchQuery = "Thai Rock Hits";
      else searchQuery = "Popular Thai Songs"; // คิดไม่ออกเอาเพลงฮิตไว้ก่อน

      console.log(`🔄 ใช้ระบบสำรองแทน: "${searchQuery}"`);
    }

    // --- STEP 3: Spotify (ทำงานต่อได้เลย ไม่ต้องรอ AI แก้บั๊ก) ---
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    const authData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(authData.body['access_token']);

    const searchResult = await spotifyApi.searchTracks(searchQuery, { limit: 12 });
    const rawTracks = searchResult.body.tracks?.items || [];

    const tracks = rawTracks.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      image: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify
    }));

    return NextResponse.json({ searchQuery, tracks });

  } catch (error: any) {
    console.error("🚨 System Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}