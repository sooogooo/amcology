import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Image as ImageIcon, Share2, Send, ExternalLink, Sparkles, Smartphone, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Article } from '../data/articles';

interface ShareModalProps {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ article, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [isWeChat, setIsWeChat] = useState(false);
  const [showWeChatOverlay, setShowWeChatOverlay] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Detect WeChat built-in browser
    const ua = navigator.userAgent.toLowerCase();
    const isWx = /micromessenger/.test(ua);
    setIsWeChat(isWx);
  }, []);

  // Format share text
  const shareText = `【医美产业经济学】EP.${String(article.id).padStart(2, '0')} ${article.title}\n\n「核心金句」\n${article.quote}\n\n阅读全文：${window.location.href}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleNativeShare = async () => {
    if (isWeChat) {
      // Prompt WeChat users directly with overlay for best icon compatibility
      setShowWeChatOverlay(true);
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `医美产业经济学 EP.${String(article.id).padStart(2, '0')} ${article.title}`,
          text: `${article.quote}`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback if cancelled or unsupported
      }
    } else {
      setShowWeChatOverlay(true);
    }
  };

  // Generate high-resolution PNG share poster
  const handleGeneratePoster = () => {
    setIsGeneratingPoster(true);
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGeneratingPoster(false);
      return;
    }

    // 2x Retina resolution for razor sharp mobile display
    const width = 800;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;

    // Background - Warm academic paper linen tone #fafaf9
    ctx.fillStyle = '#fafaf9';
    ctx.fillRect(0, 0, width, height);

    // Decorative frame borders
    ctx.strokeStyle = '#e4e4e7';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Load and draw logo
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = 'https://amcology.talk.stemcell.gold/talk-images/amcology.png';
    
    const renderContent = () => {
      // Draw Logo Icon
      try {
        ctx.drawImage(logoImg, 60, 60, 100, 48);
      } catch {
        // fallback
      }

      // Header Brand text
      ctx.fillStyle = '#b45309'; // amber-700
      ctx.font = 'bold 16px "Noto Sans SC", sans-serif';
      ctx.fillText('ADAM SMITH × MED-AESTHETICS', 180, 82);

      ctx.fillStyle = '#71717a'; // zinc-500
      ctx.font = '13px "Noto Sans SC", sans-serif';
      ctx.fillText('医美产业经济学 · 读《国富论》重新理解医美', 180, 104);

      // Horizontal separator
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(60, 150);
      ctx.lineTo(width - 60, 150);
      ctx.stroke();

      // Episode Tag Pill
      ctx.fillStyle = '#18181b';
      ctx.fillRect(60, 180, 160, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`EPISODE ${String(article.id).padStart(2, '0')}`, 75, 201);

      ctx.fillStyle = '#71717a';
      ctx.font = 'bold 14px "Noto Sans SC", sans-serif';
      ctx.fillText(`· ${article.moduleName}`, 235, 201);

      // Article Title (Multi-line wrapping)
      ctx.fillStyle = '#18181b';
      ctx.font = 'bold 36px "Noto Serif SC", serif';
      const titleLines = wrapText(ctx, article.title, width - 120);
      let titleY = 265;
      titleLines.forEach(line => {
        ctx.fillText(line, 60, titleY);
        titleY += 48;
      });

      // Amber accent line
      ctx.fillStyle = '#b45309';
      ctx.fillRect(60, titleY + 10, 80, 4);

      // Golden Quote Card Box
      const quoteBoxY = titleY + 45;
      const quoteBoxHeight = 360;
      ctx.fillStyle = '#f4f4f5';
      ctx.fillRect(60, quoteBoxY, width - 120, quoteBoxHeight);
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 1;
      ctx.strokeRect(60, quoteBoxY, width - 120, quoteBoxHeight);

      // Quote label
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('KEY THOUGHT / 核心论点', 85, quoteBoxY + 40);

      // Quote text
      ctx.fillStyle = '#27272a';
      ctx.font = '500 22px "Noto Serif SC", serif';
      const quoteLines = wrapText(ctx, `“${article.quote}”`, width - 170);
      let quoteY = quoteBoxY + 85;
      quoteLines.forEach(line => {
        ctx.fillText(line, 85, quoteY);
        quoteY += 36;
      });

      // Module description below quote
      ctx.fillStyle = '#71717a';
      ctx.font = 'italic 16px "Noto Sans SC", sans-serif';
      ctx.fillText(`模块主旨：${article.moduleDesc}`, 85, quoteBoxY + quoteBoxHeight - 30);

      // Footer Area
      const footerY = height - 140;
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, footerY);
      ctx.lineTo(width - 60, footerY);
      ctx.stroke();

      // Footer branding & author
      ctx.fillStyle = '#18181b';
      ctx.font = 'bold 16px "Noto Sans SC", sans-serif';
      ctx.fillText('于意云 著 ｜ @sooogooo', 60, footerY + 40);

      ctx.fillStyle = '#71717a';
      ctx.font = '13px monospace';
      ctx.fillText('从财富规律到美丽消费 · 从商业效率到人的改善欲望', 60, footerY + 65);

      // Load and draw actual WeChat Official Account QR Code Image
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = 'https://amcology.talk.stemcell.gold/talk-images/wechatpub-code.jpg';

      const finishRender = () => {
        try {
          if (qrImg.complete && qrImg.naturalWidth > 0) {
            // Draw real WeChat QR image on the bottom right
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(width - 165, footerY + 12, 105, 105);
            ctx.strokeStyle = '#e4e4e7';
            ctx.lineWidth = 1;
            ctx.strokeRect(width - 165, footerY + 12, 105, 105);
            ctx.drawImage(qrImg, width - 160, footerY + 17, 75, 75);

            ctx.fillStyle = '#18181b';
            ctx.font = 'bold 10px "Noto Sans SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('微信扫码关注', width - 112, footerY + 106);
            ctx.textAlign = 'left';
          } else {
            // Fallback QR badge
            ctx.fillStyle = '#18181b';
            ctx.fillRect(width - 180, footerY + 25, 120, 48);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px "Noto Sans SC", sans-serif';
            ctx.fillText('微信长按识别', width - 165, footerY + 46);
            ctx.font = '10px monospace';
            ctx.fillText('扫码关注公众号', width - 165, footerY + 60);
          }
        } catch {
          // fallback
        }

        // Convert to PNG Data URL
        const dataUrl = canvas.toDataURL('image/png');
        setPosterUrl(dataUrl);
        setIsGeneratingPoster(false);
      };

      if (qrImg.complete) {
        finishRender();
      } else {
        qrImg.onload = finishRender;
        qrImg.onerror = finishRender;
      }
    };

    if (logoImg.complete) {
      renderContent();
    } else {
      logoImg.onload = renderContent;
      logoImg.onerror = () => {
        renderContent();
      };
    }
  };

  // Helper function to wrap text for Canvas
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 1. Dedicated WeChat System Share Overlay */}
      {showWeChatOverlay && (
        <div 
          id="wechat-share-overlay"
          className="fixed inset-0 z-70 flex flex-col items-end p-4 bg-zinc-950/85 backdrop-blur-md animate-fade-in text-white"
          onClick={() => setShowWeChatOverlay(false)}
        >
          {/* Top-right curving arrow indicator */}
          <div className="flex flex-col items-end mr-3 mt-1 animate-bounce">
            <div className="flex items-center gap-1.5 bg-amber-500 text-zinc-950 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              <span>点击右上角「···」</span>
            </div>
            <svg 
              className="w-16 h-16 text-amber-400 mt-1 stroke-current" 
              viewBox="0 0 100 100" 
              fill="none" 
              strokeWidth="5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M 20 80 Q 60 70 85 25" />
              <polyline points="65,22 85,25 82,45" />
            </svg>
          </div>

          {/* Center Card Guidance */}
          <div 
            className="w-full max-w-sm mx-auto mt-6 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-serif font-bold text-white">微信官方卡片分享指引</h4>
                <p className="text-[11px] text-zinc-400">已启用 512×512 超清专栏图标与摘要</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-zinc-300">
              <div className="flex items-start gap-2.5 p-2.5 bg-zinc-800/80 border border-zinc-700/50 rounded-xl">
                <span className="flex-shrink-0 w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-[11px]">1</span>
                <div>
                  <p className="font-semibold text-white">点击右上角「···」菜单</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">微信内置浏览器右上角系统菜单</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-zinc-800/80 border border-zinc-700/50 rounded-xl">
                <span className="flex-shrink-0 w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-[11px]">2</span>
                <div>
                  <p className="font-semibold text-white">选择「发送给朋友」或「分享到朋友圈」</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">微信将自动拉取官方 1:1 高清图标与正文导读</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-zinc-800/80 border border-zinc-700/50 rounded-xl">
                <span className="flex-shrink-0 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="font-semibold text-emerald-300">最佳视觉兼容保证</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">自动匹配 OpenGraph 与微信 JSSDK 高清缩略图规范</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWeChatOverlay(false)}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              我知道了，去分享
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Share Modal Dialog */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-900/60 backdrop-blur-sm animate-fade-in">
        <div 
          className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-stone-50">
            <div className="flex items-center gap-2.5">
              <img 
                src="/share-icon.png" 
                alt="Icon" 
                className="w-7 h-7 rounded-lg border border-zinc-200 shadow-xs" 
              />
              <div>
                <h3 className="font-serif font-bold text-zinc-900 text-sm">分享文章 | 医美产业经济学</h3>
                <p className="text-[10px] text-zinc-400 font-mono">已适配 512×512 超清社交卡片规范</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-full transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-5">
            
            {/* WeChat User Dedicated Optimization Banner */}
            <div 
              id="wechat-helper-card"
              className={`p-3.5 rounded-xl border transition-all ${
                isWeChat 
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
                  : 'bg-stone-50 border-zinc-200 text-zinc-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span className="text-xs font-bold">
                      {isWeChat ? '已检测到微信内置环境' : '微信分享图标最佳兼容'}
                    </span>
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-mono rounded">
                      512×512 HD
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    推荐使用微信顶部系统菜单「···」分享，可自动带出官方超清缩略图与专栏封面卡片。
                  </p>
                </div>
                <button
                  id="open-wechat-guide-btn"
                  onClick={() => setShowWeChatOverlay(true)}
                  className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-medium rounded-lg shadow-xs transition-transform active:scale-95 cursor-pointer"
                >
                  <span>右上角指引</span>
                  <ArrowUpRight className="w-3 h-3 text-amber-400" />
                </button>
              </div>
            </div>

            {/* Article Preview Card with Live WeChat Icon Mock */}
            <div className="p-4 bg-stone-50/80 border border-zinc-200 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-zinc-900 text-white text-[10px] font-mono font-bold rounded">
                  EP.{String(article.id).padStart(2, '0')}
                </span>
                <span className="text-xs font-bold text-amber-700">{article.moduleName}</span>
              </div>
              
              <div className="flex gap-3 items-start">
                <img 
                  src="/share-icon.png" 
                  alt="WeChat Card Thumbnail" 
                  className="w-12 h-12 rounded-lg border border-zinc-200 flex-shrink-0 object-cover shadow-xs"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-bold font-serif text-zinc-900 leading-snug">
                    {article.title}
                  </h4>
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                    {article.quote}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-zinc-400 font-mono border-t border-zinc-200/60">
                <span>官方分享图源：/share-icon.png (512×512)</span>
                <span>1:1 超清比例</span>
              </div>
            </div>

            {/* Share Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* System / WeChat Direct Share */}
              <button
                id="native-share-action-btn"
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-white rounded-xl font-medium text-xs hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4 text-emerald-400" />
                <span>{isWeChat ? '呼出微信分享指引' : '调用系统菜单分享'}</span>
              </button>

              {/* Generate Poster Button */}
              <button
                id="generate-poster-btn"
                onClick={handleGeneratePoster}
                disabled={isGeneratingPoster}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-700 text-white rounded-xl font-medium text-xs hover:bg-amber-800 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-amber-200" />
                <span>{isGeneratingPoster ? '正在生成海报...' : '生成金句朋友圈海报'}</span>
              </button>
            </div>

            {/* Copy Link & Copy Text Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700">微信/社交平台分享文案</label>
                <button
                  id="copy-share-text-btn"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">已复制到剪贴板</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制全文文案</span>
                    </>
                  )}
                </button>
              </div>
              <div 
                onClick={handleCopyLink}
                className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600 font-mono leading-relaxed cursor-pointer hover:border-zinc-300 transition-colors"
                title="点击快速复制"
              >
                <p className="line-clamp-3">{shareText}</p>
              </div>
            </div>

            {/* Generated Poster Display if available */}
            {posterUrl && (
              <div className="p-4 bg-stone-100 border border-zinc-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">分享海报已就绪</span>
                  <span className="text-[11px] text-amber-700 font-medium">长按下方图片保存或转发</span>
                </div>
                <div className="relative border border-zinc-300 rounded-lg overflow-hidden shadow-inner bg-white">
                  <img 
                    src={posterUrl} 
                    alt="Share Poster" 
                    className="w-full h-auto max-h-72 object-contain mx-auto"
                  />
                </div>
                <a
                  href={posterUrl}
                  download={`医美产业经济学-EP${String(article.id).padStart(2, '0')}.png`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-200 text-zinc-800 text-xs font-bold rounded-lg hover:bg-stone-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>下载超清 PNG 海报</span>
                </a>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-stone-50 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
            <span>微信分享卡片已内置 PNG 512×512 图标</span>
            <button 
              onClick={onClose}
              className="text-zinc-600 hover:text-zinc-900 font-medium cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
