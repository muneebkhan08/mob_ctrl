"use client";

import { useState, useCallback } from "react";
import { useWebSocket, type ConnectionStatus } from "../hooks/useWebSocket";
import { Wifi, WifiOff, Loader2, Monitor, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConnectionBar() {
  const { status, serverIp, connect, disconnect, lastError, pcInfo, certUrl } =
    useWebSocket();
  const [inputIp, setInputIp] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleConnect = useCallback(() => {
    const ip = inputIp.trim();
    if (!ip) return;
    connect(ip);
  }, [inputIp, connect]);

  const statusConfig: Record<
    ConnectionStatus,
    { color: string; bg: string; icon: React.ReactNode; label: string }
  > = {
    disconnected: {
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      icon: <WifiOff size={16} />,
      label: "Disconnected",
    },
    connecting: {
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      icon: <Loader2 size={16} className="animate-spin" />,
      label: "Connecting…",
    },
    connected: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      icon: <Wifi size={16} />,
      label: "Connected",
    },
  };

  const s = statusConfig[status];

  return (
    <div className="w-full">
      {/* ── Status Bar ─────────────────────────── */}
      <div
        className={`glass flex items-center justify-between px-4 py-2.5 rounded-2xl ${s.bg} border transition-all duration-300`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`${s.color} transition-colors`}>{s.icon}</div>
          <div>
            <p className={`text-xs font-semibold ${s.color}`}>{s.label}</p>
            {status === "connected" && pcInfo && (
              <p className="text-[10px] text-surface-400">
                {(pcInfo as Record<string, string>).hostname} •{" "}
                {serverIp}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "connected" ? (
            <button
              onClick={disconnect}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-all"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 transition-colors"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* ── Expanded Connect Form ─────────────── */}
      <AnimatePresence>
        {expanded && status !== "connected" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 px-1 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Monitor
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500"
                  />
                  <input
                    type="text"
                    value={inputIp}
                    onChange={(e) => setInputIp(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                    placeholder="PC IP address (e.g. 192.168.1.42)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-surface-800/80 border border-surface-700/50 placeholder:text-surface-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                    autoComplete="off"
                    autoCorrect="off"
                    inputMode="url"
                  />
                </div>
                <button
                  onClick={handleConnect}
                  disabled={!inputIp.trim() || status === "connecting"}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-dark active:scale-95 transition-all shadow-glow"
                >
                  {status === "connecting" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Connect"
                  )}
                </button>
              </div>

              {lastError && (
                <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                  {lastError}
                </p>
              )}

              {certUrl && (
                <div className="text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 space-y-1.5">
                  <p className="text-amber-300 font-semibold">
                    🔐 First-time setup required
                  </p>
                  <p className="text-amber-200/80 leading-relaxed">
                    Your browser blocks connections to the PC because of the
                    self-signed certificate. Open the link below, tap{" "}
                    <strong>&quot;Advanced&quot;</strong> → <strong>&quot;Proceed&quot;</strong>,
                    then come back and connect again.
                  </p>
                  <a
                    href={certUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1 px-3 py-1.5 rounded-lg font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
                  >
                    Open {certUrl} ↗
                  </a>
                </div>
              )}

              {certUrl && (
                <div className="text-xs bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2.5 space-y-1">
                  <p className="text-blue-300 font-semibold">
                    💡 Or skip this &mdash; open the app directly
                  </p>
                  <a
                    href={certUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1 px-3 py-1.5 rounded-lg font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
                  >
                    Open {certUrl} directly ↗
                  </a>
                  <p className="text-blue-200/60 leading-relaxed">
                    This opens the app from your PC server (no Vercel needed).
                    It will auto-connect instantly.
                  </p>
                </div>
              )}

              <p className="text-[10px] text-surface-500 leading-relaxed">
                Run the server on your PC, then enter its IP address above. Both
                devices must be on the same Wi-Fi / hotspot network.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
