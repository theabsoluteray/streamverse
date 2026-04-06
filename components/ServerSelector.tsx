"use client";

import { motion } from "framer-motion";
import { Server } from "lucide-react";

interface ServerOption {
  name: string;
  key: string;
  url: string;
  isPrimary?: boolean;
}

interface ServerSelectorProps {
  servers: ServerOption[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export default function ServerSelector({ servers, activeKey, onSelect }: ServerSelectorProps) {
  const primary = servers.filter((s) => s.isPrimary);
  const backup = servers.filter((s) => !s.isPrimary);

  const renderBtn = (server: ServerOption, i: number) => {
    const isActive = server.key === activeKey;
    return (
      <motion.button
        key={server.key}
        id={`server-btn-${server.key}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.04 }}
        onClick={() => onSelect(server.key)}
        className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border flex items-center gap-1.5 ${
          isActive
            ? "bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
            : "border-neutral-800/50 text-neutral-400 hover:border-red-500/30 hover:text-neutral-200 hover:bg-neutral-900/50"
        }`}
      >
        {isActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 animate-pulse" />
        )}
        {server.name}
        {server.isPrimary && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-red-500/15 text-red-500 border border-red-500/20 leading-none font-semibold tracking-wide">
            HD
          </span>
        )}
      </motion.button>
    );
  };

  return (
    <div className="glass rounded-xl border border-neutral-800/40 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Server className="w-4 h-4 text-red-400" />
        <span className="text-sm font-semibold text-neutral-300">Streaming Servers</span>
        <span className="text-xs text-neutral-500">— if one fails, try another</span>
      </div>

      {primary.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Primary</p>
          <div className="flex flex-wrap gap-2">
            {primary.map((s, i) => renderBtn(s, i))}
          </div>
        </div>
      )}

      {backup.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Backup</p>
          <div className="flex flex-wrap gap-2">
            {backup.map((s, i) => renderBtn(s, primary.length + i))}
          </div>
        </div>
      )}
    </div>
  );
}
