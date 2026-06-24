"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Accueil", href: "/", icon: "⊞" },
  { label: "Tombola", href: "/tombola", icon: "🏟" },
  { label: "Générateur de nom", href: "/generateur-nom", icon: "✨" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed top-0 left-0 h-full w-64 flex flex-col z-20"
      style={{ backgroundColor: "#2d4de0" }}
    >
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            ♥
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">WS24</p>
            <p className="text-white/60 text-xs">Padawan Delphine</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-5 py-3 text-sm transition-colors"
              style={{
                color: active ? "#ffffff" : "rgba(255,255,255,0.7)",
                backgroundColor: active ? "rgba(255,255,255,0.15)" : "transparent",
              }}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white/40 text-xs">AssoConnect WS24</p>
      </div>
    </aside>
  );
}
