"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, RefreshCw, ServerIcon, AlertCircle, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import ServerSelector from "./ServerSelector";
import {
  getMovieServers,
  getSeriesServers,
  getAnimeServers,
  getSavedServer,
  saveServer,
} from "@/lib/playerServers";

interface PlayerProps {
  type: "movie" | "series" | "anime";
  tmdbId?: number;
  malId?: number;
  anilistId?: number;
  season?: number;
  episode?: number;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  progressId?: string;
}

export default function Player({
  type,
  tmdbId,
  malId,
  anilistId,
  season = 1,
  episode = 1,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: PlayerProps) {
  const [activeServer, setActiveServer] = useState<string>(getSavedServer(type));
  const [iframeKey, setIframeKey] = useState(0);
  const [failedServers, setFailedServers] = useState<Set<string>>(new Set());
  const [showError, setShowError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchParams = useSearchParams();

  const handleFullscreen = useCallback(() => {
    if (iframeRef.current?.requestFullscreen) {
      iframeRef.current.requestFullscreen().catch(() => {});
    } else if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  }, []);

  const servers = (() => {
    if (type === "movie" && tmdbId) return getMovieServers(tmdbId);
    if (type === "series" && tmdbId) return getSeriesServers(tmdbId, season, episode);
    if (type === "anime" && malId) return getAnimeServers(malId, episode, anilistId);
    return [];
  })();

  const currentServer = servers.find((s) => s.key === activeServer) || servers[0];

  const currentIframeKey = `${activeServer}-${season}-${episode}-${iframeKey}`;
  const [loadedKey, setLoadedKey] = useState("");
  const isLoading = loadedKey !== currentIframeKey;

  useEffect(() => {
    setFailedServers(new Set());
    setShowError(false);
  }, [season, episode, tmdbId, malId]);

  const handleServerError = useCallback(() => {
    setLoadedKey(currentIframeKey);
    errorTimerRef.current = setTimeout(() => {
      setShowError(true);
    }, 500);

    setFailedServers((prev) => {
      const next = new Set(prev);
      next.add(activeServer);
      const nextServer = servers.find((s) => !next.has(s.key) && s.key !== activeServer);
      if (nextServer) {
        setActiveServer(nextServer.key);
        setShowError(false);
      }
      return next;
    });
  }, [activeServer, currentIframeKey, servers]);

  const handleLoad = useCallback(() => {
    setLoadedKey(currentIframeKey);
    setShowError(false);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    
    if (searchParams.get("fullscreen") === "true") {
      setTimeout(() => {
        handleFullscreen();
      }, 500);
    }
  }, [currentIframeKey, searchParams, handleFullscreen]);

  useEffect(() => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    if (isLoading) {
      errorTimerRef.current = setTimeout(() => setShowError(true), 12000);
    } else {
      setShowError(false);
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIframeKey]);

  const handleServerChange = (key: string) => {
    setActiveServer(key);
    saveServer(key);
    setShowError(false);
  };


  const handleRefresh = () => {
    setShowError(false);
    setIframeKey((k) => k + 1);
  };

  const availableServers = servers.filter((s) => !failedServers.has(s.key));
  const nextFallback = servers.find((s) => !failedServers.has(s.key) && s.key !== activeServer);

  return (
    <div className="w-full space-y-3">
      {/* Player Container */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full aspect-video rounded-xl overflow-hidden border border-red-500/20 glow-red bg-black"
      >
        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 gap-3"
            >
              <div className="w-12 h-12 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
              <p className="text-neutral-400 text-sm">Loading {currentServer?.name || "server"}...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error banner */}
        <AnimatePresence>
          {showError && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black/95 border border-red-500/30 text-sm shadow-xl"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-neutral-300">{currentServer?.name} may not be working.</span>
              {nextFallback && (
                <button
                  onClick={() => handleServerChange(nextFallback.key)}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  Try {nextFallback.name} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Iframe */}
        {currentServer && (
          <iframe
            ref={iframeRef}
            key={currentIframeKey}
            src={currentServer.url ?? undefined}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            onLoad={handleLoad}
            onError={handleServerError}
            title={`Streaming - ${currentServer.name}`}
          />
        )}

        {/* Top bar overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-20">
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <ServerIcon className="w-4 h-4 text-red-400" />
            <span className="font-medium">{currentServer?.name}</span>
            {type !== "movie" && (
              <span className="text-neutral-500">
                {type === "anime" ? `EP ${episode}` : `S${season} E${episode}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleRefresh}
              id="player-refresh-btn"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/40 text-neutral-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFullscreen}
              id="player-fullscreen-btn"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/40 text-neutral-400 hover:text-white transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Prev / Next episode controls */}
      {(hasPrev || hasNext) && (
        <div className="flex items-center justify-between">
          <button
            id="player-prev-btn"
            onClick={onPrev}
            disabled={!hasPrev}
            className="px-5 py-2 rounded-lg glass border border-neutral-800/50 text-sm font-medium text-neutral-300 hover:text-white hover:border-red-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>
          <button
            id="player-next-btn"
            onClick={onNext}
            disabled={!hasNext}
            className="px-5 py-2 rounded-lg bg-red-500/90 hover:bg-red-500 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      )}

      {/* Server Selector */}
      <ServerSelector
        servers={availableServers}
        activeKey={activeServer}
        onSelect={handleServerChange}
      />
    </div>
  );
}
