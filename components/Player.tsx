"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2,
  RefreshCw,
  ServerIcon,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  ChevronDown,
  Check,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
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
  fullScreenOnly?: boolean;
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
  fullScreenOnly = false,
}: PlayerProps) {
  const [activeServer, setActiveServer] = useState<string>(getSavedServer(type));
  const [iframeKey, setIframeKey] = useState(0);
  const [failedServers, setFailedServers] = useState<Set<string>>(new Set());
  const [showError, setShowError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showServerDropdown, setShowServerDropdown] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

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

  // Auto-hide controls after inactivity
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (!showServerDropdown) {
        setShowControls(false);
      }
    }, 3500);
  }, [showServerDropdown]);

  useEffect(() => {
    if (fullScreenOnly) {
      resetControlsTimer();
    }
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [fullScreenOnly, resetControlsTimer]);

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
    setShowServerDropdown(false);
  };

  const handleRefresh = () => {
    setShowError(false);
    setIframeKey((k) => k + 1);
  };

  const handleBack = () => {
    router.back();
  };

  const handleMouseMove = useCallback(() => {
    if (fullScreenOnly) {
      resetControlsTimer();
    }
  }, [fullScreenOnly, resetControlsTimer]);

  const availableServers = servers.filter((s) => !failedServers.has(s.key));
  const nextFallback = servers.find((s) => !failedServers.has(s.key) && s.key !== activeServer);

  return (
    <div
      className={`w-full ${fullScreenOnly ? 'fixed inset-0 z-[99999] bg-black' : 'space-y-3'}`}
      onMouseMove={handleMouseMove}
    >
      {/* Player Container */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`relative w-full ${fullScreenOnly ? 'h-full rounded-none' : 'aspect-video rounded-lg border border-neutral-800'} overflow-hidden bg-black`}
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
              <div className="w-8 h-8 rounded-full border-2 border-neutral-700 border-t-white animate-spin" />
              <p className="text-neutral-500 text-xs">{currentServer?.name || "Loading"}...</p>
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
              className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-lg bg-black/95 border border-neutral-800 text-sm shadow-xl"
            >
              <AlertCircle className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              <span className="text-neutral-400 text-xs">{currentServer?.name} may not be working.</span>
              {nextFallback && (
                <button
                  onClick={() => handleServerChange(nextFallback.key)}
                  className="flex items-center gap-1 text-white text-xs font-medium transition-colors"
                >
                  Try {nextFallback.name} <ChevronRight className="w-3 h-3" />
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
            sandbox={currentServer.key === "vidking" ? "allow-scripts allow-same-origin allow-presentation" : undefined}
            onLoad={handleLoad}
            onError={handleServerError}
            title={`Streaming - ${currentServer.name}`}
          />
        )}

        {/* Top bar overlay */}
        <AnimatePresence>
          {(showControls || !fullScreenOnly) && (
            <motion.div
              initial={fullScreenOnly ? { opacity: 0, y: -20 } : undefined}
              animate={{ opacity: 1, y: 0 }}
              exit={fullScreenOnly ? { opacity: 0, y: -20 } : undefined}
              transition={{ duration: 0.25 }}
              className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/80 to-transparent z-20"
              style={{ pointerEvents: 'auto' }}
            >
              {/* Left */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={handleBack}
                  id="player-back-btn"
                  className="w-7 h-7 flex items-center justify-center rounded bg-black/50 text-neutral-400 hover:text-white transition-colors border border-neutral-800"
                  title="Go Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="font-medium">{currentServer?.name}</span>
                  {type !== "movie" && (
                    <span className="text-neutral-600">
                      {type === "anime" ? `EP ${episode}` : `S${season} E${episode}`}
                    </span>
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-1.5 pointer-events-auto">
                {/* Server Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowServerDropdown(!showServerDropdown)}
                    id="player-server-dropdown-btn"
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/50 text-neutral-400 hover:text-white transition-colors border border-neutral-800 text-xs font-medium"
                    title="Change Server"
                  >
                    <ServerIcon className="w-3 h-3" />
                    Server
                    <ChevronDown className={`w-3 h-3 transition-transform ${showServerDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showServerDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1 w-44 rounded-lg bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-1">
                          <p className="px-2.5 py-1.5 text-[10px] font-medium text-neutral-600 uppercase tracking-wider">
                            Select Server
                          </p>
                          {availableServers.map((server) => {
                            const isActive = server.key === activeServer;
                            return (
                              <button
                                key={server.key}
                                onClick={() => handleServerChange(server.key)}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs transition-all ${
                                  isActive
                                    ? 'bg-neutral-800 text-white'
                                    : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
                                }`}
                              >
                                {isActive ? (
                                  <Check className="w-3 h-3 flex-shrink-0" />
                                ) : (
                                  <div className="w-3 h-3 flex-shrink-0" />
                                )}
                                <span className="font-medium">{server.name}</span>
                                {server.isPrimary && (
                                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-medium">
                                    HD
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={handleRefresh}
                  id="player-refresh-btn"
                  className="w-7 h-7 flex items-center justify-center rounded bg-black/50 text-neutral-500 hover:text-white transition-colors border border-neutral-800"
                  title="Refresh"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
                <button
                  onClick={handleFullscreen}
                  id="player-fullscreen-btn"
                  className="w-7 h-7 flex items-center justify-center rounded bg-black/50 text-neutral-500 hover:text-white transition-colors border border-neutral-800"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Prev / Next episode controls */}
      {!fullScreenOnly && (hasPrev || hasNext) && (
        <div className="flex items-center justify-between">
          <button
            id="player-prev-btn"
            onClick={onPrev}
            disabled={!hasPrev}
            className="px-4 py-1.5 rounded border border-neutral-800 text-xs font-medium text-neutral-400 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>
          <button
            id="player-next-btn"
            onClick={onNext}
            disabled={!hasNext}
            className="px-4 py-1.5 rounded bg-white text-black text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-neutral-200"
          >
            Next →
          </button>
        </div>
      )}

      {/* Server Selector below player */}
      {!fullScreenOnly && (
        <div className="rounded-lg border border-neutral-800/60 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <ServerIcon className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-xs font-medium text-neutral-400">Servers</span>
            <span className="text-[10px] text-neutral-600">— if one fails, try another</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableServers.map((server) => {
              const isActive = server.key === activeServer;
              return (
                <button
                  key={server.key}
                  id={`server-btn-${server.key}`}
                  onClick={() => handleServerChange(server.key)}
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
      )}

      {/* Click outside to close server dropdown */}
      {showServerDropdown && (
        <div
          className="fixed inset-0 z-[19]"
          onClick={() => setShowServerDropdown(false)}
        />
      )}
    </div>
  );
}
