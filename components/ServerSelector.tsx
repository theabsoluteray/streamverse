"use client";

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
  return (
    <div className="rounded-lg border border-neutral-800/40 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Server className="w-3.5 h-3.5 text-neutral-500" />
        <span className="text-xs font-medium text-neutral-400">Servers</span>
        <span className="text-[10px] text-neutral-600">— if one fails, try another</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {servers.map((server) => {
          const isActive = server.key === activeKey;
          return (
            <button
              key={server.key}
              id={`server-btn-${server.key}`}
              onClick={() => onSelect(server.key)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all border flex items-center gap-1.5 ${
                isActive
                  ? "bg-white text-black border-white"
                  : "border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300"
              }`}
            >
              {server.name}
              {server.isPrimary && (
                <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${isActive ? 'bg-black/10 text-black' : 'bg-neutral-800 text-neutral-500'}`}>
                  HD
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
