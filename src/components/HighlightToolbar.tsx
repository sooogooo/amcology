import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Sparkles, Image as ImageIcon, X, Download, Share2 } from 'lucide-react';
import { Article } from '../data/articles';

interface HighlightToolbarProps {
  article: Article;
}

export function HighlightToolbar({ article }: HighlightToolbarProps) {
  const [selectedText, setSelectedText] = useState('');
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [cardTheme, setCardTheme] = useState<'cream' | 'dark' | 'amber'>('cream');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Listen to text selection in the document
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        // Selection cleared
        if (!cardModalOpen) {
          setToolbarPosition(null);
        }
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 4) {
        setToolbarPosition(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Position toolbar slightly above the selection
      setSelectedText(text);
      setToolbarPosition({
        x: Math.max(10, rect.left + rect.width / 2),
        y: Math.max(10, rect.top - 10)
      });
    };

    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('touchend', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('touchend', handleSelectionChange);
    };
  }, [cardModalOpen]);

  // Copy with author attribution
  const handleCopyQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const formattedText = `“${selectedText}”\n\n—— 摘自《医美产业经济学》EP.${String(article.id).padStart(2, '0')} ${article.title}\n作者：@sooogooo (超级医美)\n阅读链接：${window.location.href}`;
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setToolbarPosition(null);
    }, 1500);
  };

  // Render paper-styled bookmark card
  const generateCardImage = () => {
    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;

    // Theme backgrounds
    let bgFill = '#fdfbf7';
    let textPrimary = '#18181b';
    let textSecondary = '#71717a';
    let accentColor = '#b45309';
    let borderColor = '#e4e4e7';

    if (cardTheme === 'dark') {
      bgFill = '#18181b';
      textPrimary = '#fafafa';
      textSecondary = '#a1a1aa';
      accentColor = '#f59e0b';
      borderColor = '#27272a';
    } else if (cardTheme === 'amber') {
      bgFill = '#fef3c7';
      textPrimary = '#451a03';
      textSecondary = '#78350f';
      accentColor = '#b45309';
      borderColor = '#fde68a';
    }

    // 1. Clean Background with delicate paper feel
    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, width, height);

    // Subtle outer frame border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Inner delicate double stroke
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(44, 44, width - 88, height - 88);

    // Top Header Brand (Centered)
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`EPISODE ${String(article.id).padStart(2, '0')} · ${article.moduleName.toUpperCase()}`, width / 2, 90);

    ctx.fillStyle = textSecondary;
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('医美产业经济学 · 读国富论重新理解医美', width / 2, 115);

    // Centered Divider line
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo((width / 2) - 40, 135);
    ctx.lineTo((width / 2) + 40, 135);
    ctx.stroke();

    // 2. Wrap text and calculate centered lines
    ctx.fillStyle = textPrimary;
    ctx.font = 'italic 500 24px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    const maxWidth = width - 180;
    const lineHeight = 44;

    const chars = selectedText.split('');
    const lines: string[] = [];
    let currentLine = '';

    for (let n = 0; n < chars.length; n++) {
      const testLine = currentLine + chars[n];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(currentLine);
        currentLine = chars[n];
        if (lines.length >= 10) {
          currentLine += '...';
          break;
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    // Vertically center the quote block between Y=180 and Y=740
    const blockHeight = lines.length * lineHeight;
    const startY = Math.max(220, 180 + ((560 - blockHeight) / 2));

    // Top quotation mark
    ctx.fillStyle = accentColor;
    ctx.font = '900 64px serif';
    ctx.textAlign = 'center';
    ctx.fillText('“', width / 2, startY - 30);

    // Render Centered Quote Lines
    ctx.fillStyle = textPrimary;
    ctx.font = 'italic 500 23px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    lines.forEach((l, idx) => {
      ctx.fillText(l, width / 2, startY + (idx * lineHeight));
    });

    // Bottom quotation mark
    ctx.fillStyle = accentColor;
    ctx.font = '900 64px serif';
    ctx.textAlign = 'center';
    ctx.fillText('”', width / 2, startY + (lines.length * lineHeight) + 20);

    // 3. Source Article (Centered)
    const sourceY = Math.min(790, startY + (lines.length * lineHeight) + 65);
    ctx.fillStyle = textSecondary;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`—— 选自《${article.title}》`, width / 2, sourceY);

    // 4. Bottom Signature, QR Code & Author Stamp
    const footerY = 850;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, footerY);
    ctx.lineTo(width - 80, footerY);
    ctx.stroke();

    // Text on bottom left
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('于意云 · 《医美产业经济学》专栏', 80, footerY + 36);

    ctx.fillStyle = textSecondary;
    ctx.font = '11px monospace';
    ctx.fillText('微信公众号 · 读《国富论》重新理解医美', 80, footerY + 60);

    // QR Image on bottom right
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = 'https://amcology.talk.stemcell.gold/talk-images/wechatpub-code.jpg';

    const finishCardRender = () => {
      try {
        if (qrImg.complete && qrImg.naturalWidth > 0) {
          ctx.fillStyle = cardTheme === 'dark' ? '#27272a' : '#ffffff';
          ctx.fillRect(width - 155, footerY + 12, 75, 75);
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(width - 155, footerY + 12, 75, 75);
          ctx.drawImage(qrImg, width - 150, footerY + 17, 65, 65);
        }
      } catch {
        // fallback
      }
      const dataUrl = canvas.toDataURL('image/png');
      setCardImageUrl(dataUrl);
    };

    if (qrImg.complete) {
      finishCardRender();
    } else {
      qrImg.onload = finishCardRender;
      qrImg.onerror = finishCardRender;
    }
  };

  const handleOpenCardModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    generateCardImage();
    setCardModalOpen(true);
    setToolbarPosition(null);
  };

  useEffect(() => {
    if (cardModalOpen && selectedText) {
      generateCardImage();
    }
  }, [cardTheme]);

  return (
    <>
      {/* 1. Floating Mini Toolbar upon Selection */}
      {toolbarPosition && selectedText && (
        <div
          style={{
            position: 'fixed',
            left: `${toolbarPosition.x}px`,
            top: `${toolbarPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 60
          }}
          className="flex items-center gap-1 p-1 bg-zinc-900 text-white rounded-xl shadow-2xl border border-zinc-700 animate-fade-in text-xs font-medium"
        >
          <button
            onClick={handleCopyQuote}
            className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-bold">已复制引用</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-300" />
                <span>复制金句</span>
              </>
            )}
          </button>

          <div className="w-[1px] h-3 bg-zinc-700 mx-0.5" />

          <button
            onClick={handleOpenCardModal}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>生成书笺卡片</span>
          </button>
        </div>
      )}

      {/* 2. Paper-styled Bookmark Card Modal */}
      {cardModalOpen && (
        <div 
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setCardModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900/90">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <h3 className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  极简纸质书笺卡片生成器
                </h3>
              </div>
              <button
                onClick={() => setCardModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">书笺纸质质感：</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCardTheme('cream')}
                    className={`px-3 py-1 rounded-lg border text-xs cursor-pointer ${
                      cardTheme === 'cream' 
                        ? 'bg-stone-100 text-zinc-900 border-zinc-900 font-bold' 
                        : 'bg-stone-50 text-zinc-600 border-zinc-200'
                    }`}
                  >
                    经典米白
                  </button>
                  <button
                    onClick={() => setCardTheme('dark')}
                    className={`px-3 py-1 rounded-lg border text-xs cursor-pointer ${
                      cardTheme === 'dark' 
                        ? 'bg-zinc-900 text-white border-zinc-900 font-bold' 
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    夜间墨黑
                  </button>
                  <button
                    onClick={() => setCardTheme('amber')}
                    className={`px-3 py-1 rounded-lg border text-xs cursor-pointer ${
                      cardTheme === 'amber' 
                        ? 'bg-amber-200 text-amber-900 border-amber-800 font-bold' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    典雅暖金
                  </button>
                </div>
              </div>

              {/* Card Image Preview */}
              {cardImageUrl && (
                <div className="relative border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-inner bg-stone-100 flex items-center justify-center p-2">
                  <img 
                    src={cardImageUrl} 
                    alt="Bookmark Card" 
                    className="w-full max-h-80 object-contain rounded-lg shadow-sm"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleCopyQuote}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-zinc-800 dark:text-zinc-200 rounded-xl font-medium text-xs transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? '已复制署名文本' : '复制附带出处文字'}</span>
                </button>

                {cardImageUrl && (
                  <a
                    href={cardImageUrl}
                    download={`医美产业经济学-书笺-EP${String(article.id).padStart(2, '0')}.png`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>保存高清书笺图片</span>
                  </a>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-stone-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>自动带入 @sooogooo 专栏版权声明</span>
              <span>长按图片亦可直接发送给朋友</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
