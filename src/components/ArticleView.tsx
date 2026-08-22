import { motion } from 'motion/react';
import React, { useEffect, useState, useMemo, lazy, Suspense, useRef } from 'react';
import { Article } from '../data/articles';
import { Share2, Sparkles, BookOpen, Compass, Lightbulb, FileText, Image as ImageIcon, Loader2, ChevronDown, Eye } from 'lucide-react';
import { ArticleDiagram } from './ArticleDiagram';
import { HighlightToolbar } from './HighlightToolbar';
import { AudioGuidePlayer } from './AudioGuidePlayer';
import { ConceptPopover } from './ConceptPopover';
import { economicConcepts, ConceptItem } from '../data/concepts';
import { useImageLightbox } from './ImageLightboxModal';
import { performanceMonitor } from '../utils/performanceMonitor';

// Lazy-load heavy subcomponents for instant FCP (First Contentful Paint)
const EconomicCalculators = lazy(() => 
  import('./EconomicCalculators').then(m => ({ default: m.EconomicCalculators }))
);
const DiscussionSection = lazy(() => 
  import('./DiscussionSection').then(m => ({ default: m.DiscussionSection }))
);
const AcademicCoverModal = lazy(() => 
  import('./AcademicCoverModal').then(m => ({ default: m.AcademicCoverModal }))
);

interface ArticleViewProps {
  article: Article;
  onOpenShare: () => void;
  targetSection?: string;
  isFocusMode?: boolean;
  onJumpToArticle?: (articleId: number, targetSection: string) => void;
}

export function ArticleView({ article, onOpenShare, targetSection, isFocusMode, onJumpToArticle }: ArticleViewProps) {
  const [selectedConcept, setSelectedConcept] = useState<ConceptItem | null>(null);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isReadingModeHidden, setIsReadingModeHidden] = useState(false);
  const lastScrollY = useRef(0);

  // Performance tracking for article transition and view mount
  useEffect(() => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      performanceMonitor.logInteraction('ARTICLE_VIEW_ENGAGEMENT', duration, { articleId: article.id, articleTitle: article.title });
    };
  }, [article.id]);

  // Mobile scroll behavior: in reading state, automatically hide extra tools when scrolling down
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          // When scrolling down past 150px on mobile, hide secondary tools to expand viewport
          if (currentScrollY > 150 && currentScrollY > lastScrollY.current + 10) {
            setIsReadingModeHidden(true);
          } else if (currentScrollY < lastScrollY.current - 15 || currentScrollY < 100) {
            setIsReadingModeHidden(false);
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Extract article number and main title if possible (e.g. "医美产业经济学 01 为什么...")
  const titleParts = article.title.match(/(医美产业经济学\s+\d+)\s+(.*)/);
  const mainTitlePrefix = titleParts ? titleParts[1] : '';
  const mainTitleText = titleParts ? titleParts[2] : article.title;

  // Jump to targeted section from Search/Index if provided
  useEffect(() => {
    if (targetSection) {
      setTimeout(() => {
        const id = `section-${targetSection.replace(/\s+/g, '-').slice(0, 30)}`;
        const elem = document.getElementById(id);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          elem.classList.add('ring-2', 'ring-amber-500/80', 'rounded-xl', 'p-2', 'bg-amber-500/10', 'transition-all');
          setTimeout(() => {
            elem.classList.remove('ring-2', 'ring-amber-500/80', 'p-2', 'bg-amber-500/10');
          }, 3000);
        }
      }, 150);
    }
  }, [targetSection, article.id]);

  // Build sorted list of search terms and their corresponding concept object
  const termMap = useMemo(() => {
    const list: { phrase: string; concept: ConceptItem }[] = [];
    economicConcepts.forEach(c => {
      list.push({ phrase: c.term.split(' ')[0], concept: c });
      c.aliases.forEach(alias => {
        list.push({ phrase: alias, concept: c });
      });
    });
    // Sort by phrase length descending to match longer phrases first (e.g. "边际收益递减" before "边际收益")
    list.sort((a, b) => b.phrase.length - a.phrase.length);
    return list;
  }, []);

  // Filter concepts relevant to the current article or chapter
  const articleConcepts = useMemo(() => {
    const fullArticleText = article.sections.map(s => s.heading + ' ' + s.paragraphs.join(' ')).join(' ') + ' ' + article.quote;
    return economicConcepts.filter(c => c.articleId === article.id || fullArticleText.includes(c.term.split(' ')[0]));
  }, [article]);

  // Helper to render paragraph with clickable concept terms
  const renderParagraphWithConcepts = (text: string, pIdx: number) => {
    // If text is short or empty
    if (!text) return null;

    // Check if starts with a list marker (e.g., "1. ", "第一，")
    let prefix = '';
    let body = text;
    const listMatch = text.match(/^([0-9]+\.\s*|[一二三四五六七八九十]+[、，]\s*)/);
    if (listMatch) {
      prefix = listMatch[0];
      body = text.slice(prefix.length);
    }

    // Escape special regex characters in phrases
    const pattern = new RegExp(`(${termMap.map(t => t.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
    const parts = body.split(pattern);

    return (
      <p key={pIdx} className="text-[15px] sm:text-[16px] leading-[1.8] sm:leading-relaxed text-zinc-700 dark:text-zinc-300 font-sans font-normal tracking-[0.01em]">
        {prefix && (
          <strong className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono mr-1">
            {prefix}
          </strong>
        )}
        {parts.map((part, index) => {
          const match = termMap.find(t => t.phrase === part);
          if (match) {
            return (
              <span
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedConcept(match.concept);
                }}
                className="inline-flex items-baseline font-medium text-amber-800 dark:text-amber-400 border-b border-dashed border-amber-600/70 dark:border-amber-400/80 hover:bg-amber-100/70 dark:hover:bg-amber-950/60 rounded px-0.5 cursor-pointer transition-all duration-150 active:scale-98"
                title={`点击查看经济学术语精释: ${match.concept.term}`}
              >
                {part}
              </span>
            );
          }
          return <React.Fragment key={index}>{part}</React.Fragment>;
        })}
      </p>
    );
  };

  return (
    <motion.article 
      key={article.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`mx-auto py-3.5 sm:py-10 px-3 sm:px-8 lg:p-14 flex flex-col min-h-[calc(100vh-3.5rem)] lg:min-h-screen relative pb-24 lg:pb-16 transition-all duration-300 ${
        isFocusMode ? 'max-w-5xl' : 'max-w-4xl'
      }`}
    >
      {/* Floating Selection Toolbar & Quote Card Generator */}
      <HighlightToolbar article={article} />

      {/* Concept Glossary Floating Popover */}
      <ConceptPopover
        concept={selectedConcept}
        onClose={() => setSelectedConcept(null)}
        onJumpToArticle={(articleId, section) => {
          if (onJumpToArticle) {
            onJumpToArticle(articleId, section);
          }
        }}
      />

      {/* Academic Research Cover Generator Modal (html2canvas) */}
      <Suspense fallback={null}>
        {isCoverModalOpen && (
          <AcademicCoverModal
            article={article}
            isOpen={isCoverModalOpen}
            onClose={() => setIsCoverModalOpen(false)}
          />
        )}
      </Suspense>

      {/* Header Area with Clean Mobile-First Flow */}
      <header className="mb-5 sm:mb-10">
        {/* Meta Bar: Episode Tag + Desktop & Mobile Actions */}
        <div className={`flex items-center justify-between gap-2 mb-3 sm:mb-5 transition-all duration-200 ${
          isReadingModeHidden ? 'opacity-70 sm:opacity-100' : 'opacity-100'
        }`}>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] sm:text-[11px] tracking-widest font-mono font-bold uppercase rounded-sm shadow-2xs">
            <span>EP.{String(article.id).padStart(2, '0')}</span>
            <span className="text-zinc-500">/</span>
            <span className="text-amber-400 dark:text-amber-600 truncate max-w-[140px] sm:max-w-none">{article.moduleName}</span>
          </div>

          {/* Clean Action Buttons (Smart auto-collapse on deep reading) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsCoverModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-amber-300/80 dark:border-amber-700/80 bg-amber-50/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 shadow-2xs transition-all active:scale-95 cursor-pointer text-xs"
              aria-label="生成研报封面"
              title="生成学术研报风格封面图"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="font-bold text-[11px] sm:text-xs font-mono hidden xs:inline">研报封面</span>
            </button>

            <button 
              onClick={onOpenShare}
              className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-zinc-200/90 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 hover:border-zinc-900 dark:hover:border-zinc-500 shadow-2xs transition-all active:scale-95 cursor-pointer text-xs"
              aria-label="分享"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span className="font-bold text-[11px] sm:text-xs text-zinc-800 dark:text-zinc-200">分享</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-3xl lg:text-4xl font-serif font-medium leading-[1.35] text-zinc-900 dark:text-zinc-100 mb-3.5 sm:mb-6">
          {mainTitlePrefix && (
            <span className="block text-xs sm:text-base text-zinc-400 dark:text-zinc-500 mb-1 sm:mb-2 font-sans tracking-widest uppercase">{mainTitlePrefix}</span>
          )}
          {mainTitleText}
        </h1>

        <div className="h-[2px] w-14 sm:w-20 bg-amber-700 dark:bg-amber-500 mb-3.5 sm:mb-5"></div>

        {/* Concept Chips: Horizontal Scroll on Mobile, Wrapped on Desktop */}
        {articleConcepts.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-nowrap -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1 flex-shrink-0 mr-0.5">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              <span>核心概念:</span>
            </span>
            {articleConcepts.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedConcept(c)}
                className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-stone-100 dark:bg-zinc-850 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-zinc-200 dark:border-zinc-800 hover:border-amber-400/60 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:text-amber-800 dark:hover:text-amber-300 transition-all cursor-pointer shadow-2xs"
              >
                <span>{c.term.split(' ')[0]}</span>
                <span className="text-[9px] sm:text-[10px] text-zinc-400">释义</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* AI Podcast & Audio Guide Player */}
      <AudioGuidePlayer article={article} />

      {/* Render bespoke visual diagram for the current article */}
      <ArticleDiagram articleId={article.id} />

      {/* Main Column Sections */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7 sm:gap-y-10">
        {article.sections.map((section, idx) => {
          const headingMatch = section.heading.match(/^(\d+\s+.*?)\s+(.*)/);
          const headingPrefix = headingMatch ? headingMatch[1] : `Part ${String(idx + 1).padStart(2, '0')}`;
          const headingText = headingMatch ? headingMatch[2] : section.heading;
          const sectionDomId = `section-${section.heading.replace(/\s+/g, '-').slice(0, 30)}`;

          return (
            <section key={idx} id={sectionDomId} className="transition-all duration-300">
              <div className="flex items-center gap-2 mb-2.5 sm:mb-4">
                <div className="w-5 h-[1px] bg-amber-700 dark:bg-amber-500"></div>
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono">
                  {headingPrefix} / {headingText}
                </span>
              </div>
              <div className="space-y-3.5 sm:space-y-4">
                {section.paragraphs.map((p, pIdx) => renderParagraphWithConcepts(p, pIdx))}
              </div>
            </section>
          );
        })}
      </div>
      
      {/* Interactive Economic Calculators Module */}
      <Suspense fallback={
        <div className="w-full my-8 p-6 bg-stone-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl animate-pulse flex items-center justify-center gap-2 text-xs font-mono text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          <span>正在装载资本效率与现金流测算引擎...</span>
        </div>
      }>
        <EconomicCalculators />
      </Suspense>

      {/* Key Thought Card */}
      <div className="mt-10 sm:mt-16 bg-stone-100/80 dark:bg-zinc-850 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-5 sm:p-8 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest font-mono">
            KEY THOUGHT / 核心论点
          </p>
          <span className="text-[10px] font-mono text-zinc-400">EP.{String(article.id).padStart(2, '0')}</span>
        </div>
        <p className="text-base sm:text-lg font-serif text-zinc-800 dark:text-zinc-100 leading-relaxed italic">
          “{article.quote}”
        </p>

        {/* Share & Cover Invitation Callout */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0" />
            <span>点击正文带虚线经济学术语即可唤起词典，选中任意段落即可生成书笺</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCoverModalOpen(true)}
              className="flex items-center justify-center gap-1.5 bg-stone-200/80 dark:bg-zinc-800 hover:bg-stone-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold font-mono px-4 py-2.5 rounded-xl border border-zinc-300/80 dark:border-zinc-700 transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>学术研报封面</span>
            </button>

            <button 
              onClick={onOpenShare}
              className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400 dark:text-amber-700" />
              <span>一键生成分享海报</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reader Discussion and Industry Practitioner Notes */}
      <Suspense fallback={
        <div className="w-full mt-10 p-6 bg-stone-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl animate-pulse flex items-center justify-center gap-2 text-xs font-mono text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          <span>正在装载读者实战研讨与从业者笔录...</span>
        </div>
      }>
        <DiscussionSection article={article} />
      </Suspense>
    </motion.article>
  );
}
