"use client";

import { useState, useCallback, useEffect } from "react";
import { useWebSocket, type ConnectionStatus } from "../hooks/useWebSocket";
import {
  Wifi,
  WifiOff,
  Loader2,
  Monitor,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "pccontrol_last_ip";

export default function ConnectionBar() {
  const { status, serverIp, connect, disconnect, lastError, pcInfo } =
    useWebSocket();
  const [inputIp, setInputIp] = useState("");
  const [expanded, setExpanded] = useState(false);

  // Pre-fill last-used IP from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setInputIp(saved);
    } catch {
      // ignore
    }
  }, []);

  const handleConnect = useCallback(() => {
    const ip = inputIp.trim();
    if (!ip) return;

    // Save the IP for next time
    try {
      localStorage.setItem(STORAGE_KEY, ip);
    } catch {
      // ignore
    }

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
              aria-label="Toggle connection panel"
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
