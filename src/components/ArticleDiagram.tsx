import React, { useState } from 'react';
import { ZoomIn, Maximize2 } from 'lucide-react';
import { useImageLightbox } from './ImageLightboxModal';

interface ArticleDiagramProps {
  articleId: number;
}

// Chart tab definitions
type DiagramTabKey = 'episode' | 'division-table' | 'value-pie' | 'efficiency-trend';

export function ArticleDiagram({ articleId }: ArticleDiagramProps) {
  const [currentTab, setCurrentTab] = useState<DiagramTabKey>('episode');
  const { openLightbox } = useImageLightbox();

  const handleEnlargeDiagram = () => {
    const activeTabObj = tabs.find(t => t.key === currentTab);
    openLightbox({
      svgNode: (
        <div className="w-full min-w-[680px] max-w-4xl p-2 sm:p-4">
          {renderCurrentDiagram()}
        </div>
      ),
      title: `${activeTabObj?.label || '产业经济学图谱'} (EP.${String(articleId).padStart(2, '0')})`,
      caption: '支持使用滚轮/双击缩放、拖拽平移、顶部一键切换纸张白/米黄底色，全屏查看高清矢量拓扑与参数。',
      category: '高清矢量图谱',
      initialTone: 'white',
    });
  };

  // Clean aesthetic colors matching the theme:
  // Base: zinc-900 for dark texts, zinc-400 for structural lines, amber-700/amber-600 for highlighted accents.
  // Thin vector strokes: strokeWidth 0.75 to 1.25.

  // Tab 1: Division of Labor Evolution Table (分工演进表)
  const renderDivisionTable = () => {
    return (
      <div className="w-full">
        <svg viewBox="0 0 740 320" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
          {/* Outer Frame Grid */}
          <rect x="20" y="20" width="700" height="280" className="stroke-zinc-300" />
          
          {/* Header Row */}
          <line x1="20" y1="65" x2="720" y2="65" className="stroke-zinc-300" strokeWidth="1" />
          
          {/* Vertical Separators */}
          <line x1="140" y1="20" x2="140" y2="300" className="stroke-zinc-200" />
          <line x1="330" y1="20" x2="330" y2="300" className="stroke-zinc-200" />
          <line x1="520" y1="20" x2="520" y2="300" className="stroke-zinc-200" />

          {/* Row Separators */}
          <line x1="20" y1="110" x2="720" y2="110" className="stroke-zinc-200" />
          <line x1="20" y1="155" x2="720" y2="155" className="stroke-zinc-200" />
          <line x1="20" y1="205" x2="720" y2="205" className="stroke-zinc-200" />
          <line x1="20" y1="250" x2="720" y2="250" className="stroke-zinc-200" />

          {/* Column Headers */}
          <text x="80" y="46" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px] font-mono font-bold">对比维度 / DIMENSION</text>
          
          <text x="235" y="40" textAnchor="middle" stroke="none" fill="#18181b" className="text-[11px] font-bold">阶段一：个体医生作坊期</text>
          <text x="235" y="55" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px] font-mono">Solo Workshop Stage</text>
          
          <text x="425" y="40" textAnchor="middle" stroke="none" fill="#18181b" className="text-[11px] font-bold">阶段二：部门职能分工期</text>
          <text x="425" y="55" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px] font-mono">Functional Department Stage</text>
          
          <text x="620" y="40" textAnchor="middle" stroke="none" fill="#b45309" className="text-[11px] font-bold font-mono">阶段三：现代工业化平台期</text>
          <text x="620" y="55" textAnchor="middle" stroke="none" fill="#b45309" className="text-[9px] font-mono font-semibold">Industrialized Platform Stage</text>

          {/* Row 1: 组织协同形态 */}
          <text x="80" y="92" textAnchor="middle" stroke="none" fill="#18181b" className="text-[10px] font-bold">组织协同形态</text>
          <text x="235" y="92" textAnchor="middle" stroke="none" fill="#52525b" className="text-[10px]">医生包揽面诊+设计+实操+售后</text>
          <text x="425" y="92" textAnchor="middle" stroke="none" fill="#52525b" className="text-[10px]">咨询师买量获客 + 医生机械操作</text>
          <text x="620" y="92" textAnchor="middle" stroke="none" fill="#18181b" className="text-[10px] font-bold">首诊排查 + 专属美学 + 专注实操 + 数智随访</text>

          {/* Row 2: 核心生产要素 */}
          <text x="80" y="137" textAnchor="middle" stroke="none" fill="#18181b" className="text-[10px] font-bold">核心生产要素</text>
          <text x="235" y="137" textAnchor="middle" stroke="none" fill="#52525b" className="text-[10px]">高度依赖单兵手艺与个人声誉</text>
          <text x="425" y="137" textAnchor="middle" stroke="none" fill="#52525b" className="text-[10px]">公域投流买量 + 破价单品冲量</text>
          <text x="620" y="137" textAnchor="middle" stroke="none" fill="#b45309" className="text-[10px] font-bold">SOP临床知识库 + 梯队人才造血 + 严选供应链</text>

          {/* Row 3: 交付质量方差 */}
          <text x="80" y="185" textAnchor="middle" stroke="none" fill="#18181b" className="text-[10px] font-bold">交付质量方差</text>
          <text x="235" y="178" textAnchor="middle" stroke="none" fill="#ef4444" className="text-[10px] font-semibold">极高方差（波动剧烈）</text>
          <text x="235" y="194" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px]">受医生体力、情绪与琐事严重干扰</text>
          <text x="425" y="178" textAnchor="middle" stroke="none" fill="#d97706" className="text-[10px] font-semibold">中等方差（前后脱节）</text>
          <text x="425" y="194" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px]">咨询过度承诺导致交付断层纠纷</text>
          <text x="620" y="178" textAnchor="middle" stroke="none" fill="#15803d" className="text-[10px] font-bold">方差趋零（安全稳健）</text>
          <text x="620" y="194" textAnchor="middle" stroke="none" fill="#b45309" className="text-[9px]">全流程标准化质控与并发症零容忍兜底</text>

          {/* Row 4: 边际成本走向 */}
          <text x="80" y="232" textAnchor="middle" stroke="none" fill="#18181b" className="text-[10px] font-bold">边际成本走向</text>
          <text x="235" y="232" textAnchor="middle" stroke="none" fill="#ef4444" className="text-[10px]">递增（医生精力触顶无法扩容）</text>
          <text x="425" y="232" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px]">恒定高企（获客单价 CAC 持续走高）</text>
          <text x="620" y="232" textAnchor="middle" stroke="none" fill="#15803d" className="text-[10px] font-bold">边际递减（超长周期复购与转介绍自循环）</text>

          {/* Row 5: 机构长效资产 */}
          <text x="80" y="280" textAnchor="middle" stroke="none" fill="#18181b" className="text-[10px] font-bold">机构长效资产</text>
          <text x="235" y="280" textAnchor="middle" stroke="none" fill="#a1a1aa" className="text-[10px]">无（医生带走全部存量客群）</text>
          <text x="425" y="280" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px]">脆弱（依赖公域价格敏感客）</text>
          <text x="620" y="280" textAnchor="middle" stroke="none" fill="#b45309" className="text-[10px] font-bold">沉淀为机构品牌商誉与终身信任资本</text>
        </svg>
        <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>TAB 02 · 医美机构生产力分工演进全景矩阵</span>
          <span className="text-zinc-400">亚当·斯密分工深化理论 · 从单兵作坊到现代工业化平台</span>
        </div>
      </div>
    );
  };

  // Tab 2: Minimalist Value Decomposition Pie/Donut Chart (价值构成极简饼图)
  const renderValuePieChart = () => {
    return (
      <div className="w-full">
        <svg viewBox="0 0 740 300" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
          {/* Center Coordinates: cx=370, cy=150, outerRadius=90, innerRadius=55 */}
          
          {/* Sector 1: 35% Doctor Medical Skills (0 to 126 deg) */}
          <path 
            d="M 370 60 A 90 90 0 0 1 443 203 L 415 182 A 55 55 0 0 0 370 95 Z" 
            className="stroke-amber-700" 
            strokeWidth="1.25" 
          />
          {/* Sector 2: 25% Aesthetic Design (126 to 216 deg) */}
          <path 
            d="M 443 203 A 90 90 0 0 1 297 203 L 325 182 A 55 55 0 0 0 415 182 Z" 
            className="stroke-zinc-800" 
            strokeWidth="1" 
          />
          {/* Sector 3: 25% Hospital Safety & Risk Control (216 to 306 deg) */}
          <path 
            d="M 297 203 A 90 90 0 0 1 297 97 L 325 118 A 55 55 0 0 0 325 182 Z" 
            className="stroke-zinc-500" 
            strokeWidth="1" 
          />
          {/* Sector 4: 15% Physical Consumable / Devices (306 to 360 deg) */}
          <path 
            d="M 297 97 A 90 90 0 0 1 370 60 L 370 95 A 55 55 0 0 0 325 118 Z" 
            className="stroke-zinc-300" 
            strokeDasharray="2 2" 
            strokeWidth="0.8" 
          />

          {/* Center Text in Donut */}
          <text x="370" y="142" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px] font-mono tracking-widest uppercase">VALUE ANATOMY</text>
          <text x="370" y="158" textAnchor="middle" stroke="none" fill="#18181b" className="text-xs font-bold font-serif">十万医美消费</text>
          <text x="370" y="172" textAnchor="middle" stroke="none" fill="#b45309" className="text-[9px] font-mono font-bold">真实价值构成</text>

          {/* Pointer Line & Label 1: Top Right (35% Doctor Skill) */}
          <path d="M 425 120 L 490 90 L 590 90" className="stroke-amber-700" strokeWidth="0.8" />
          <circle cx="425" cy="120" r="2.5" fill="#b45309" stroke="none" />
          <text x="500" y="80" stroke="none" fill="#b45309" className="text-xs font-bold font-mono">35% 医生临床解剖与实操经验</text>
          <text x="500" y="105" stroke="none" fill="#71717a" className="text-[10px]">血管神经精确规避 · 针尖层次精度 · 十年训练人力资本</text>

          {/* Pointer Line & Label 2: Bottom Right (25% Aesthetic Design) */}
          <path d="M 400 215 L 460 245 L 590 245" className="stroke-zinc-800" strokeWidth="0.8" />
          <circle cx="400" cy="215" r="2.5" fill="#18181b" stroke="none" />
          <text x="470" y="235" stroke="none" fill="#18181b" className="text-xs font-bold font-mono">25% 审美对齐与不出错概率</text>
          <text x="470" y="260" stroke="none" fill="#71717a" className="text-[10px]">气质定制 · 拒绝馒化畸变 · 极度稀缺的确定性交付</text>

          {/* Pointer Line & Label 3: Bottom Left (25% Hospital Safety) */}
          <path d="M 305 190 L 250 245 L 140 245" className="stroke-zinc-500" strokeWidth="0.8" />
          <circle cx="305" cy="190" r="2.5" fill="#71717a" stroke="none" />
          <text x="140" y="235" textAnchor="start" stroke="none" fill="#27272a" className="text-xs font-bold font-mono">25% 医疗院感环境与风控兜底</text>
          <text x="140" y="260" textAnchor="start" stroke="none" fill="#71717a" className="text-[10px]">抢救保障机制 · 无菌层流质控 · 团队全周期随访</text>

          {/* Pointer Line & Label 4: Top Left (15% Consumables) */}
          <path d="M 335 80 L 250 60 L 140 60" className="stroke-zinc-400" strokeWidth="0.8" strokeDasharray="3 3" />
          <circle cx="335" cy="80" r="2.5" fill="#a1a1aa" stroke="none" />
          <text x="140" y="50" textAnchor="start" stroke="none" fill="#52525b" className="text-xs font-bold font-mono">15% 物理耗材与药品设备折旧</text>
          <text x="140" y="75" textAnchor="start" stroke="none" fill="#a1a1aa" className="text-[10px]">出厂药械原料成本（静态硬件，无独立壁垒）</text>
        </svg>
        <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>TAB 03 · 极简医美价值构成极简饼图</span>
          <span className="text-zinc-400">求美者买的不是透明液体 · 而是零事故交付与审美确定性</span>
        </div>
      </div>
    );
  };

  // Tab 3: Linear Capital Efficiency Trend Chart (线性效率趋势图)
  const renderEfficiencyTrendChart = () => {
    return (
      <div className="w-full">
        <svg viewBox="0 0 740 300" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
          {/* Axes */}
          <line x1="80" y1="240" x2="680" y2="240" className="stroke-zinc-400" strokeWidth="1" />
          <line x1="80" y1="40" x2="80" y2="240" className="stroke-zinc-400" strokeWidth="1" />
          <polygon points="680,240 672,236 672,244" fill="#71717a" stroke="none" />
          <polygon points="80,40 76,48 84,48" fill="#71717a" stroke="none" />

          <text x="680" y="260" textAnchor="end" stroke="none" fill="#71717a" className="text-[10px] font-mono">发展周期与资本投入规模 (Capital & Time Scale) →</text>
          <text x="70" y="30" textAnchor="start" stroke="none" fill="#71717a" className="text-[10px] font-mono">↑ 边际回报与全生命周期效率 (Marginal Efficiency / LTV)</text>

          {/* Grid Ticks */}
          <line x1="80" y1="180" x2="660" y2="180" className="stroke-zinc-200" strokeDasharray="3 3" />
          <line x1="80" y1="120" x2="660" y2="120" className="stroke-zinc-200" strokeDasharray="3 3" />
          <line x1="80" y1="60" x2="660" y2="60" className="stroke-zinc-200" strokeDasharray="3 3" />
          <text x="72" y="184" textAnchor="end" stroke="none" fill="#a1a1aa" className="text-[9px] font-mono">0.5x</text>
          <text x="72" y="124" textAnchor="end" stroke="none" fill="#a1a1aa" className="text-[9px] font-mono">1.0x</text>
          <text x="72" y="64" textAnchor="end" stroke="none" fill="#a1a1aa" className="text-[9px] font-mono">2.0x</text>

          {/* Tipping point vertical line */}
          <line x1="310" y1="40" x2="310" y2="240" className="stroke-amber-600/40" strokeDasharray="4 4" strokeWidth="0.8" />
          <text x="310" y="255" textAnchor="middle" stroke="none" fill="#b45309" className="text-[9px] font-mono font-bold">分工临界点 (Specialization Threshold)</text>

          {/* Curve 1: Traditional Traffic Funnel (Starts fast, collapses as CAC spikes) */}
          <path d="M 90 140 C 180 110, 260 125, 340 165 C 440 210, 560 230, 650 235" className="stroke-red-500/80" strokeDasharray="4 3" strokeWidth="1.2" />
          <circle cx="170" cy="116" r="3" fill="#ef4444" stroke="none" />
          <text x="170" y="105" textAnchor="middle" stroke="none" fill="#ef4444" className="text-[9px] font-mono font-bold">初期买量红利</text>
          <circle cx="560" cy="225" r="3" fill="#ef4444" stroke="none" />
          <text x="560" y="215" textAnchor="middle" stroke="none" fill="#ef4444" className="text-[9px] font-mono font-bold">买量成本高企·利润枯竭</text>
          <text x="655" y="225" textAnchor="start" stroke="none" fill="#ef4444" className="text-[10px] font-bold">传统投流模式 (CAC 飙升)</text>

          {/* Curve 2: Division of Labor & SOP System (Investment period -> Compounding Surge) */}
          <path d="M 90 220 C 180 215, 270 200, 340 150 C 420 90, 520 60, 650 50" className="stroke-amber-700" strokeWidth="1.75" />
          <circle cx="340" cy="150" r="4" fill="#b45309" stroke="none" />
          <circle cx="650" cy="50" r="4" fill="#b45309" stroke="none" />
          <text x="348" y="142" stroke="none" fill="#b45309" className="text-[10px] font-bold font-mono">质量方差归零 · 转介绍爆发</text>
          <text x="655" y="54" textAnchor="start" stroke="none" fill="#b45309" className="text-[10px] font-bold">组织分工SOP复利模型 (LTV 飞轮)</text>

          {/* Curve 3: Institutional Intangible Capital (Steady Linear Asset Accumulation) */}
          <path d="M 90 230 L 650 110" className="stroke-zinc-700" strokeWidth="1" />
          <text x="655" y="114" textAnchor="start" stroke="none" fill="#18181b" className="text-[10px] font-bold">机构无形资产积累线 (商誉与知识库)</text>

          {/* Safe floor label */}
          <line x1="80" y1="210" x2="660" y2="210" className="stroke-zinc-300" strokeDasharray="1 3" />
          <text x="85" y="205" textAnchor="start" stroke="none" fill="#a1a1aa" className="text-[8px] font-mono">行业生存临界线 (Survival Baseline)</text>
        </svg>
        <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>TAB 04 · 资本与效率线性趋势图</span>
          <span className="text-zinc-400">跨越分工临界点 · 从单次博弈耗损走向长效资产复利</span>
        </div>
      </div>
    );
  };

  // Episode-Specific Diagram Switcher
  const renderDiagram = () => {
    switch (articleId) {
      case 1:
        // Fig 1: Aesthetic Production System Matrix
        return (
          <div className="w-full">
            <svg viewBox="0 0 720 220" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
              {/* Left Box: Static Resources */}
              <rect x="20" y="30" width="180" height="150" className="stroke-zinc-300" strokeDasharray="3 3" />
              <text x="110" y="55" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px] font-mono tracking-widest font-semibold">STATIC RESOURCES</text>
              <text x="110" y="75" textAnchor="middle" stroke="none" fill="#18181b" className="text-xs font-bold">静态生产要素</text>
              <line x1="40" y1="90" x2="180" y2="90" className="stroke-zinc-200" />
              <text x="110" y="112" textAnchor="middle" stroke="none" fill="#71717a" className="text-[11px]">进口光电设备</text>
              <text x="110" y="132" textAnchor="middle" stroke="none" fill="#71717a" className="text-[11px]">注射填充耗材</text>
              <text x="110" y="152" textAnchor="middle" stroke="none" fill="#a1a1aa" className="text-[10px] font-mono">（易贬值 · 无自主壁垒）</text>

              {/* Connecting Flow Arrow */}
              <path d="M 200 105 L 250 105" className="stroke-zinc-400" />
              <polygon points="250,105 242,101 242,109" fill="#71717a" stroke="none" />
              <text x="225" y="98" textAnchor="middle" stroke="none" fill="#b45309" className="text-[9px] font-mono font-bold">+ 组织系统</text>

              {/* Center Box: Aesthetic Production System */}
              <rect x="260" y="20" width="220" height="170" className="stroke-amber-700/80" strokeWidth="1" />
              <text x="370" y="45" textAnchor="middle" stroke="none" fill="#b45309" className="text-[10px] font-mono tracking-widest font-bold">PRODUCTION SYSTEM</text>
              <text x="370" y="65" textAnchor="middle" stroke="none" fill="#18181b" className="text-xs font-bold">美学生产力系统</text>
              
              {/* Internal 4-node breakdown */}
              <g className="text-[10px]">
                <rect x="275" y="80" width="90" height="32" className="stroke-zinc-200" />
                <text x="320" y="100" textAnchor="middle" stroke="none" fill="#27272a">面部解剖诊断</text>

                <rect x="375" y="80" width="90" height="32" className="stroke-zinc-200" />
                <text x="420" y="100" textAnchor="middle" stroke="none" fill="#27272a">心理预期把控</text>

                <rect x="275" y="122" width="90" height="32" className="stroke-zinc-200" />
                <text x="320" y="142" textAnchor="middle" stroke="none" fill="#27272a">无菌操作底线</text>

                <rect x="375" y="122" width="90" height="32" className="stroke-zinc-200" />
                <text x="420" y="142" textAnchor="middle" stroke="none" fill="#27272a">术后全周期追踪</text>
              </g>

              {/* Connecting Flow Arrow */}
              <path d="M 480 105 L 530 105" className="stroke-zinc-400" />
              <polygon points="530,105 522,101 522,109" fill="#71717a" stroke="none" />
              <text x="505" y="98" textAnchor="middle" stroke="none" fill="#b45309" className="text-[9px] font-mono font-bold">输出价值</text>

              {/* Right Box: Value Output */}
              <rect x="540" y="30" width="160" height="150" className="stroke-zinc-900" strokeWidth="1" />
              <text x="620" y="55" textAnchor="middle" stroke="none" fill="#18181b" className="text-[10px] font-mono tracking-widest font-bold">DELIVERY VALUE</text>
              <text x="620" y="75" textAnchor="middle" stroke="none" fill="#18181b" className="text-xs font-bold">确定性交付结果</text>
              <line x1="560" y1="90" x2="680" y2="90" className="stroke-zinc-200" />
              <text x="620" y="112" textAnchor="middle" stroke="none" fill="#27272a" className="text-[11px]">不出错的安全感</text>
              <text x="620" y="132" textAnchor="middle" stroke="none" fill="#27272a" className="text-[11px]">自然年轻化效果</text>
              <text x="620" y="154" textAnchor="middle" stroke="none" fill="#b45309" className="text-[10px] font-mono font-bold">高额定价权与复购</text>
            </svg>
            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>FIG 01.1 · 美学生产力系统模型</span>
              <span className="text-zinc-400">亚当·斯密制针工厂原理在医美的现代映射</span>
            </div>
          </div>
        );

      case 2:
        // Fig 2: Division of Labor & Team Topology
        return (
          <div className="w-full">
            <svg viewBox="0 0 720 200" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
              {/* Central axis line */}
              <line x1="40" y1="100" x2="680" y2="100" className="stroke-zinc-200" strokeDasharray="4 4" />

              {/* Step 1 */}
              <circle cx="100" cy="100" r="32" className="stroke-zinc-800" fill="#fafaf9" />
              <text x="100" y="95" textAnchor="middle" stroke="none" fill="#b45309" className="text-[9px] font-mono font-bold">STAGE 01</text>
              <text x="100" y="110" textAnchor="middle" stroke="none" fill="#18181b" className="text-[11px] font-bold">临床首诊</text>
              <text x="100" y="150" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px]">解剖分型与禁忌排查</text>

              {/* Connector 1 */}
              <path d="M 132 100 L 228 100" className="stroke-zinc-400" />
              <polygon points="228,100 220,96 220,104" fill="#71717a" stroke="none" />

              {/* Step 2 */}
              <circle cx="260" cy="100" r="32" className="stroke-zinc-800" fill="#fafaf9" />
              <text x="260" y="95" textAnchor="middle" stroke="none" fill="#b45309" className="text-[9px] font-mono font-bold">STAGE 02</text>
              <text x="260" y="110" textAnchor="middle" stroke="none" fill="#18181b" className="text-[11px] font-bold">美学设计</text>
              <text x="260" y="150" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px]">气质定位与预期对齐</text>

              {/* Connector 2 */}
              <path d="M 292 100 L 388 100" className="stroke-zinc-400" />
              <polygon points="388,100 380,96 380,104" fill="#71717a" stroke="none" />

              {/* Step 3 (Core) */}
              <circle cx="420" cy="100" r="36" className="stroke-amber-700" strokeWidth="1.25" fill="#fafaf9" />
              <text x="420" y="94" textAnchor="middle" stroke="none" fill="#b45309" className="text-[9px] font-mono font-bold">STAGE 03</text>
              <text x="420" y="110" textAnchor="middle" stroke="none" fill="#18181b" className="text-[12px] font-bold">精细实操</text>
              <text x="420" y="155" textAnchor="middle" stroke="none" fill="#b45309" className="text-[10px] font-semibold">医生精力100%专注技术</text>

              {/* Connector 3 */}
              <path d="M 456 100 L 548 100" className="stroke-zinc-400" />
              <polygon points="548,100 540,96 540,104" fill="#71717a" stroke="none" />

              {/* Step 4 */}
              <circle cx="580" cy="100" r="32" className="stroke-zinc-800" fill="#fafaf9" />
              <text x="580" y="95" textAnchor="middle" stroke="none" fill="#b45309" className="text-[9px] font-mono font-bold">STAGE 04</text>
              <text x="580" y="110" textAnchor="middle" stroke="none" fill="#18181b" className="text-[11px] font-bold">随访护航</text>
              <text x="580" y="150" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px]">不良反应监控与长期维养</text>
            </svg>
            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>FIG 02.1 · 现代医疗分工拓扑图</span>
              <span className="text-zinc-400">消除孤狼作坊切换损耗 · 释放专业复利</span>
            </div>
          </div>
        );

      case 3:
        // Fig 3: Market Scale vs Specialization Depth
        return (
          <div className="w-full">
            <svg viewBox="0 0 720 220" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
              {/* Axes */}
              <line x1="80" y1="180" x2="660" y2="180" className="stroke-zinc-400" />
              <line x1="80" y1="30" x2="80" y2="180" className="stroke-zinc-400" />
              <polygon points="660,180 652,176 652,184" fill="#71717a" stroke="none" />
              <polygon points="80,30 76,38 84,38" fill="#71717a" stroke="none" />

              <text x="660" y="200" textAnchor="end" stroke="none" fill="#71717a" className="text-[10px] font-mono">市场规模与病例密度 (Market Scale) →</text>
              <text x="70" y="25" textAnchor="start" stroke="none" fill="#71717a" className="text-[10px] font-mono">↑ 专业分工深度 (Specialization Depth)</text>

              {/* Curve */}
              <path d="M 90 170 Q 300 160 630 50" className="stroke-amber-700" strokeWidth="1.5" />

              {/* Point 1: Small Market */}
              <circle cx="180" cy="165" r="4" fill="#18181b" stroke="none" />
              <line x1="180" y1="165" x2="180" y2="180" className="stroke-zinc-300" strokeDasharray="2 2" />
              <text x="180" y="145" textAnchor="middle" stroke="none" fill="#27272a" className="text-[11px] font-bold">县域与三四线市场</text>
              <text x="180" y="125" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px] font-mono">基础维养 · 全科通才</text>

              {/* Point 2: Middle Hub */}
              <circle cx="380" cy="130" r="4" fill="#18181b" stroke="none" />
              <line x1="380" y1="130" x2="380" y2="180" className="stroke-zinc-300" strokeDasharray="2 2" />
              <text x="380" y="110" textAnchor="middle" stroke="none" fill="#27272a" className="text-[11px] font-bold">二线区域中心</text>
              <text x="380" y="90" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px] font-mono">主攻优势大单品</text>

              {/* Point 3: Tier 1 Hub */}
              <circle cx="580" cy="65" r="5" fill="#b45309" stroke="none" />
              <line x1="580" y1="65" x2="580" y2="180" className="stroke-zinc-300" strokeDasharray="2 2" />
              <text x="580" y="45" textAnchor="middle" stroke="none" fill="#b45309" className="text-[11px] font-bold">北上广深成渝超能枢纽</text>
              <text x="580" y="25" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px] font-mono">高难度修复 · 顶尖专精分工</text>
            </svg>
            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>FIG 03.1 · 斯密定理：分工受限于市场广度</span>
              <span className="text-zinc-400">认清生态位 · 莫在浅水湾里造航母</span>
            </div>
          </div>
        );

      case 4:
        // Fig 4: Human Desire & Betterment of Condition Vector
        return (
          <div className="w-full">
            <svg viewBox="0 0 720 200" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
              {/* Three Pillars Comparison */}
              <g transform="translate(60, 20)">
                <rect x="0" y="0" width="170" height="130" className="stroke-zinc-300" />
                <text x="85" y="30" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px] font-mono">INTELLECTUAL</text>
                <text x="85" y="55" textAnchor="middle" stroke="none" fill="#18181b" className="text-xs font-bold">智识与教育投资</text>
                <text x="85" y="85" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px]">对抗认知局限</text>
                <text x="85" y="105" textAnchor="middle" stroke="none" fill="#a1a1aa" className="text-[9px] font-mono">社会普遍赞许</text>
              </g>

              <g transform="translate(275, 20)">
                <rect x="0" y="0" width="170" height="130" className="stroke-zinc-300" />
                <text x="85" y="30" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px] font-mono">PHYSIOLOGICAL</text>
                <text x="85" y="55" textAnchor="middle" stroke="none" fill="#18181b" className="text-xs font-bold">健身与体魄投资</text>
                <text x="85" y="85" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px]">对抗机能衰退</text>
                <text x="85" y="105" textAnchor="middle" stroke="none" fill="#a1a1aa" className="text-[9px] font-mono">自律与生命力表达</text>
              </g>

              <g transform="translate(490, 20)">
                <rect x="0" y="0" width="170" height="130" className="stroke-amber-700" strokeWidth="1" />
                <text x="85" y="30" textAnchor="middle" stroke="none" fill="#b45309" className="text-[10px] font-mono font-bold">AESTHETIC EFFICACY</text>
                <text x="85" y="55" textAnchor="middle" stroke="none" fill="#18181b" className="text-xs font-bold">外在美学自我投资</text>
                <text x="85" y="85" textAnchor="middle" stroke="none" fill="#27272a" className="text-[10px]">对抗衰老与获得自信</text>
                <text x="85" y="105" textAnchor="middle" stroke="none" fill="#b45309" className="text-[9px] font-mono font-bold">改善自身状况的永恒愿望</text>
              </g>

              <line x1="60" y1="170" x2="660" y2="170" className="stroke-zinc-300" />
              <text x="360" y="188" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px] font-mono">
                THE WEALTH OF NATIONS · 从恐吓式焦虑转向正向生命赋能
              </text>
            </svg>
            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>FIG 04.1 · 人性自我改善向量图</span>
              <span className="text-zinc-400">医美本质上是人对生命尊严与掌控感的合理追求</span>
            </div>
          </div>
        );

      case 5:
        // Fig 5: Value vs Cost Decomposition Stack
        return (
          <div className="w-full">
            <svg viewBox="0 0 720 220" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
              {/* 4 Layered horizontal stack */}
              {/* Layer 1: Apex */}
              <rect x="180" y="20" width="360" height="35" className="stroke-amber-700" strokeWidth="1.25" fill="#fafaf9" />
              <text x="360" y="42" textAnchor="middle" stroke="none" fill="#b45309" className="text-[11px] font-bold">
                审美匹配与不出错的极高概率（25%）
              </text>
              <text x="560" y="42" textAnchor="start" stroke="none" fill="#71717a" className="text-[10px] font-mono">→ 审美稀缺溢价</text>

              {/* Layer 2 */}
              <rect x="150" y="60" width="420" height="35" className="stroke-zinc-800" fill="#fafaf9" />
              <text x="360" y="82" textAnchor="middle" stroke="none" fill="#18181b" className="text-[11px] font-bold">
                医生解剖功底、血管规避与实操经验（35%）
              </text>
              <text x="590" y="82" textAnchor="start" stroke="none" fill="#71717a" className="text-[10px] font-mono">→ 人力资本核心</text>

              {/* Layer 3 */}
              <rect x="120" y="100" width="480" height="35" className="stroke-zinc-400" fill="#fafaf9" />
              <text x="360" y="122" textAnchor="middle" stroke="none" fill="#52525b" className="text-[11px]">
                医疗环境、抢救兜底机制与团队保障（25%）
              </text>
              <text x="620" y="122" textAnchor="start" stroke="none" fill="#71717a" className="text-[10px] font-mono">→ 体系风控成本</text>

              {/* Layer 4: Base */}
              <rect x="90" y="140" width="540" height="35" className="stroke-zinc-300" strokeDasharray="3 3" fill="#fafaf9" />
              <text x="360" y="162" textAnchor="middle" stroke="none" fill="#71717a" className="text-[11px]">
                物理耗材与药品出厂成本（10% - 15%）
              </text>
              <text x="645" y="162" textAnchor="start" stroke="none" fill="#a1a1aa" className="text-[10px] font-mono">→ 静态硬件</text>

              {/* Bracket on the left */}
              <path d="M 70 20 L 50 100 L 70 175" className="stroke-zinc-400" />
              <text x="40" y="104" textAnchor="end" stroke="none" fill="#18181b" className="text-[11px] font-bold font-mono">十万消费总值</text>
            </svg>
            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>FIG 05.1 · 医美价值构成与确定性溢价层级</span>
              <span className="text-zinc-400">你买的从来不是透明液体，而是十几年训练出的零事故概率</span>
            </div>
          </div>
        );

      case 6:
        // Fig 6: Bifurcated Market Positioning Matrix
        return (
          <div className="w-full">
            <svg viewBox="0 0 720 220" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
              {/* Dual Pole Continuum */}
              <line x1="60" y1="110" x2="660" y2="110" className="stroke-zinc-300" />

              {/* Left Pole: Standardized Scale */}
              <g transform="translate(60, 30)">
                <rect x="0" y="0" width="220" height="150" className="stroke-zinc-800" fill="#fafaf9" />
                <text x="110" y="28" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px] font-mono font-bold">SCALE & EFFICIENCY POLE</text>
                <text x="110" y="50" textAnchor="middle" stroke="none" fill="#18181b" className="text-xs font-bold">极速标品与标准化轻医美</text>
                <line x1="20" y1="62" x2="200" y2="62" className="stroke-zinc-200" />
                <text x="110" y="82" textAnchor="middle" stroke="none" fill="#52525b" className="text-[10px]">基础光电 / 脱毛 / 补水</text>
                <text x="110" y="102" textAnchor="middle" stroke="none" fill="#52525b" className="text-[10px]">规模效应 · 极度透明 · 低毛利</text>
                <text x="110" y="125" textAnchor="middle" stroke="none" fill="#18181b" className="text-[10px] font-mono font-bold">核心壁垒：单客履约效率</text>
              </g>

              {/* Dead Zone in the Middle */}
              <g transform="translate(300, 55)">
                <rect x="0" y="0" width="120" height="100" className="stroke-zinc-300" strokeDasharray="3 3" />
                <text x="60" y="35" textAnchor="middle" stroke="none" fill="#ef4444" className="text-[10px] font-mono font-bold">THE DEAD ZONE</text>
                <text x="60" y="55" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px] font-bold">模糊地带</text>
                <text x="60" y="78" textAnchor="middle" stroke="none" fill="#a1a1aa" className="text-[9px]">无规模且无技术</text>
              </g>

              {/* Right Pole: Bespoke High-End */}
              <g transform="translate(440, 30)">
                <rect x="0" y="0" width="220" height="150" className="stroke-amber-700" strokeWidth="1.25" fill="#fafaf9" />
                <text x="110" y="28" textAnchor="middle" stroke="none" fill="#b45309" className="text-[10px] font-mono font-bold">BESPOKE & TRUST POLE</text>
                <text x="110" y="50" textAnchor="middle" stroke="none" fill="#18181b" className="text-xs font-bold">高定美学与疑难手术</text>
                <line x1="20" y1="62" x2="200" y2="62" className="stroke-zinc-200" />
                <text x="110" y="82" textAnchor="middle" stroke="none" fill="#52525b" className="text-[10px]">高难度眼鼻 / 气质轮廓定制</text>
                <text x="110" y="102" textAnchor="middle" stroke="none" fill="#52525b" className="text-[10px]">极度稀缺 · 终身信任 · 高溢价</text>
                <text x="110" y="125" textAnchor="middle" stroke="none" fill="#b45309" className="text-[10px] font-mono font-bold">核心壁垒：审美与技术声誉</text>
              </g>
            </svg>
            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>FIG 06.1 · 市场双极分化与生态位坐标</span>
              <span className="text-zinc-400">不要恐惧低价竞争 · 真正致命的是生态位模糊</span>
            </div>
          </div>
        );

      case 7:
        // Fig 7: Variance Reduction via SOP System
        return (
          <div className="w-full">
            <svg viewBox="0 0 720 220" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
              {/* Axes */}
              <line x1="80" y1="180" x2="660" y2="180" className="stroke-zinc-400" />
              <line x1="80" y1="40" x2="80" y2="180" className="stroke-zinc-400" />
              <polygon points="660,180 652,176 652,184" fill="#71717a" stroke="none" />

              <text x="660" y="200" textAnchor="end" stroke="none" fill="#71717a" className="text-[10px] font-mono">医疗交付品质分布 (Quality Outcome) →</text>
              <text x="70" y="35" textAnchor="start" stroke="none" fill="#71717a" className="text-[10px] font-mono">↑ 概率密度</text>

              {/* Unstandardized Curve (Wide variance, dangerous tail) */}
              <path d="M 120 180 Q 250 170 370 100 Q 490 170 620 180" className="stroke-zinc-400" strokeDasharray="4 4" strokeWidth="1" />
              <text x="240" y="120" stroke="none" fill="#71717a" className="text-[10px] font-mono">个体作坊模式（高方差 · 下限危险）</text>

              {/* Standardized SOP Curve (Narrow, tight, high safety floor) */}
              <path d="M 280 180 Q 370 20 460 180" className="stroke-amber-700" strokeWidth="1.5" />
              <text x="470" y="70" stroke="none" fill="#b45309" className="text-[10px] font-bold font-mono">SOP工业化系统（方差归零 · 安全托底）</text>

              {/* Safety Baseline Floor line */}
              <line x1="260" y1="40" x2="260" y2="180" className="stroke-red-500/60" strokeWidth="1" strokeDasharray="2 2" />
              <text x="255" y="170" textAnchor="end" stroke="none" fill="#ef4444" className="text-[9px] font-mono font-bold">行业事故临界线</text>
            </svg>
            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>FIG 07.1 · 医美工业革命：标准化对质量方差的收敛模型</span>
              <span className="text-zinc-400">SOP不是限制名医的艺术 · 而是消灭随机性事故与风险</span>
            </div>
          </div>
        );

      case 8:
        // Fig 8: Full-Cycle Efficiency vs Linear Traffic Funnel
        return (
          <div className="w-full">
            <svg viewBox="0 0 720 220" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
              {/* Top: Broken Linear Funnel */}
              <g transform="translate(60, 20)">
                <text x="0" y="15" stroke="none" fill="#ef4444" className="text-[10px] font-mono font-bold">TRADITIONAL BROKEN FUNNEL (传统投流内卷模型)</text>
                <rect x="0" y="25" width="130" height="40" className="stroke-zinc-300" />
                <text x="65" y="50" textAnchor="middle" stroke="none" fill="#52525b" className="text-[10px]">公域天价买量</text>

                <path d="M 130 45 L 170 45" className="stroke-zinc-300" />
                <polygon points="170,45 164,42 164,48" fill="#a1a1aa" stroke="none" />

                <rect x="170" y="25" width="130" height="40" className="stroke-zinc-300" />
                <text x="235" y="50" textAnchor="middle" stroke="none" fill="#52525b" className="text-[10px]">低价破价引流</text>

                <path d="M 300 45 L 340 45" className="stroke-zinc-300" />
                <polygon points="340,45 334,42 334,48" fill="#a1a1aa" stroke="none" />

                <rect x="340" y="25" width="130" height="40" className="stroke-zinc-300" />
                <text x="405" y="50" textAnchor="middle" stroke="none" fill="#ef4444" className="text-[10px]">单次博弈·零复购</text>

                <path d="M 470 45 L 510 45" className="stroke-zinc-300" />
                <polygon points="510,45 504,42 504,48" fill="#a1a1aa" stroke="none" />

                <text x="520" y="50" stroke="none" fill="#ef4444" className="text-[10px] font-mono">→ 现金流枯竭衰竭</text>
              </g>

              {/* Bottom: Compounding Efficiency Loop */}
              <g transform="translate(60, 110)">
                <text x="0" y="15" stroke="none" fill="#b45309" className="text-[10px] font-mono font-bold">EFFICIENCY COMPOUNDING LOOP (全链路复利效率模型)</text>
                <rect x="0" y="25" width="130" height="45" className="stroke-amber-700" />
                <text x="65" y="45" textAnchor="middle" stroke="none" fill="#18181b" className="text-[10px] font-bold">精准内容筛选</text>
                <text x="65" y="60" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px]">理性高质量客群</text>

                <path d="M 130 47 L 170 47" className="stroke-amber-700" />
                <polygon points="170,47 164,44 164,50" fill="#b45309" stroke="none" />

                <rect x="170" y="25" width="130" height="45" className="stroke-amber-700" />
                <text x="235" y="45" textAnchor="middle" stroke="none" fill="#18181b" className="text-[10px] font-bold">系统化精准交付</text>
                <text x="235" y="60" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px]">超出预期的稳定性</text>

                <path d="M 300 47 L 340 47" className="stroke-amber-700" />
                <polygon points="340,47 334,44 334,50" fill="#b45309" stroke="none" />

                <rect x="340" y="25" width="130" height="45" className="stroke-amber-700" />
                <text x="405" y="45" textAnchor="middle" stroke="none" fill="#b45309" className="text-[10px] font-bold">超长周期复购LTV</text>
                <text x="405" y="60" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px]">自然转介绍与高留存</text>

                {/* Return Loop */}
                <path d="M 405 70 Q 405 95 235 95 Q 65 95 65 70" className="stroke-amber-700/60" strokeDasharray="3 3" />
                <polygon points="65,70 62,76 68,76" fill="#b45309" stroke="none" />
                <text x="235" y="90" textAnchor="middle" stroke="none" fill="#b45309" className="text-[9px] font-mono">获客成本趋近于零 (Self-Sustaining)</text>
              </g>
            </svg>
            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>FIG 08.1 · 全链路效率复利飞轮 vs 单次流量漏斗</span>
              <span className="text-zinc-400">效率不仅是降本 · 更是全生命周期资产的沉淀能力</span>
            </div>
          </div>
        );

      case 9:
        // Fig 9: Longitudinal Facial Asset Lifecycle
        return (
          <div className="w-full">
            <svg viewBox="0 0 720 220" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
              {/* Chronological Timeline */}
              <line x1="60" y1="120" x2="660" y2="120" className="stroke-zinc-300" />

              {/* Era 1 */}
              <g transform="translate(90, 40)">
                <rect x="0" y="0" width="160" height="65" className="stroke-zinc-400" fill="#fafaf9" />
                <text x="80" y="24" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px] font-mono font-bold">AGE 20 - 30</text>
                <text x="80" y="42" textAnchor="middle" stroke="none" fill="#18181b" className="text-[11px] font-bold">屏障稳态与预防维养</text>
                <text x="80" y="56" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px]">抗炎 · 水光 · 基础光子</text>
                <circle cx="80" cy="80" r="4" fill="#18181b" stroke="none" />
                <line x1="80" y1="65" x2="80" y2="80" className="stroke-zinc-400" />
              </g>

              {/* Era 2 */}
              <g transform="translate(280, 40)">
                <rect x="0" y="0" width="160" height="65" className="stroke-amber-700" strokeWidth="1.25" fill="#fafaf9" />
                <text x="80" y="24" textAnchor="middle" stroke="none" fill="#b45309" className="text-[10px] font-mono font-bold">AGE 30 - 45</text>
                <text x="80" y="42" textAnchor="middle" stroke="none" fill="#18181b" className="text-[11px] font-bold">动力平衡与容量管理</text>
                <text x="80" y="56" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px]">微滴注射 · 韧带锚定提升</text>
                <circle cx="80" cy="80" r="4" fill="#b45309" stroke="none" />
                <line x1="80" y1="65" x2="80" y2="80" className="stroke-amber-700" />
              </g>

              {/* Era 3 */}
              <g transform="translate(470, 40)">
                <rect x="0" y="0" width="160" height="65" className="stroke-zinc-800" fill="#fafaf9" />
                <text x="80" y="24" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px] font-mono font-bold">AGE 45+</text>
                <text x="80" y="42" textAnchor="middle" stroke="none" fill="#18181b" className="text-[11px] font-bold">深层结构力学维系</text>
                <text x="80" y="56" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px]">骨膜层支撑 · 全层抗衰</text>
                <circle cx="80" cy="80" r="4" fill="#18181b" stroke="none" />
                <line x1="80" y1="65" x2="80" y2="80" className="stroke-zinc-400" />
              </g>

              {/* Bottom Comparison */}
              <text x="360" y="165" textAnchor="middle" stroke="none" fill="#18181b" className="text-[11px] font-bold">
                游牧式单次消费（馒头脸与组织破坏） vs 长期农耕式资产规划（优雅自然衰老）
              </text>
            </svg>
            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>FIG 09.1 · 全生命周期面部资产管理矩阵</span>
              <span className="text-zinc-400">将每一次医疗干预视作长期美学资本的稳健投资</span>
            </div>
          </div>
        );

      case 10:
        // Fig 10: Invisible Hand & Market Cleansing Dynamics
        return (
          <div className="w-full">
            <svg viewBox="0 0 720 200" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
              {/* Dual Forces */}
              <g transform="translate(80, 30)">
                <rect x="0" y="0" width="240" height="120" className="stroke-zinc-400" strokeDasharray="3 3" />
                <text x="120" y="30" textAnchor="middle" stroke="none" fill="#ef4444" className="text-[10px] font-mono font-bold">GREY & UNREGULATED SECTOR</text>
                <text x="120" y="55" textAnchor="middle" stroke="none" fill="#71717a" className="text-[11px]">水货假货 · 非法行医 · 虚假宣传</text>
                <text x="120" y="85" textAnchor="middle" stroke="none" fill="#ef4444" className="text-[12px] font-bold">加速被合规资本与监管出清</text>
              </g>

              {/* Cleansing Vector Arrow */}
              <path d="M 330 90 L 390 90" className="stroke-zinc-600" strokeWidth="1.25" />
              <polygon points="390,90 382,86 382,94" fill="#52525b" stroke="none" />
              <text x="360" y="80" textAnchor="middle" stroke="none" fill="#b45309" className="text-[9px] font-mono font-bold">看不见的手</text>
              <text x="360" y="110" textAnchor="middle" stroke="none" fill="#71717a" className="text-[9px] font-mono">规范化进程</text>

              <g transform="translate(400, 30)">
                <rect x="0" y="0" width="240" height="120" className="stroke-amber-700" strokeWidth="1.25" fill="#fafaf9" />
                <text x="120" y="30" textAnchor="middle" stroke="none" fill="#b45309" className="text-[10px] font-mono font-bold">INSTITUTIONAL CAPITAL ECOSYSTEM</text>
                <text x="120" y="55" textAnchor="middle" stroke="none" fill="#18181b" className="text-[11px] font-bold">正品溯源 · 循证医学 · 连锁质控</text>
                <text x="120" y="85" textAnchor="middle" stroke="none" fill="#b45309" className="text-[12px] font-bold">行业信任总成本大幅降低</text>
              </g>
            </svg>
            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>FIG 10.1 · 资本引导与市场合规出清动力学</span>
              <span className="text-zinc-400">资本的本质是逐利 · 但在良性机制下成为消除黑医美的最强推手</span>
            </div>
          </div>
        );

      case 11:
        // Fig 11: The Four Pillars of Institutional Intangible Capital
        return (
          <div className="w-full">
            <svg viewBox="0 0 720 220" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
              {/* 4 Quadrants */}
              <line x1="360" y1="20" x2="360" y2="180" className="stroke-zinc-300" />
              <line x1="60" y1="100" x2="660" y2="100" className="stroke-zinc-300" />

              {/* Q1 */}
              <g transform="translate(90, 30)">
                <text x="0" y="15" stroke="none" fill="#b45309" className="text-[10px] font-mono font-bold">PILLAR I · 医疗质控资产</text>
                <text x="0" y="35" stroke="none" fill="#18181b" className="text-[11px] font-bold">沉淀于机构的标准临床知识库与SOP</text>
                <text x="0" y="52" stroke="none" fill="#71717a" className="text-[9px]">不因单个医生流失而瓦解的核心诊疗规范</text>
              </g>

              {/* Q2 */}
              <g transform="translate(390, 30)">
                <text x="0" y="15" stroke="none" fill="#b45309" className="text-[10px] font-mono font-bold">PILLAR II · 客户信任资本</text>
                <text x="0" y="35" stroke="none" fill="#18181b" className="text-[11px] font-bold">高净值客群的长期留存与忠诚复利</text>
                <text x="0" y="52" stroke="none" fill="#71717a" className="text-[9px]">真实口碑沉淀，抵抗公域流量价格战波动</text>
              </g>

              {/* Q3 */}
              <g transform="translate(90, 115)">
                <text x="0" y="15" stroke="none" fill="#b45309" className="text-[10px] font-mono font-bold">PILLAR III · 人才孵化系统</text>
                <text x="0" y="35" stroke="none" fill="#18181b" className="text-[11px] font-bold">梯队化青年医生培养与审美对齐机制</text>
                <text x="0" y="52" stroke="none" fill="#71717a" className="text-[9px]">实现优质医疗生产力的连续自我造血</text>
              </g>

              {/* Q4 */}
              <g transform="translate(390, 115)">
                <text x="0" y="15" stroke="none" fill="#b45309" className="text-[10px] font-mono font-bold">PILLAR IV · 独立品牌心智</text>
                <text x="0" y="35" stroke="none" fill="#18181b" className="text-[11px] font-bold">基于专业价值而非渠道佣金的用户认同</text>
                <text x="0" y="52" stroke="none" fill="#71717a" className="text-[9px]">在资本市场上具备可估值、可交易的商誉</text>
              </g>
            </svg>
            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>FIG 11.1 · 医美机构生产性隐形资产四象限</span>
              <span className="text-zinc-400">收入只是现金流流水 · 唯有沉淀为四大资产才具备终极价值</span>
            </div>
          </div>
        );

      case 12:
        // Fig 12: Triadic Sustainable Ecosystem & Welfare Equilibrium
        return (
          <div className="w-full">
            <svg viewBox="0 0 720 220" className="w-full h-auto stroke-zinc-400 fill-none text-zinc-600 font-sans" strokeWidth="0.75">
              {/* Central Triangle */}
              <polygon points="360,35 180,165 540,165" className="stroke-amber-700/80" strokeWidth="1.25" fill="#fafaf9" />

              {/* Center Heart/Node */}
              <circle cx="360" cy="120" r="6" fill="#b45309" stroke="none" />
              <text x="360" y="105" textAnchor="middle" stroke="none" fill="#b45309" className="text-[10px] font-mono font-bold">SOCIAL WELFARE</text>
              <text x="360" y="140" textAnchor="middle" stroke="none" fill="#18181b" className="text-[11px] font-bold">人的尊严与社会福祉</text>

              {/* Top Vertex: Doctors */}
              <circle cx="360" cy="35" r="16" className="stroke-zinc-800" fill="#fafaf9" />
              <text x="360" y="39" textAnchor="middle" stroke="none" fill="#18181b" className="text-[10px] font-bold">医生</text>
              <text x="360" y="15" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px] font-mono font-semibold">专业尊严与合理回报</text>

              {/* Bottom Left Vertex: Institution */}
              <circle cx="180" cy="165" r="16" className="stroke-zinc-800" fill="#fafaf9" />
              <text x="180" y="169" textAnchor="middle" stroke="none" fill="#18181b" className="text-[10px] font-bold">机构</text>
              <text x="180" y="195" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px] font-mono font-semibold">合规经营与长效复利</text>

              {/* Bottom Right Vertex: Patient */}
              <circle cx="540" cy="165" r="16" className="stroke-zinc-800" fill="#fafaf9" />
              <text x="540" y="169" textAnchor="middle" stroke="none" fill="#18181b" className="text-[10px] font-bold">求美者</text>
              <text x="540" y="195" textAnchor="middle" stroke="none" fill="#71717a" className="text-[10px] font-mono font-semibold">美学自由与心理赋能</text>
            </svg>
            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>FIG 12.1 · 医美产业三元可持续价值平衡</span>
              <span className="text-zinc-400">大潮退去 · 真正创造社会价值的体系才是永恒财富</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Content Switcher
  const renderCurrentDiagram = () => {
    switch (currentTab) {
      case 'division-table':
        return renderDivisionTable();
      case 'value-pie':
        return renderValuePieChart();
      case 'efficiency-trend':
        return renderEfficiencyTrendChart();
      case 'episode':
      default:
        return renderDiagram();
    }
  };

  const tabs: { key: DiagramTabKey; label: string; badge?: string }[] = [
    { key: 'episode', label: '本篇专题图谱', badge: `EP.${String(articleId).padStart(2, '0')}` },
    { key: 'division-table', label: '分工演进表', badge: '组织演化' },
    { key: 'value-pie', label: '价值构成极简饼图', badge: '价值解构' },
    { key: 'efficiency-trend', label: '线性效率趋势图', badge: '复利曲线' },
  ];

  return (
    <div id={`article-diagram-${articleId}`} className="w-full my-6 sm:my-8 p-3.5 sm:p-6 lg:p-8 bg-transparent border border-zinc-200/90 dark:border-zinc-800 rounded-2xl transition-all">
      {/* Schematic Header & Segmented Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-zinc-200/80 dark:border-zinc-800 pb-3 sm:pb-4 mb-4 sm:mb-5">
        <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-700"></div>
            <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-zinc-900 dark:text-zinc-100 uppercase font-bold">
              ECONOMIC SCHEMATIC / 极简产业图谱
            </span>
          </div>

          <button
            onClick={handleEnlargeDiagram}
            className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-stone-100 dark:bg-zinc-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-zinc-700 dark:text-zinc-200 hover:text-amber-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] sm:text-[11px] font-mono transition-all cursor-pointer shadow-2xs"
            title="放大查看高清图谱"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>点击放大</span>
          </button>
        </div>
        
        {/* Minimalist Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-nowrap -mx-1 px-1 pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-mono rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] sm:text-[10px] px-1 py-0.2 rounded font-sans ${
                    isActive ? 'bg-amber-600 text-white' : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vector Drawing Container (Strictly restrained, thin strokes, no solid background fill) */}
      <div 
        className="w-full overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 group relative cursor-zoom-in active:opacity-95 touch-manipulation select-none"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleEnlargeDiagram();
        }}
        title="点击放大查看高清矢量图谱"
      >
        <div className="min-w-[560px] sm:min-w-0 transition-transform group-hover:scale-[1.008]">
          {renderCurrentDiagram()}
        </div>
      </div>
      <div 
        className="sm:hidden flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-400 pt-2 pb-1 px-1 border-t border-zinc-200/80 dark:border-zinc-800/80 cursor-pointer active:bg-amber-500/10 rounded"
        onClick={(e) => {
          e.stopPropagation();
          handleEnlargeDiagram();
        }}
      >
        <span>👈 左右滑动探索图谱细节</span>
        <span className="text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1">
          <Maximize2 className="w-3 h-3" />
          <span>点击放大图谱</span>
        </span>
      </div>
    </div>
  );
}
