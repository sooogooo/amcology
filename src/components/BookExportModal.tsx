import React, { useState, useMemo } from 'react';
import { 
  X, 
  BookOpen, 
  Download, 
  FileText, 
  Printer, 
  Check, 
  Sparkles, 
  Layers, 
  Bookmark, 
  Copy, 
  Settings2, 
  ExternalLink, 
  Code2, 
  CheckCircle2, 
  Database, 
  FolderDown, 
  HelpCircle,
  Hash,
  Link2,
  ListTree,
  Quote
} from 'lucide-react';
import { articles, Article } from '../data/articles';
import { economicConcepts, ConceptItem } from '../data/concepts';

interface BookExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentArticle: Article;
}

export type ExportCategory = 'academic' | 'knowledgeBase';
export type KnowledgeBaseTarget = 'obsidian' | 'notion' | 'standard';
export type ExportScope = 'single' | 'full';

export function BookExportModal({ isOpen, onClose, currentArticle }: BookExportModalProps) {
  // Main Category Tab
  const [activeCategory, setActiveCategory] = useState<ExportCategory>('knowledgeBase');

  // Academic Print Settings
  const [isAcademicMode, setIsAcademicMode] = useState(true); // 16开 vs A4
  const [academicScope, setAcademicScope] = useState<'full' | 'single'>('full');

  // Knowledge Base (Obsidian / Notion / Markdown) Settings
  const [kbTarget, setKbTarget] = useState<KnowledgeBaseTarget>('obsidian');
  const [kbScope, setKbScope] = useState<ExportScope>('single');
  const [includeFrontMatter, setIncludeFrontMatter] = useState(true);
  const [enableWikiLinks, setEnableWikiLinks] = useState(true);
  const [useCalloutBlocks, setUseCalloutBlocks] = useState(true);
  const [includeGlossary, setIncludeGlossary] = useState(true);
  const [includeCitations, setIncludeCitations] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Status State
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Pre-index concepts for quick lookup and replacement
  const conceptLookup = useMemo(() => {
    return economicConcepts.map(c => ({
      item: c,
      // Sort aliases by length descending so longer phrases match first
      allKeywords: [c.term.split(' ')[0], ...c.aliases].filter(Boolean).sort((a, b) => b.length - a.length)
    }));
  }, []);

  if (!isOpen) return null;

  // Helper: Format single article to Markdown with Knowledge Base metadata
  const formatArticleMarkdown = (art: Article, isFullVaultMember = false): string => {
    const articleConcepts = economicConcepts.filter(c => c.articleId === art.id);
    const dateStr = '2026-08-22';
    const cleanTitle = art.title.replace(/^医美产业经济学\s+\d+\s+/, '');
    const episodeStr = String(art.id).padStart(2, '0');
    const wordCountApprox = art.sections.reduce((acc, sec) => acc + sec.paragraphs.join('').length, 0);

    let md = '';

    // 1. YAML Front Matter
    if (includeFrontMatter) {
      md += `---\n`;
      md += `title: "${art.title}"\n`;
      md += `episode: ${art.id}\n`;
      md += `author: "于意云 (Yu Yiyun)"\n`;
      md += `series: "医美产业经济学：读国富论重新理解医美"\n`;
      md += `module: "${art.moduleName}"\n`;
      md += `module_desc: "${art.moduleDesc}"\n`;
      md += `date: ${dateStr}\n`;
      md += `type: "research-note"\n`;
      md += `issn: "ISSN 2026-8809"\n`;
      md += `report_id: "AMCO-2026-${episodeStr}"\n`;
      md += `words_count: ${wordCountApprox}\n`;
      
      // Target-specific tags
      if (kbTarget === 'obsidian') {
        md += `tags:\n`;
        md += `  - 医美产业经济学\n`;
        md += `  - 亚当斯密/国富论\n`;
        md += `  - 商业战略/医疗组织\n`;
        md += `  - 产业研报\n`;
        if (articleConcepts.length > 0) {
          md += `concepts:\n`;
          articleConcepts.forEach(c => {
            md += `  - "${c.term}"\n`;
          });
        }
        md += `aliases:\n`;
        md += `  - "第${art.id}讲 ${cleanTitle}"\n`;
        md += `  - "AMCO-2026-${episodeStr}"\n`;
      } else if (kbTarget === 'notion') {
        md += `tags: ["医美产业经济学", "国富论", "${art.moduleName}"]\n`;
        md += `status: "已精读"\n`;
      } else {
        md += `tags: [医美经济学, 商业模式, 医疗产业]\n`;
      }

      if (includeCitations) {
        md += `references:\n`;
        md += `  - "Adam Smith (1776). The Wealth of Nations"\n`;
        md += `  - "George Akerlof (1970). The Market for 'Lemons'"\n`;
        md += `  - "Ronald Coase (1937). The Nature of the Firm"\n`;
      }

      md += `---\n\n`;
    }

    // 2. Article Title & Hierarchy
    if (isFullVaultMember) {
      md += `## 第 ${art.id} 讲 ｜ ${art.title}\n\n`;
    } else {
      md += `# ${art.title}\n\n`;
    }

    // 3. Metadata Header Info Table / Badge
    if (kbTarget === 'obsidian' && useCalloutBlocks) {
      md += `> [!abstract] 核心论点与专栏信息\n`;
      md += `> **所属模块**：${art.moduleName}（${art.moduleDesc}）  \n`;
      md += `> **著者**：于意云 ｜ **专栏**：[医美产业经济学](https://amcology.talk.stemcell.gold) ｜ **研报编号**：\`AMCO-2026-${episodeStr}\`  \n`;
      md += `> **核心洞见**：“${art.quote}”\n\n`;
    } else if (kbTarget === 'notion' && useCalloutBlocks) {
      md += `> 💡 **核心论点**：“${art.quote}”\n`;
      md += `> **模块**：${art.moduleName} ｜ **著者**：于意云 ｜ **编号**：AMCO-2026-${episodeStr}\n\n`;
    } else {
      md += `> **核心论点**：“${art.quote}”  \n`;
      md += `> *所属模块：${art.moduleName} ｜ 著者：于意云 著*\n\n`;
    }

    // 4. Body Content with Concepts WikiLinks & Callouts
    art.sections.forEach(sec => {
      const headingLevel = isFullVaultMember ? '###' : '##';
      md += `${headingLevel} ${sec.heading}\n\n`;

      sec.paragraphs.forEach(p => {
        let processedText = p;

        // Replace concepts with WikiLinks [[Term]] if enabled
        if (enableWikiLinks && kbTarget === 'obsidian') {
          // Identify concepts and wrap them into [[Concept Term]]
          conceptLookup.forEach(({ item, allKeywords }) => {
            allKeywords.forEach(kw => {
              if (kw && kw.length >= 2 && processedText.includes(kw)) {
                // Avoid double replacement if already in [[...]]
                const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(?<!\\[\\[)(${escaped})(?!\\]\\])`, 'g');
                processedText = processedText.replace(regex, `[[${item.term}|$1]]`);
              }
            });
          });
        }

        md += `${processedText}\n\n`;
      });
    });

    // 5. Glossary / Concepts Index
    if (includeGlossary && articleConcepts.length > 0) {
      const glossaryHeading = isFullVaultMember ? '####' : '###';
      md += `${glossaryHeading} 📖 核心经济学概念与术语速查\n\n`;
      
      if (kbTarget === 'obsidian') {
        articleConcepts.forEach(c => {
          md += `> [!tip] [[${c.term}]]（${c.categoryLabel}）\n`;
          md += `> - **理论定义**：${c.definition}\n`;
          md += `> - **医美实践应用**：${c.keyTakeaway}\n\n`;
        });
      } else {
        articleConcepts.forEach(c => {
          md += `- **${c.term}**（${c.categoryLabel}）：\n`;
          md += `  - *定义*：${c.definition}\n`;
          md += `  - *实战启示*：${c.keyTakeaway}\n`;
        });
        md += `\n`;
      }
    }

    // 6. Academic References & Citations
    if (includeCitations) {
      const citeHeading = isFullVaultMember ? '####' : '###';
      md += `${citeHeading} 📚 学术引用与参考文献 (References & Citations)\n\n`;
      md += `1. **Smith, Adam**. (1776). *An Inquiry into the Nature and Causes of the Wealth of Nations*. London: W. Strahan and T. Cadell.\n`;
      md += `2. **Akerlof, George A.**. (1970). The Market for "Lemons": Quality Uncertainty and the Market Mechanism. *The Quarterly Journal of Economics*, 84(3), 488-500.\n`;
      md += `3. **Coase, Ronald H.**. (1937). The Nature of the Firm. *Economica*, 4(16), 386-405.\n`;
      md += `4. **于意云**. (2026). 《医美产业经济学：读国富论重新理解医美》第 ${art.id} 讲. 超级医美产业研究院学术发布.\n\n`;
    }

    return md;
  };

  // Generate full markdown payload according to chosen scope
  const generatedMarkdownContent = useMemo(() => {
    if (kbScope === 'single') {
      return formatArticleMarkdown(currentArticle, false);
    } else {
      let fullMd = '';
      if (includeFrontMatter) {
        fullMd += `---\n`;
        fullMd += `title: "《医美产业经济学》（全十二讲知识库完整合集）"\n`;
        fullMd += `author: "于意云 (Yu Yiyun)"\n`;
        fullMd += `date: 2026-08-22\n`;
        fullMd += `type: "knowledge-base-vault"\n`;
        fullMd += `series: "医美产业经济学"\n`;
        fullMd += `issn: "ISSN 2026-8809"\n`;
        fullMd += `articles_count: 12\n`;
        fullMd += `tags:\n`;
        fullMd += `  - 医美产业经济学\n`;
        fullMd += `  - 亚当斯密/国富论\n`;
        fullMd += `  - 医疗产业/商业战略\n`;
        fullMd += `  - 知识库合集\n`;
        fullMd += `---\n\n`;
      }

      fullMd += `# 《医美产业经济学》（全十二讲完整知识库）\n\n`;
      fullMd += `> **著者**：于意云 (Yu Yiyun) ｜ 超级医美产业研究院  \n`;
      fullMd += `> **引言**：“由于劳动生产力最大的增进，以及运用劳动时所表现的更大的熟练、技巧和判断力，似乎都是分工的结果。” —— 亚当·斯密《国民财富的性质和原因的研究》（1776）\n\n`;
      
      fullMd += `## 📚 全书导读与知识库目录\n\n`;
      articles.forEach(art => {
        const cleanTitle = art.title.replace(/^医美产业经济学\s+\d+\s+/, '');
        fullMd += `- **第 ${String(art.id).padStart(2, '0')} 讲**：[${cleanTitle}](#第-${art.id}-讲--${art.title.replace(/[\s·：:?？]/g, '-')}) ｜ \`${art.moduleName}\`\n`;
      });
      fullMd += `\n---\n\n`;

      articles.forEach(art => {
        fullMd += formatArticleMarkdown(art, true);
        fullMd += `\n---\n\n`;
      });

      return fullMd;
    }
  }, [kbScope, currentArticle, kbTarget, includeFrontMatter, enableWikiLinks, useCalloutBlocks, includeGlossary, includeCitations]);

  // Handle Copy to Clipboard
  const handleCopyMarkdown = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedMarkdownContent);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = generatedMarkdownContent;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  // Handle Download Markdown File (.md)
  const handleDownloadMarkdown = () => {
    setIsGenerating(true);
    try {
      const filename = kbScope === 'single'
        ? `第${String(currentArticle.id).padStart(2, '0')}讲_${currentArticle.title.replace(/[\s\/\\?%*:|"<>]/g, '_')}_于意云.md`
        : `医美产业经济学_全十二讲知识库合集_${kbTarget.toUpperCase()}_于意云.md`;

      const blob = new Blob([generatedMarkdownContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download markdown failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Academic Print/PDF (Full or Single)
  const handleExportAcademicBook = () => {
    setIsGenerating(true);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('请允许浏览器弹出窗口以生成学术版面 PDF！');
      setIsGenerating(false);
      return;
    }

    const pageSizeCss = isAcademicMode 
      ? `size: 185mm 260mm portrait; margin: 18mm 16mm 20mm 16mm; /* 标准大16开(Crown Quarto)学术专著规格 */`
      : `size: A4 portrait; margin: 20mm 18mm 22mm 18mm;`;

    const articlesToPrint = academicScope === 'full' ? articles : [currentArticle];

    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>医美产业经济学（${academicScope === 'full' ? '全十二讲' : `第${currentArticle.id}讲`}·${isAcademicMode ? '标准16开学术研报典藏版' : '完整合集'}）- 于意云 著</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Noto+Serif+SC:wght@400;600;700;900&family=JetBrains+Mono:wght@400;600&display=swap');

    @page {
      ${pageSizeCss}
      @bottom-right {
        content: counter(page);
        font-family: 'Noto Serif SC', serif;
        font-size: 8.5pt;
        color: #71717a;
      }
      @top-left {
        content: "《医美产业经济学》· 于意云 著 (ISSN 2026-8809)";
        font-family: 'Noto Serif SC', serif;
        font-size: 7.5pt;
        color: #a1a1aa;
      }
      @top-right {
        content: "AMCOLOGY RESEARCH MONOGRAPH";
        font-family: 'Cinzel', serif;
        font-size: 7.5pt;
        letter-spacing: 1px;
        color: #a1a1aa;
      }
    }

    body {
      font-family: 'Noto Serif SC', 'Songti SC', 'Source Han Serif SC', serif;
      color: #18181b;
      background: #ffffff;
      line-height: 1.85;
      font-size: 10pt;
      margin: 0;
      padding: 0;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    /* Cover Page */
    .book-cover {
      height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: ${isAcademicMode ? '2px solid #18181b' : '1px solid #d4d4d8'};
      padding: ${isAcademicMode ? '35px 30px' : '40px'};
      box-sizing: border-box;
      position: relative;
      background: #ffffff;
    }
    .cover-header {
      border-bottom: 1.5px solid #18181b;
      padding-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5pt;
      letter-spacing: 1.5px;
      color: #52525b;
      font-family: 'Cinzel', serif;
      font-weight: bold;
    }
    .cover-title-box {
      margin-top: 30px;
    }
    .academic-badge {
      display: inline-block;
      font-size: 8pt;
      font-family: 'JetBrains Mono', monospace;
      padding: 3px 8px;
      background: #18181b;
      color: #ffffff;
      font-weight: bold;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    .cover-title {
      font-size: ${isAcademicMode ? '28pt' : '32pt'};
      font-weight: 900;
      letter-spacing: 2.5px;
      line-height: 1.25;
      color: #18181b;
      margin: 0 0 12px 0;
    }
    .cover-subtitle {
      font-size: 12.5pt;
      font-weight: 400;
      color: #3f3f46;
      line-height: 1.6;
      margin-bottom: 25px;
    }
    .cover-quote {
      font-size: 9.5pt;
      font-style: italic;
      color: #52525b;
      border-left: 3px solid #b45309;
      padding-left: 14px;
      margin: 20px 0;
      line-height: 1.7;
      background: #fafaf9;
      padding: 12px 16px;
    }
    .cover-footer {
      border-top: 1px solid #d4d4d8;
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .cover-author {
      font-size: 13pt;
      font-weight: 700;
      color: #18181b;
    }
    .cover-meta {
      font-size: 8pt;
      color: #71717a;
      line-height: 1.5;
      text-align: right;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Copyright Page */
    .copyright-page {
      height: 85vh;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 30px;
      font-size: 8.5pt;
      color: #52525b;
      line-height: 1.8;
      font-family: 'Noto Serif SC', serif;
    }
    .cip-box {
      border: 1px solid #71717a;
      padding: 16px 20px;
      margin-bottom: 30px;
      background: #fafaf9;
    }
    .cip-title {
      font-weight: bold;
      text-align: center;
      margin-bottom: 8px;
      font-size: 9pt;
      letter-spacing: 1px;
    }

    /* TOC Table of Contents */
    .toc-title {
      font-size: 18pt;
      font-weight: 900;
      border-bottom: 2px solid #18181b;
      padding-bottom: 8px;
      margin-bottom: 25px;
      letter-spacing: 2px;
    }
    .toc-module {
      margin-bottom: 20px;
    }
    .toc-module-title {
      font-size: 11pt;
      font-weight: 700;
      color: #b45309;
      margin-bottom: 6px;
      border-bottom: 1px dashed #e4e4e7;
      padding-bottom: 3px;
    }
    .toc-item {
      display: flex;
      justify-content: space-between;
      font-size: 9.5pt;
      margin: 5px 0;
    }
    .toc-item-title {
      color: #27272a;
    }
    .toc-item-num {
      font-family: 'Cinzel', serif;
      font-weight: bold;
      color: #71717a;
    }

    /* Article Content */
    .article-header {
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e4e4e7;
    }
    .article-tag {
      font-size: 8pt;
      font-weight: 700;
      color: #b45309;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .article-title {
      font-size: 16pt;
      font-weight: 900;
      line-height: 1.35;
      margin: 4px 0 8px 0;
    }
    .article-quote-box {
      background: #fafaf9;
      border-left: 3px solid #b45309;
      padding: 10px 15px;
      margin: 12px 0 16px 0;
      font-size: 9pt;
      color: #44403c;
      font-style: italic;
    }
    .section-heading {
      font-size: 12pt;
      font-weight: 700;
      color: #18181b;
      margin-top: 20px;
      margin-bottom: 8px;
    }
    p {
      margin: 0 0 10px 0;
      text-align: justify;
      text-indent: 2em;
    }
    .citations-box {
      margin-top: 22px;
      padding-top: 12px;
      border-top: 1px solid #e4e4e7;
      font-size: 8pt;
      color: #71717a;
      line-height: 1.6;
    }
    .citations-title {
      font-weight: bold;
      color: #3f3f46;
      margin-bottom: 4px;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
    }

    @media print {
      body { background: transparent; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="book-cover">
    <div class="cover-header">
      <span>AMCOLOGY RESEARCH MONOGRAPH · 医美产业经济学</span>
      <span>${isAcademicMode ? '16开学术专著本 · ' : ''}2026 EDITION</span>
    </div>

    <div class="cover-title-box">
      ${isAcademicMode ? '<div class="academic-badge">AMCOLOGY MONOGRAPH · 标准 16 开学术研报</div>' : ''}
      <h1 class="cover-title">医美产业经济学</h1>
      <div class="cover-subtitle">从《国富论》分工演进、信息契约到十万级价值解构的产业通识与认知模型</div>
      <div class="cover-quote">
        “由于劳动生产力最大的增进，以及运用劳动时所表现的更大的熟练、技巧和判断力，似乎都是分工的结果。”<br>
        —— 亚当·斯密《国民财富的性质和原因的研究》（The Wealth of Nations, 1776）
      </div>
    </div>

    <div class="cover-footer">
      <div>
        <div class="cover-author">于意云 著 <span style="font-size: 9.5pt; font-weight: normal; color: #52525b;">(Yu Yiyun / @sooogooo)</span></div>
        <div style="font-size: 8.5pt; color: #71717a; margin-top: 4px;">超级医美产业研究院 · 资深医疗战略与经济模型研究者</div>
      </div>
      <div class="cover-meta">
        专栏刊号：ISSN 2026-8809<br>
        版次：2026年第1版 · 典藏16开本
      </div>
    </div>
  </div>

  ${academicScope === 'full' ? `
  <!-- COPYRIGHT & CIP PAGE (Academic Mode) -->
  <div class="page-break"></div>
  <div class="copyright-page">
    <div class="cip-box">
      <div class="cip-title">图书在版编目（CIP）数据预估与版本记录</div>
      <p style="text-indent: 0; margin-bottom: 6px;">医美产业经济学 / 于意云 著. — 北京 : 超级医美产业研究院, 2026.8</p>
      <p style="text-indent: 0; margin-bottom: 6px;">ISBN 978-7-9800-2026-1 ｜ Ⅰ. ①医… Ⅱ. ①于… Ⅲ. ①医疗美容业—产业经济学—中国 Ⅳ. ①F713.55</p>
      <p style="text-indent: 0; margin-bottom: 0; font-size: 7.5pt; color: #a1a1aa;">中国版本图书馆 CIP 数据核字 (2026) 第 088092 号</p>
    </div>

    <div style="border-top: 1px solid #e4e4e7; padding-top: 15px; font-size: 8pt; line-height: 1.7;">
      <div><strong>书名</strong>：医美产业经济学：读国富论重新理解医美</div>
      <div><strong>著者</strong>：于意云 (Yiyun Yu)</div>
      <div><strong>出版策划</strong>：超级医美 · 产业经济学专栏编委会</div>
      <div><strong>在线专栏</strong>：https://amcology.talk.stemcell.gold</div>
      <div><strong>版次印次</strong>：2026年8月第1版 ｜ 2026年8月第1次印刷</div>
      <div><strong>开本规格</strong>：787mm × 1092mm 1/16 (标准16开学术专著)</div>
      <div style="margin-top: 8px; color: #a1a1aa;">版权所有 · 侵权必究 ｜ 本作品遵循 CC BY-NC-SA 4.0 国际知识共享许可协议</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- TABLE OF CONTENTS -->
  <div>
    <div class="toc-title">目 录 · TABLE OF CONTENTS</div>
    
    <div class="toc-module">
      <div class="toc-module-title">模块一：分工、专业化与交付体系演进</div>
      <div class="toc-item"><span class="toc-item-title">01 为什么说现代医美的本质是「亚当·斯密式」的分工革命？</span><span class="toc-item-num">P. 01</span></div>
      <div class="toc-item"><span class="toc-item-title">02 从「全能名医」到「超级流水线」：医美机构的科层演进与效率天花板</span><span class="toc-item-num">P. 04</span></div>
      <div class="toc-item"><span class="toc-item-title">03 光电、注射与整外：三大业务线的分工深化度与规模经济边界</span><span class="toc-item-num">P. 07</span></div>
    </div>

    <div class="toc-module">
      <div class="toc-module-title">模块二：信息不对称、信任机制与契约设计</div>
      <div class="toc-item"><span class="toc-item-title">04 医美市场的「柠檬困境」：为什么降价反而会导致劣币驱逐良币？</span><span class="toc-item-num">P. 10</span></div>
      <div class="toc-item"><span class="toc-item-title">05 信任品（Credence Goods）的经济学生存之道：如何建立不可逆的信誉壁垒？</span><span class="toc-item-num">P. 13</span></div>
      <div class="toc-item"><span class="toc-item-title">06 医生、咨询师与机构的「委托-代理」难题：利益冲突如何扭曲医疗交付？</span><span class="toc-item-num">P. 16</span></div>
    </div>

    <div class="toc-module">
      <div class="toc-module-title">模块三：边际成本、规模经济与定价权转移</div>
      <div class="toc-item"><span class="toc-item-title">07 边际成本陷阱：为什么买量打折无法为机构带来真正的规模经济？</span><span class="toc-item-num">P. 19</span></div>
      <div class="toc-item"><span class="toc-item-title">08 药械上游的超额利润从何而来？垄断竞争模型与医美定价权的转移</span><span class="toc-item-num">P. 22</span></div>
      <div class="toc-item"><span class="toc-item-title">09 十万级消费的价值解构：医生技术、审美溢价与安全垫的价值分布</span><span class="toc-item-num">P. 25</span></div>
    </div>

    <div class="toc-module">
      <div class="toc-module-title">模块四：资本效率、组织边界与产业终局</div>
      <div class="toc-item"><span class="toc-item-title">10 医美机构的「科斯交易费用」：自建全链条还是外部协同网络？</span><span class="toc-item-num">P. 28</span></div>
      <div class="toc-item"><span class="toc-item-title">11 资本周期视角下的医美泡沫：重资产扩张与轻资产连锁的生死时速</span><span class="toc-item-num">P. 31</span></div>
      <div class="toc-item"><span class="toc-item-title">12 产业终局推演：AI、合规风暴与超级个体的重塑</span><span class="toc-item-num">P. 34</span></div>
    </div>
  </div>
  ` : ''}

  <!-- ARTICLES IN FULL CONTENT -->
  ${articlesToPrint.map((art) => `
    <div class="page-break"></div>
    <div class="article-header">
      <div class="article-tag">第 ${art.id} 讲 ｜ ${art.moduleName}</div>
      <h2 class="article-title">${art.title}</h2>
      <div style="font-size: 8pt; color: #71717a; font-family: 'JetBrains Mono', monospace;">
        著者：于意云 ｜ 研报编号：AMCO-2026-${String(art.id).padStart(2, '0')} ｜ 核心范畴：${art.moduleDesc}
      </div>
    </div>

    <div class="article-quote-box">
      <strong>核心洞见：</strong>“${art.quote}”
    </div>

    ${art.sections.map(sec => `
      <h3 class="section-heading">${sec.heading}</h3>
      ${sec.paragraphs.map(p => `<p>${p}</p>`).join('')}
    `).join('')}

    <div class="citations-box">
      <div class="citations-title">学术引用与理论索引 (References & Citations)</div>
      <div>[1] Adam Smith. (1776). <em>An Inquiry into the Nature and Causes of the Wealth of Nations</em>. W. Strahan and T. Cadell, London.</div>
      <div>[2] George Akerlof. (1970). <em>The Market for 'Lemons': Quality Uncertainty and the Market Mechanism</em>. Quarterly Journal of Economics.</div>
      <div>[3] Ronald Coase. (1937). <em>The Nature of the Firm</em>. Economica, 4(16), 386-405.</div>
      <div>[4] 于意云. (2026). 《医美产业经济学：读国富论重新理解医美》第 ${art.id} 讲. 超级医美产业研究院学术发布.</div>
    </div>
  `).join('')}

</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-600/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 rounded-2xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>专栏文献与知识库多格式导出</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-full">
                  v2.6 多格式配置
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                支持高保真学术研报 PDF 排版，以及带 YAML Front Matter 的 Obsidian / Notion 知识库 Markdown。
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="关闭窗口"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Format Category Tabs */}
        <div className="px-5 sm:px-7 pt-4 pb-2 border-b border-zinc-100 dark:border-zinc-800/80 bg-stone-50/50 dark:bg-zinc-850/40 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2 bg-stone-200/70 dark:bg-zinc-800 p-1 rounded-2xl">
            
            {/* Tab 1: Personal Knowledge Base (Obsidian / Notion) */}
            <button
              onClick={() => setActiveCategory('knowledgeBase')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === 'knowledgeBase'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>个人知识库导入格式 (Markdown)</span>
              <span className="hidden sm:inline text-[9px] px-1.5 py-0.2 bg-amber-600 text-white rounded-full font-mono">
                Notion / Obsidian
              </span>
            </button>

            {/* Tab 2: Academic Publishing & Print PDF */}
            <button
              onClick={() => setActiveCategory('academic')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === 'academic'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Printer className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <span>学术研报与打印排版 (PDF)</span>
              <span className="hidden sm:inline text-[9px] px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full font-mono">
                16开专著
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 no-scrollbar">

          {/* ======================================================== */}
          {/* CATEGORY 1: PERSONAL KNOWLEDGE BASE FORMAT CONFIGURATION */}
          {/* ======================================================== */}
          {activeCategory === 'knowledgeBase' && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Target Ecosystem Selector */}
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2.5">
                  <FolderDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>1. 目标知识库系统与语法偏好</span>
                </label>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* Option: Obsidian */}
                  <div
                    onClick={() => {
                      setKbTarget('obsidian');
                      setEnableWikiLinks(true);
                      setUseCalloutBlocks(true);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      kbTarget === 'obsidian'
                        ? 'border-amber-600 bg-amber-500/10 dark:bg-amber-500/15 ring-1 ring-amber-600'
                        : 'border-zinc-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-850/50 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">Obsidian</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-purple-600/15 text-purple-700 dark:text-purple-300 rounded font-semibold">双链图谱</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                      支持 `[[双链]]`、Callout 块、Front Matter 与图谱标签。
                    </p>
                  </div>

                  {/* Option: Notion */}
                  <div
                    onClick={() => {
                      setKbTarget('notion');
                      setEnableWikiLinks(false);
                      setUseCalloutBlocks(true);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      kbTarget === 'notion'
                        ? 'border-amber-600 bg-amber-500/10 dark:bg-amber-500/15 ring-1 ring-amber-600'
                        : 'border-zinc-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-850/50 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">Notion</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-blue-600/15 text-blue-700 dark:text-blue-300 rounded font-semibold">属性数据库</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                      标准化属性表头、富文本 Callout 引用与行内术语注脚。
                    </p>
                  </div>

                  {/* Option: Standard Markdown */}
                  <div
                    onClick={() => {
                      setKbTarget('standard');
                      setEnableWikiLinks(false);
                      setUseCalloutBlocks(false);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      kbTarget === 'standard'
                        ? 'border-amber-600 bg-amber-500/10 dark:bg-amber-500/15 ring-1 ring-amber-600'
                        : 'border-zinc-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-850/50 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">通用 Markdown</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded">高兼容性</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                      适用 Logseq、Typora、GitHub 仓库或静态博客归档。
                    </p>
                  </div>
                </div>
              </div>

              {/* Export Scope Selector */}
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2.5">
                  <ListTree className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>2. 导出范围与文档结构</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setKbScope('single')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      kbScope === 'single'
                        ? 'border-amber-600 bg-amber-500/10 dark:bg-amber-500/15 ring-1 ring-amber-600'
                        : 'border-zinc-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-850/50 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="p-2 bg-amber-600 text-white rounded-xl">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                        当前单篇笔记 (第 {currentArticle.id} 讲)
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        《{currentArticle.title.replace(/^医美产业经济学\s+\d+\s+/, '').slice(0, 14)}...》
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setKbScope('full')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      kbScope === 'full'
                        ? 'border-amber-600 bg-amber-500/10 dark:bg-amber-500/15 ring-1 ring-amber-600'
                        : 'border-zinc-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-850/50 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                        全十二讲完整知识库 (Vault)
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        聚合 12 篇全文 + 完整目录索引与术语库
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Configuration Toggles */}
              <div className="p-4 bg-stone-100/70 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>知识库元数据与链接配置 (Metadata & Formatting)</span>
                  </span>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-[11px] font-mono text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Code2 className="w-3 h-3" />
                    <span>{showPreview ? '收起预览' : '实时预览 Markdown'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  
                  {/* Toggle 1: YAML Front Matter */}
                  <label className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-750 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-amber-600" />
                      <div>
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">YAML Front Matter</div>
                        <div className="text-[10px] text-zinc-400">title, author, module, tags, issn</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeFrontMatter}
                      onChange={(e) => setIncludeFrontMatter(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                    />
                  </label>

                  {/* Toggle 2: WikiLinks for Economic Concepts */}
                  <label className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-750 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-3.5 h-3.5 text-purple-600" />
                      <div>
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">专业术语双链 ([[概念]])</div>
                        <div className="text-[10px] text-zinc-400">自动链接分工、柠檬市场、LTV等</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableWikiLinks}
                      onChange={(e) => setEnableWikiLinks(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                    />
                  </label>

                  {/* Toggle 3: Callout Blocks */}
                  <label className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-750 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Quote className="w-3.5 h-3.5 text-blue-600" />
                      <div>
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Callout 引用块语法</div>
                        <div className="text-[10px] text-zinc-400">{`> [!abstract] / > [!tip] 样式`}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={useCalloutBlocks}
                      onChange={(e) => setUseCalloutBlocks(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                    />
                  </label>

                  {/* Toggle 4: Glossary Appendix */}
                  <label className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-750 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <div>
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">附录术语速查表</div>
                        <div className="text-[10px] text-zinc-400">提取本讲核心概念与医美实战洞察</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeGlossary}
                      onChange={(e) => setIncludeGlossary(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                    />
                  </label>

                </div>
              </div>

              {/* Real-Time Live Preview Drawer */}
              {showPreview && (
                <div className="p-3.5 bg-zinc-950 text-zinc-200 rounded-2xl font-mono text-[11px] leading-relaxed border border-zinc-800 space-y-2 animate-fade-in max-h-56 overflow-y-auto">
                  <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-1.5 text-[10px]">
                    <span>MARKDOWN LIVE PREVIEW ({kbTarget.toUpperCase()})</span>
                    <span>{generatedMarkdownContent.length} 字符</span>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-zinc-300 selection:bg-amber-500 selection:text-black">
                    {generatedMarkdownContent.slice(0, 1200)}
                    {generatedMarkdownContent.length > 1200 ? '\n\n... (更多内容导出时完整生成) ...' : ''}
                  </pre>
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* CATEGORY 2: ACADEMIC PUBLISHING & PRINT PDF FORMAT       */}
          {/* ======================================================== */}
          {activeCategory === 'academic' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Academic Monograph 16K Mode Switch */}
              <div className="p-4 bg-stone-100/80 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700/80 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-600/20 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        学术研报模式 (标准大 16 开 185×260mm 典藏专著)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.2 bg-amber-600 text-white rounded-full font-bold">
                        出版规格
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                      自动匹配中国国家标准学术专著开本、CIP 版权页、理论索引与高保真矢量打印排版。
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input 
                    type="checkbox" 
                    checked={isAcademicMode} 
                    onChange={(e) => setIsAcademicMode(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Academic Scope Selection Cards */}
              <div className="space-y-3">
                
                {/* Full 12 Articles PDF */}
                <div 
                  onClick={() => setAcademicScope('full')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    academicScope === 'full'
                      ? 'border-amber-600 bg-amber-500/10 dark:bg-amber-500/15 ring-1 ring-amber-600'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-stone-50/50 dark:bg-zinc-850/50'
                  }`}
                >
                  <div className="p-2 bg-amber-600 text-white rounded-xl mt-0.5">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {isAcademicMode ? '标准 16 开学术研报全书 PDF（全十二讲完整本）' : '全书装帧 PDF（A4 打印版）'}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-600 text-white rounded-full font-bold">
                        {isAcademicMode ? '16开 典藏专著' : 'A4 典藏版'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      包含封面、CIP 版权页、精编目录、全 12 篇全文及四大学术理论索引，支持调用浏览器打印直接生成高清晰 PDF。
                    </p>
                  </div>
                </div>

                {/* Single Article PDF */}
                <div 
                  onClick={() => setAcademicScope('single')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    academicScope === 'single'
                      ? 'border-amber-600 bg-amber-500/10 dark:bg-amber-500/15 ring-1 ring-amber-600'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-stone-50/50 dark:bg-zinc-850/50'
                  }`}
                >
                  <div className="p-2 bg-stone-700 text-white rounded-xl mt-0.5">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        当前单篇学术论文排版（第 {currentArticle.id} 讲）
                      </h3>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {isAcademicMode ? '16开单篇' : '单篇速印'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      仅导出当前浏览文章《{currentArticle.title}》的学术单篇版本，附带学术引用与编号。
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="px-5 sm:px-7 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            <span>于意云 著 · 2026</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span>{activeCategory === 'knowledgeBase' ? `${kbTarget.toUpperCase()} 知识库模式` : `${isAcademicMode ? '16开学术专著' : 'A4标准'} 打印`}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            
            {activeCategory === 'knowledgeBase' ? (
              <>
                {/* Copy Markdown Button */}
                <button
                  onClick={handleCopyMarkdown}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer border border-zinc-200 dark:border-zinc-700"
                >
                  {copiedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">已复制到剪贴板！</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>复制 Markdown (带元数据)</span>
                    </>
                  )}
                </button>

                {/* Download .md File Button */}
                <button
                  disabled={isGenerating}
                  onClick={handleDownloadMarkdown}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {downloadSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                      <span>已下载 .md 文件</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>下载 Markdown 文件 (.md)</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              /* Print Academic PDF Button */
              <button
                disabled={isGenerating}
                onClick={handleExportAcademicBook}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>正在进行 16 开学术排版...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>调用浏览器打印生成学术 PDF</span>
                  </>
                )}
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
