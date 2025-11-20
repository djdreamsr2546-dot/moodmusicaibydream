"use client";
import { useState, useEffect } from "react";

// ------------------- TYPES -------------------
interface Track {
  id: string;
  name: string;
  artist: string;
  image: string;
  previewUrl: string | null;
  externalUrl: string;
}

export default function Home() {
  // ------------------- STATES -------------------
  const [mood, setMood] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  // เพื่อป้องกัน Error เรื่อง Hydration (Next.js quirk)
  useEffect(() => {
    setMounted(true);
  }, []);

  // ------------------- LOGIC -------------------
  const loadingMessages = [
    "🧠 AI กำลังจูนคลื่นสมอง...",
    "🎻 คัดสรรทำนองที่ตรงใจ...",
    "🌊 ดำดิ่งสู่ห้วงอารมณ์...",
    "🎹 ปรุงแต่งเพลย์ลิสต์...",
    "✨ เกือบเสร็จแล้ว..."
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim()) return;

    setLoading(true);
    setTracks([]);
    setAiQuery("");
    setLoadingMessage(loadingMessages[0]);

    let msgIndex = 0;
    const intervalId = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[msgIndex]);
    }, 1500);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });

      const data = await res.json();

      if (data.tracks) {
        setTracks(data.tracks);
        setAiQuery(data.searchQuery);
      }
    } catch (error) {
      console.error(error);
      alert("ขออภัย ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งนะครับ");
    } finally {
      clearInterval(intervalId);
      setLoading(false);
    }
  };

  if (!mounted) return null;

  // ------------------- UI RENDER -------------------
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500/30 overflow-x-hidden relative">
      
      {/* 🌌 Background Gradients (Aurora Effect) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 max-w-7xl">
        
        {/* 🏷️ Header Section */}
        <header className="text-center mb-12 md:mb-20 space-y-6 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md text-xs font-medium text-green-400 tracking-wider uppercase shadow-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            AI Music Discovery
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 drop-shadow-2xl pb-2">
            Mood Music <span className="text-green-500">AI BY DREAM</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed px-4">
            เปลี่ยนความรู้สึกของคุณเป็นเสียงเพลง... <br className="hidden md:block"/>
            แค่บอกมาว่าตอนนี้ <span className="text-white font-medium">"รู้สึกยังไง"</span>
          </p>
        </header>

        {/* 🔍 Search Box (Floating Glass Style) */}
        <div className="sticky top-4 z-50 mb-16 px-2">
          <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto group">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500" />
            
            <div className="relative flex items-center bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl ring-1 ring-white/10 focus-within:ring-green-500/50 transition-all">
              <span className="pl-4 md:pl-6 text-2xl select-none">✨</span>
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="เหงาตอนดึก, อยากเต้น, ปั่นงาน..."
                className="w-full bg-transparent border-none text-white placeholder-gray-500 text-base md:text-xl px-3 md:px-4 py-3 focus:outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-white hover:bg-green-400 text-black hover:text-black font-bold rounded-full px-6 md:px-8 py-3 md:py-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white flex items-center gap-2 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                     <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden md:inline">คิดแป๊บ</span>
                  </div>
                ) : (
                  <span>ค้นหา</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ⏳ Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-green-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🎵</div>
            </div>
            <p className="text-2xl md:text-3xl font-light text-white tracking-wide text-center px-4">
              {loadingMessage}
            </p>
          </div>
        )}

        {/* 🎵 Results Area */}
        {!loading && tracks.length > 0 && (
          <div className="animate-fade-in-up space-y-8">
            
            {/* AI Keyword Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-gray-400 text-sm">AI ค้นหาด้วยคำว่า:</span>
                <span className="text-green-400 font-bold text-lg">"{aiQuery}"</span>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 pb-20">
              {tracks.map((track) => (
                <div 
                  key={track.id} 
                  className="group relative bg-gray-800/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:bg-gray-800/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-900/20"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={track.image || "/api/placeholder/400/400"} 
                      alt={track.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    {/* Play Button (Overlay) */}
                    <a 
                      href={track.externalUrl}
                      target="_blank"
                      rel="noreferrer" 
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100"
                    >
                      <div className="bg-green-500 text-black rounded-full p-4 shadow-lg hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </a>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-white truncate mb-1 leading-tight group-hover:text-green-400 transition-colors">
                      {track.name}
                    </h3>
                    <p className="text-gray-400 text-sm truncate mb-4 font-medium">
                      {track.artist}
                    </p>
                    
                    {/* Custom Audio Player */}
                    {track.previewUrl ? (
                       <div className="relative h-10 w-full bg-black/30 rounded-lg overflow-hidden flex items-center px-2 border border-white/5">
                         <audio 
                            controls 
                            src={track.previewUrl} 
                            className="w-full h-8 opacity-80 hover:opacity-100 mix-blend-screen filter invert hue-rotate-180"
                            controlsList="nodownload noplaybackrate"
                          />
                       </div>
                    ) : (
                      <div className="flex items-center justify-center h-10 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-xs text-gray-500">ไม่มีตัวอย่างเสียง</span>
                      </div>
                    )}
                    
                    <a 
                      href={track.externalUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-green-500 hover:text-black text-sm font-bold text-gray-300 transition-all duration-300 group/btn"
                    >
                      <span>Listen on Spotify</span>
                      <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {!loading && tracks.length === 0 && (
          <div className="text-center text-gray-600 mt-20 text-sm font-light">
             Power of ดรีมเอง x Spotify API
          </div>
        )}

      </div>
    </div>
  );
}