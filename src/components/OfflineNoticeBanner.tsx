import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, CheckCircle2, CloudOff, X } from 'lucide-react';

export function OfflineNoticeBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsDismissed(false);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[calc(100vw-2rem)] bg-zinc-900/95 dark:bg-zinc-800/95 text-zinc-100 border border-amber-500/50 shadow-2xl backdrop-blur-md rounded-2xl p-3.5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 flex-shrink-0">
                <WifiOff className="w-4 h-4 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-serif text-amber-300">
                    离线缓存模式已启用
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                    OFFLINE CACHE
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 font-sans leading-tight">
                  检测到网络断开，已为您自动加载全卷离线缓存内容与最近阅读进度。
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-zinc-400 hover:text-zinc-100 rounded-lg transition-colors cursor-pointer"
              title="关闭提示"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100vw-2rem)] bg-emerald-950/95 text-emerald-100 border border-emerald-500/50 shadow-2xl backdrop-blur-md rounded-2xl p-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Wifi className="w-4 h-4" />
            </div>
            <div className="text-xs font-mono">
              <span className="font-bold">网络已重新连接</span>
              <p className="text-[11px] text-emerald-300/80">已恢复实时同步与在线研讨</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
