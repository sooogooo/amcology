import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Sparkles, Headphones, Radio, Gauge, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Article } from '../data/articles';

interface AudioGuidePlayerProps {
  article: Article;
  isReadingScrollDown?: boolean;
}

export function AudioGuidePlayer({ article, isReadingScrollDown }: AudioGuidePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [currentProgress, setCurrentProgress] = useState(0); // 0 to 100
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [estimatedTotalSec, setEstimatedTotalSec] = useState(180); // ~3 mins default
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  // Default to collapsed mode on small screens (< 640px) to maximize reading space, expandable on demand
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<number | null>(null);

  // Generate a dedicated podcast script for this article
  const podcastScript = React.useMemo(() => {
    const titleMatch = article.title.match(/(医美产业经济学\s+\d+)\s+(.*)/);
    const epNum = article.id;
    const epTitle = titleMatch ? titleMatch[2] : article.title;

    // Intro + key sections + key thought
    const intro = `欢迎收听《医美产业经济学》第${epNum}期音频精要导读。本期主题是：${epTitle}。`;
    const moduleIntro = `本篇属于${article.moduleName}模块，探讨${article.moduleDesc}。`;
    
    const sectionsText = article.sections.map(s => {
      const heading = s.heading.replace(/^\d+\s+/, '');
      const firstParagraph = s.paragraphs[0] || '';
      return `${heading}。${firstParagraph}`;
    }).join(' ');

    const conclusion = `本期核心论点：${article.quote}。感谢收听，欢迎继续阅读全文或参与探讨。`;

    const fullScript = `${intro} ${moduleIntro} ${sectionsText} ${conclusion}`;
    const sentences = fullScript.split(/[。！？\n]/).filter(s => s.trim().length > 0);

    return {
      fullScript,
      sentences,
      wordCount: fullScript.length
    };
  }, [article]);

  // Estimate total seconds based on speech rate (~260 Chinese chars per min at 1x)
  useEffect(() => {
    const totalSec = Math.round((podcastScript.wordCount / 260) * 60 / playbackRate);
    setEstimatedTotalSec(Math.max(60, totalSec));
  }, [podcastScript.wordCount, playbackRate]);

  // Load available Chinese speech voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const zhVoices = voices.filter(v => v.lang.includes('zh') || v.lang.includes('cmn'));
      setAvailableVoices(zhVoices.length > 0 ? zhVoices : voices);
      if (zhVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(zhVoices[0]);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Stop audio on article change
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentProgress(0);
    setCurrentTimeSec(0);
    setCurrentSentenceIndex(0);
  }, [article.id]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(podcastScript.fullScript);
      utteranceRef.current = utterance;
      utterance.rate = playbackRate;
      utterance.pitch = 1.0;
      utterance.volume = isMuted ? 0 : 1;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onboundary = (event) => {
        if (event.name === 'sentence' || event.name === 'word') {
          const charIndex = event.charIndex;
          const progress = Math.min(100, Math.round((charIndex / podcastScript.wordCount) * 100));
          setCurrentProgress(progress);
        }
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentProgress(100);
        setCurrentTimeSec(estimatedTotalSec);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);

      // Start tick timer
      const startTime = Date.now() - (currentTimeSec * 1000);
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        if (elapsed <= estimatedTotalSec) {
          setCurrentTimeSec(elapsed);
          setCurrentProgress(Math.min(99, Math.round((elapsed / estimatedTotalSec) * 100)));
        }
      }, 500);
    }
  };

  // Speed Toggle: 0.75x -> 1.0x -> 1.25x -> 1.5x -> 2.0x
  const handleSpeedChange = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);

    if (isPlaying) {
      // Restart with new rate
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setTimeout(() => {
        togglePlay();
      }, 50);
    }
  };

  // Skip 15s forward / backward
  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(estimatedTotalSec, currentTimeSec + seconds));
    setCurrentTimeSec(newTime);
    const newProgress = Math.round((newTime / estimatedTotalSec) * 100);
    setCurrentProgress(newProgress);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div id="audio-guide-player-container" className="my-3 sm:my-6 transition-all">
      {/* ========================================================================= */}
      {/* MOBILE COMPACT FLOATING MINI PILL / COLLAPSED BUTTON (< sm)              */}
      {/* ========================================================================= */}
      <div className="sm:hidden">
        {isMobileCollapsed ? (
          <div className="flex items-center justify-between p-2 px-3 bg-gradient-to-r from-stone-100 via-amber-50/60 to-stone-100 dark:from-zinc-900 dark:via-zinc-850 dark:to-zinc-900 border border-amber-600/30 dark:border-amber-500/30 rounded-full shadow-2xs">
            <div 
              onClick={() => setIsMobileCollapsed(false)}
              className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
            >
              <div className="p-1 bg-amber-600 dark:bg-amber-500 text-white rounded-full flex-shrink-0">
                <Radio className={`w-3 h-3 ${isPlaying ? 'animate-pulse' : ''}`} />
              </div>
              <div className="min-w-0 flex-1 flex items-center gap-2">
                <span className="text-[11px] font-serif font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  AI 精要导读
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {formatTime(currentTimeSec)}/{formatTime(estimatedTotalSec)}
                </span>
                {isPlaying && (
                  <span className="flex gap-0.5 items-end h-2.5">
                    <span className="w-0.5 bg-amber-600 dark:bg-amber-400 h-full animate-bounce" />
                    <span className="w-0.5 bg-amber-600 dark:bg-amber-400 h-2/3 animate-bounce [animation-delay:0.1s]" />
                    <span className="w-0.5 bg-amber-600 dark:bg-amber-400 h-4/5 animate-bounce [animation-delay:0.2s]" />
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={togglePlay}
                className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-bold rounded-full shadow-2xs active:scale-95 cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3 fill-current" />
                    <span>暂停</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current text-amber-400 dark:text-amber-600" />
                    <span>导读</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsMobileCollapsed(false)}
                className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-full cursor-pointer"
                title="展开完整音频播放器"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-gradient-to-r from-stone-100 via-amber-50/50 to-stone-100 dark:from-zinc-900 dark:via-zinc-850 dark:to-zinc-900 border border-amber-600/30 dark:border-amber-500/30 rounded-2xl shadow-2xs space-y-2.5">
            {/* Header + Collapse button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-amber-600 text-white rounded-lg">
                  <Radio className="w-3 h-3 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-serif font-black text-zinc-900 dark:text-zinc-100">AI 播客 / 语音精要导读</span>
                  <span className="ml-1.5 px-1.5 py-0.5 bg-amber-600/10 text-amber-800 dark:text-amber-400 text-[9px] font-mono font-bold rounded">3~5 MINS</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSpeedChange}
                  className="px-2 py-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-200"
                >
                  {playbackRate}x
                </button>
                <button
                  onClick={() => setIsMobileCollapsed(true)}
                  className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg"
                  title="收纳为紧凑条"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <div className="h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>{formatTime(currentTimeSec)}</span>
                <span>/ {formatTime(estimatedTotalSec)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSkip(-15)}
                  className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-stone-200/60 dark:hover:bg-zinc-800 rounded-lg"
                  title="快退 15 秒"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={togglePlay}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs rounded-xl shadow-xs active:scale-95"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current text-amber-400 dark:text-amber-600" />}
                  <span>{isPlaying ? '暂停' : '播放精要导读'}</span>
                </button>
                <button
                  onClick={() => handleSkip(15)}
                  className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-stone-200/60 dark:hover:bg-zinc-800 rounded-lg"
                  title="快进 15 秒"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setIsMobileCollapsed(true)}
                className="text-[10px] font-mono text-amber-700 dark:text-amber-400 hover:underline"
              >
                收起缩略
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP FULL-FEATURED PODCAST CARD (>= sm)                                */}
      {/* ========================================================================= */}
      <div 
        id="audio-guide-player"
        className="hidden sm:block p-4 sm:p-5 bg-gradient-to-r from-stone-100 via-amber-50/50 to-stone-100 dark:from-zinc-900 dark:via-zinc-850 dark:to-zinc-900 border border-amber-600/30 dark:border-amber-500/30 rounded-2xl shadow-2xs transition-all"
      >
        {/* Top Header Label */}
        <div className="flex items-center justify-between gap-2.5 mb-2.5 sm:mb-3.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-amber-600 dark:bg-amber-500 text-white rounded-lg shadow-xs flex-shrink-0">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-serif font-black text-zinc-900 dark:text-zinc-100 truncate">
                  AI 播客 / 语音精要导读
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-amber-600/10 text-amber-800 dark:text-amber-400 text-[10px] font-mono font-bold rounded-full">
                  3~5 MINS
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-sans truncate">
                适合通勤路上快速把握核心论点与经济学推演
              </p>
            </div>
          </div>

          {/* Speed & Mute Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleSpeedChange}
              className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-amber-600 rounded-lg text-xs font-mono font-bold text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
              title="切换播放语速"
            >
              <Gauge className="w-3 h-3 text-amber-700 dark:text-amber-400" />
              <span>{playbackRate}x</span>
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-amber-600 rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
              title={isMuted ? "取消静音" : "静音"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Progress Bar & Waveform */}
        <div className="space-y-1.5 mb-2.5 sm:mb-3">
          <div className="relative h-1.5 sm:h-2 bg-stone-200 dark:bg-zinc-800 rounded-full overflow-hidden cursor-pointer">
            <div 
              className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-[10px] sm:text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            <span>{formatTime(currentTimeSec)}</span>
            <div className="flex items-center gap-1">
              {isPlaying && (
                <span className="flex gap-0.5 items-end h-2.5">
                  <span className="w-0.5 bg-amber-600 dark:bg-amber-400 h-full animate-bounce" />
                  <span className="w-0.5 bg-amber-600 dark:bg-amber-400 h-2/3 animate-bounce [animation-delay:0.1s]" />
                  <span className="w-0.5 bg-amber-600 dark:bg-amber-400 h-4/5 animate-bounce [animation-delay:0.2s]" />
                </span>
              )}
              <span>/ {formatTime(estimatedTotalSec)}</span>
            </div>
          </div>
        </div>

        {/* Player Main Controls Row */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Skip Backward 15s */}
            <button
              onClick={() => handleSkip(-15)}
              className="p-1.5 sm:p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-stone-200/60 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              title="快退 15 秒"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Main Play / Pause Button */}
            <button
              id="audio-play-toggle-btn"
              onClick={togglePlay}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                  <span>暂停导读</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-amber-400 dark:text-amber-700" />
                  <span>播放精要导读</span>
                </>
              )}
            </button>

            {/* Skip Forward 15s */}
            <button
              onClick={() => handleSkip(15)}
              className="p-1.5 sm:p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-stone-200/60 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              title="快进 15 秒"
            >
              <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 font-serif italic">
            <Headphones className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>佩戴耳机聆听更佳</span>
          </div>
        </div>
      </div>
    </div>
  );
}

