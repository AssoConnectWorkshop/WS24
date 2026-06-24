"use client";

import { useEffect, useState } from "react";

const PRIZES = [
  { emoji: "🍦", label: "Une glace" },
  { emoji: "🥃", label: "Un shot de génépi" },
  { emoji: "🐱", label: "Une photo encadrée du chat" },
];

export default function TombolaPublic() {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [registrationUrl, setRegistrationUrl] = useState<string>("");
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const url = `${window.location.origin}/tombola/rejoindre`;
    setRegistrationUrl(url);
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: { dark: "#2d4de0", light: "#ffffff" },
      }).then(setQrDataUrl);
    });
  }, []);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/tombola/participants");
        if (!res.ok) return;
        const data = await res.json();
        setCount(data.participants?.length ?? 0);
      } catch { /* silent */ }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 p-12" style={{ backgroundColor: "#f4f6fb" }}>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm" style={{ backgroundColor: "#2d4de0" }}>
          🏟
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Grande tombola fraîchissante<br />du séminaire d&apos;été</h1>
        <p className="text-gray-500 text-lg">Scannez le QR code pour tenter votre chance !</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex flex-col items-center gap-6">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code inscription" width={220} height={220} className="rounded-2xl" />
          ) : (
            <div className="w-[220px] h-[220px] rounded-2xl animate-pulse" style={{ backgroundColor: "#f4f6fb" }} />
          )}
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-sm font-medium text-gray-500">ou rendez-vous sur</p>
            {registrationUrl && (
              <p className="text-base font-bold" style={{ color: "#2d4de0" }}>
                {registrationUrl.replace("https://", "")}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-5 min-w-[260px]">
          <h2 className="font-bold text-gray-900 text-lg text-center">🏆 Lots à gagner</h2>
          <ul className="flex flex-col gap-3">
            {PRIZES.map((prize, i) => (
              <li key={i} className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: "#f4f6fb" }}>
                <span className="text-3xl">{prize.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900">{prize.label}</p>
                  <p className="text-xs text-gray-400">Lot #{i + 1}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-6 py-3 rounded-full text-sm font-semibold" style={{ backgroundColor: "#eef1fd", color: "#2d4de0" }}>
        {count === 0 ? "Soyez le premier à vous inscrire !" : `${count} participant${count > 1 ? "s" : ""} inscrit${count > 1 ? "s" : ""}`}
      </div>
    </div>
  );
}
