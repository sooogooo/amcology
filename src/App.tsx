import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Menu, Share2, Search, BookOpen, Download } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ArticleView } from './components/ArticleView';
import { Footer } from './components/Footer';
import { MobileToolbar } from './components/MobileToolbar';
import { ReadingThemeControl, ReadingTheme } from './components/ReadingThemeControl';
import { SplashScreen } from './components/SplashScreen';
import { ResumeReadingPrompt } from './components/ResumeReadingPrompt';
import { OfflineNoticeBanner } from './components/OfflineNoticeBanner';
import { ImageLightboxProvider } from './components/ImageLightboxModal';
import { saveReadingProgress, getSavedReadingProgress, ReadingHistoryItem } from './utils/readingHistory';
import { articles } from './data/articles';

// Lazy load secondary modals & tools to keep initial bundle tiny and fast
const ShareModal = lazy(() => import('./components/ShareModal').then(m => ({ default: m.ShareModal })));
const SearchModal = lazy(() => import('./components/SearchModal').then(m => ({ default: m.SearchModal })));
const BookExportModal = lazy(() => import('./components/BookExportModal').then(m => ({ default: m.BookExportModal })));
const SubscriptionModal = lazy(() => import('./components/SubscriptionModal').then(m => ({ default: m.SubscriptionModal })));
const KeyboardShortcutsHint = lazy(() => import('./components/KeyboardShortcutsHint').then(m => ({ default: m.KeyboardShortcutsHint })));

const THEMES_CYCLE: ReadingTheme[] = ['cream', 'dark', 'focus'];

export default function App() {
  // Only show splash on the very first visit in session to maximize loading speed
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem('amcology_splash_shown');
    } catch {
      return false;
    }
  });

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    try {
      sessionStorage.setItem('amcology_splash_shown', 'true');
    } catch {}
  }, []);
  const [activeArticleId, setActiveArticleId] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isBookExportModalOpen, setIsBookExportModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('cream');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [targetSection, setTargetSection] = useState<string | undefined>(undefined);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Resume Reading History State
  const [savedHistory, setSavedHistory] = useState<ReadingHistoryItem | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialCheckDoneRef = useRef(false);

  const activeArticle = articles.find(a => a.id === activeArticleId) || articles[0];

  // Check saved progress on initial load
  useEffect(() => {
    if (initialCheckDoneRef.current) return;
    initialCheckDoneRef.current = true;

    const history = getSavedReadingProgress();
    if (history && (history.scrollY > 250 || history.progressPercent > 5 || history.articleId !== 1)) {
      setSavedHistory(history);
      // If user is coming back, show prompt after splash screen completes or immediately
      setShowResumePrompt(true);
    }
  }, []);

  // Handle restoring reading point
  const handleResumeReading = useCallback(() => {
    if (!savedHistory) return;
    setShowResumePrompt(false);
    
    // If different article, switch article first, then scroll
    if (savedHistory.articleId !== activeArticleId) {
      setActiveArticleId(savedHistory.articleId);
      setTimeout(() => {
        window.scrollTo({
          top: savedHistory.scrollY,
          behavior: 'smooth',
        });
      }, 250);
    } else {
      window.scrollTo({
        top: savedHistory.scrollY,
        behavior: 'smooth',
      });
    }
  }, [savedHistory, activeArticleId]);

  // Scroll listener for reading progress bar and debounced localStorage save
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
      
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      let currentProgress = 0;
      if (totalScroll > 0) {
        currentProgress = (scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      // Debounce saving progress to localStorage (save every 800ms while scrolling)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        if (scrollY > 50) {
          saveReadingProgress(
            activeArticleId,
            scrollY,
            currentProgress,
            activeArticle.title
          );
        }
      }, 800);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [activeArticleId, activeArticle.title]);

  // Theme cycle helper
  const handleCycleTheme = useCallback(() => {
    setReadingTheme(curr => {
      const idx = THEMES_CYCLE.indexOf(curr);
      const next = THEMES_CYCLE[(idx + 1) % THEMES_CYCLE.length];
      return next;
    });
  }, []);

  // Next / Previous article helpers
  const handleNextArticle = useCallback(() => {
    setActiveArticleId(prev => (prev >= articles.length ? 1 : prev + 1));
    setTargetSection(undefined);
  }, []);

  const handlePrevArticle = useCallback(() => {
    setActiveArticleId(prev => (prev <= 1 ? articles.length : prev - 1));
    setTargetSection(undefined);
  }, []);

  // Global keyboard shortcuts listener (J, K, M, T, /, ?, Escape, Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      // Check if any modal is currently open
      const isAnyModalOpen =
        isSearchModalOpen ||
        isShareModalOpen ||
        isBookExportModalOpen ||
        isSubscriptionModalOpen ||
        isShortcutsModalOpen;

      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
        setIsShareModalOpen(false);
        setIsBookExportModalOpen(false);
        setIsSubscriptionModalOpen(false);
        setIsShortcutsModalOpen(false);
        setIsSidebarOpen(false);
        return;
      }

      // If a modal is open, don't execute single-letter nav hotkeys
      if (isAnyModalOpen) {
        return;
      }

      // Cmd+K or Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
        return;
      }

      // Single key shortcuts
      switch (e.key) {
        case 'j':
        case 'J':
          e.preventDefault();
          handleNextArticle();
          break;
        case 'k':
        case 'K':
          e.preventDefault();
          handlePrevArticle();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setIsSidebarOpen(prev => !prev);
          break;
        case 't':
        case 'T':
          e.preventDefault();
          handleCycleTheme();
          break;
        case '/':
          e.preventDefault();
          setIsSearchModalOpen(true);
          break;
        case '?':
          e.preventDefault();
          setIsShortcutsModalOpen(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNextArticle,
    handlePrevArticle,
    handleCycleTheme,
    isSearchModalOpen,
    isShareModalOpen,
    isBookExportModalOpen,
    isSubscriptionModalOpen,
    isShortcutsModalOpen,
  ]);

  // Scroll to top when article changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setScrollProgress(0);
  }, [activeArticleId]);

  // Handle selection from search modal (article and optionally specific section)
  const handleSelectFromSearch = (articleId: number, sectionTitle?: string) => {
    setActiveArticleId(articleId);
    setTargetSection(sectionTitle);
    setIsSearchModalOpen(false);
  };

  const handleJumpToArticleFromConcept = (articleId: number, sectionTitle?: string) => {
    setActiveArticleId(articleId);
    setTargetSection(sectionTitle);
  };

  const isDarkMode = readingTheme === 'dark' || readingTheme === 'night-slate';

  return (
    <ImageLightboxProvider>
      <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-stone-50 text-zinc-900'}`}>
        
        {/* Animated Splash Screen with Random Economic Quotes & Particle FX */}
        {showSplash && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}

        {/* Top Fixed Reading Progress Indicator */}
        <div 
          className="fixed top-0 left-0 right-0 h-[2.5px] z-50 bg-amber-600 dark:bg-amber-500 transition-all duration-100 ease-out origin-left pointer-events-none"
          style={{ width: `${scrollProgress}%` }}
        />

        <div className="flex min-h-screen overflow-x-hidden relative">
          {/* Sidebar Navigation - hidden in pure focus mode on desktop unless opened */}
          {!isFocusMode && (
            <Sidebar 
              activeArticleId={activeArticleId}
              onSelectArticle={setActiveArticleId}
              isOpen={isSidebarOpen}
              setIsOpen={setIsSidebarOpen}
              onOpenSearch={() => setIsSearchModalOpen(true)}
              onOpenExportBook={() => setIsBookExportModalOpen(true)}
              onOpenSubscribe={() => setIsSubscriptionModalOpen(true)}
              onReplaySplash={() => setShowSplash(true)}
            />
          )}
          
          <main className={`flex-1 w-full relative flex flex-col justify-between transition-all duration-300 ${
            isFocusMode ? 'max-w-6xl mx-auto' : 'lg:w-[calc(100%-20rem)]'
          }`}>
            {/* Top Bar for Desktop & Mobile */}
            <div className="sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between backdrop-blur-md bg-stone-50/80 dark:bg-zinc-950/80 border-b border-zinc-200/70 dark:border-zinc-800/70">
              <div className="flex items-center gap-3">
                {/* Sidebar toggle button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className={`p-2 text-zinc-700 dark:text-zinc-300 hover:bg-stone-200/60 dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-95 cursor-pointer ${
                    isFocusMode ? 'inline-flex' : 'lg:hidden'
                  }`}
                  aria-label="打开文章目录"
                  title="打开目录 (M)"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2.5">
                  <img 
                    src="https://amcology.talk.stemcell.gold/talk-images/amcology.png" 
                    alt="Logo" 
                    className="h-5 sm:h-6 w-auto object-contain cursor-zoom-in" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs sm:text-sm font-serif font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                    {activeArticle.title}
                  </span>
                </div>
              </div>

              {/* Right Side: Theme, Focus Mode, Export Book, Subscribe, and Search Controls */}
              <div className="flex items-center gap-2">
                <ReadingThemeControl 
                  currentTheme={readingTheme}
                  onSelectTheme={setReadingTheme}
                  isFocusMode={isFocusMode}
                  onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
                  onOpenSearch={() => setIsSearchModalOpen(true)}
                  onOpenExportBook={() => setIsBookExportModalOpen(true)}
                  onOpenSubscribe={() => setIsSubscriptionModalOpen(true)}
                />
              </div>
            </div>

            {/* Article Content Area */}
            <div className="flex-1">
              <ArticleView 
                article={activeArticle} 
                onOpenShare={() => setIsShareModalOpen(true)}
                targetSection={targetSection}
                isFocusMode={isFocusMode}
                onJumpToArticle={handleJumpToArticleFromConcept}
              />
            </div>

            {/* Global Footer with ICP & Copyright & Subscribe Trigger */}
            <Footer 
              onOpenSubscribe={() => setIsSubscriptionModalOpen(true)} 
              onReplaySplash={() => setShowSplash(true)}
            />

            {/* Mobile Floating Bottom Toolbar */}
            <MobileToolbar
              activeArticleId={activeArticleId}
              onSelectArticle={setActiveArticleId}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onOpenShare={() => setIsShareModalOpen(true)}
              onOpenSearch={() => setIsSearchModalOpen(true)}
            />

            {/* Global Keyboard Shortcut Hints Bar & Cheatsheet (J/K/M/T/?/Esc) */}
            <Suspense fallback={null}>
              <KeyboardShortcutsHint
                onNextArticle={handleNextArticle}
                onPrevArticle={handlePrevArticle}
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                onOpenSearch={() => setIsSearchModalOpen(true)}
                onCycleTheme={handleCycleTheme}
                isModalOpen={isShortcutsModalOpen}
                onToggleModal={() => setIsShortcutsModalOpen(prev => !prev)}
              />
            </Suspense>

            {/* Subscription & RSS Feed Modal */}
            <Suspense fallback={null}>
              {isSubscriptionModalOpen && (
                <SubscriptionModal
                  isOpen={isSubscriptionModalOpen}
                  onClose={() => setIsSubscriptionModalOpen(false)}
                />
              )}
            </Suspense>

            {/* Book & Monograph Academic PDF / Markdown Export Modal */}
            <Suspense fallback={null}>
              {isBookExportModalOpen && (
                <BookExportModal
                  isOpen={isBookExportModalOpen}
                  onClose={() => setIsBookExportModalOpen(false)}
                  currentArticle={activeArticle}
                />
              )}
            </Suspense>

            {/* Global Concept Dictionary & Article Full-Text Search Modal (⌘K) */}
            <Suspense fallback={null}>
              {isSearchModalOpen && (
                <SearchModal
                  isOpen={isSearchModalOpen}
                  onClose={() => setIsSearchModalOpen(false)}
                  onSelectArticle={handleSelectFromSearch}
                />
              )}
            </Suspense>

            {/* Resume Reading Progress Floating Notification */}
            <ResumeReadingPrompt
              history={savedHistory}
              isVisible={showResumePrompt && !showSplash}
              onResume={handleResumeReading}
              onDismiss={() => setShowResumePrompt(false)}
            />

            {/* Network Offline / Online State Toast Banner */}
            <OfflineNoticeBanner />

            {/* Share Modal with WeChat support & PNG Poster */}
            <Suspense fallback={null}>
              {isShareModalOpen && (
                <ShareModal 
                  article={activeArticle}
                  isOpen={isShareModalOpen}
                  onClose={() => setIsShareModalOpen(false)}
                />
              )}
            </Suspense>
          </main>
        </div>
      </div>
    </ImageLightboxProvider>
  );
}
