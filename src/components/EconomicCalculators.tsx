import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, ShieldAlert, Sparkles, RefreshCw, BarChart3, HelpCircle, Layers, Sliders, ArrowRight, Activity, Lock, Unlock, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { performanceMonitor } from '../utils/performanceMonitor';

export type CalculatorTab = 'ltv' | 'valueDeconstruct';

export interface TimelineDataPoint {
  period: string;
  '单次买量模式 (万元)': number;
  '分工SOP模式 (万元)': number;
  label: string;
  yearIndex: number;
  cumulativeGrossA: number; // 万元
  cumulativeGrossB: number; // 万元
  grossDelta: number; // 万元
  valuationIncrement: number; // 万元
  valuationMultipleDelta: string;
  cohortLtvA: number; // 单客累计LTV (元)
  cohortLtvB: number; // 单客累计LTV (元)
  stageNote: string;
}

export function EconomicCalculators() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('ltv');
  const [lockedPoint, setLockedPoint] = useState<TimelineDataPoint | null>(null);
  const [lastCalculationTimeMs, setLastCalculationTimeMs] = useState<number>(0.8);

  // ==========================================
  // 1. CAC / LTV & Retention Calculator State
  // ==========================================
  const [cac, setCac] = useState<number>(1200); // 单客获客成本 (元)
  const [firstOrderProfit, setFirstOrderProfit] = useState<number>(600); // 首单贡献毛利 (元)
  const [repeatRate, setRepeatRate] = useState<number>(35); // 复购留存率 (%)
  const [annualVisits, setAnnualVisits] = useState<number>(2.4); // 年均到院频次 (次/年)
  const [repeatOrderProfit, setRepeatOrderProfit] = useState<number>(1800); // 每次复购平均贡献毛利 (元)
  const [cohortSize, setCohortSize] = useState<number>(1000); // 每月新增客群基数 (人)

  // Simulation calculations: 3-Year Cashflow & Enterprise Valuation
  const ltvSimulation = useMemo(() => {
    const startTime = performance.now();
    // Mode A: 单次投流买量模式 (低留存、高流失、依赖持续买量)
    // Mode B: 分工SOP与信任沉淀模式 (高留存口碑、交付方差收敛)
    const months = 36; // 3年36个月
    
    // Mode A (Buy-traffic) parameters
    const modeA_Retention = Math.min(repeatRate * 0.4, 18) / 100; // 留存迅速衰减
    const modeA_ProfitPerVisit = firstOrderProfit * 0.9;
    const modeA_CAC = cac * 1.15; // 随流量成本上涨

    // Mode B (SOP & Trust) parameters (用户输入基准)
    const modeB_Retention = repeatRate / 100;
    const modeB_ProfitPerVisit = repeatOrderProfit;
    const modeB_CAC = cac;

    let modeA_CumulativeCashflow = 0;
    let modeB_CumulativeCashflow = 0;

    const yearlyData = [
      { year: '第1年 (Year 1)', modeA_Cashflow: 0, modeB_Cashflow: 0, modeA_LTV: 0, modeB_LTV: 0 },
      { year: '第2年 (Year 2)', modeA_Cashflow: 0, modeB_Cashflow: 0, modeA_LTV: 0, modeB_LTV: 0 },
      { year: '第3年 (Year 3)', modeA_Cashflow: 0, modeB_Cashflow: 0, modeA_LTV: 0, modeB_LTV: 0 },
    ];

    // Single Customer 3-Year Cumulative LTV & LTV/CAC ratio
    // LTV = 首单毛利 + (复购率^t * 年频次 * 单次复购毛利)
    let singleModeA_LTV = firstOrderProfit;
    let singleModeB_LTV = firstOrderProfit;

    for (let y = 1; y <= 3; y++) {
      const modeA_YearVisits = annualVisits * Math.pow(modeA_Retention, y - 1);
      const modeB_YearVisits = annualVisits * Math.pow(modeB_Retention, y - 1);

      singleModeA_LTV += modeA_YearVisits * modeA_ProfitPerVisit;
      singleModeB_LTV += modeB_YearVisits * modeB_ProfitPerVisit;

      // Institutional Cohort cashflow (Cohort of cohortSize entering per year)
      const institutionalA_AnnualNet = (cohortSize * singleModeA_LTV) - (cohortSize * modeA_CAC);
      const institutionalB_AnnualNet = (cohortSize * singleModeB_LTV) - (cohortSize * modeB_CAC);

      modeA_CumulativeCashflow += institutionalA_AnnualNet;
      modeB_CumulativeCashflow += institutionalB_AnnualNet;

      yearlyData[y - 1].modeA_Cashflow = Math.round(modeA_CumulativeCashflow / 10000);
      yearlyData[y - 1].modeB_Cashflow = Math.round(modeB_CumulativeCashflow / 10000);
      yearlyData[y - 1].modeA_LTV = Math.round(singleModeA_LTV);
      yearlyData[y - 1].modeB_LTV = Math.round(singleModeB_LTV);
    }

    // High resolution 36-month timeline points for Recharts smooth curve with rich financial metrics
    const initialInvestment = Math.round(-(cohortSize * cac) / 10000);
    const timelineData: TimelineDataPoint[] = [
      { 
        period: '初始投入', 
        '单次买量模式 (万元)': initialInvestment, 
        '分工SOP模式 (万元)': initialInvestment, 
        label: 'M0',
        yearIndex: 0,
        cumulativeGrossA: 0,
        cumulativeGrossB: 0,
        grossDelta: 0,
        valuationIncrement: 0,
        valuationMultipleDelta: '0x',
        cohortLtvA: Math.round(firstOrderProfit),
        cohortLtvB: Math.round(firstOrderProfit),
        stageNote: '首期获客投流与设备折旧前置成本注入阶段'
      },
      { 
        period: '第6个月', 
        '单次买量模式 (万元)': Math.round((yearlyData[0].modeA_Cashflow * 0.45)), 
        '分工SOP模式 (万元)': Math.round((yearlyData[0].modeB_Cashflow * 0.4)), 
        label: 'M6',
        yearIndex: 0.5,
        cumulativeGrossA: Math.max(0, Math.round(yearlyData[0].modeA_Cashflow * 0.55)),
        cumulativeGrossB: Math.max(0, Math.round(yearlyData[0].modeB_Cashflow * 0.6)),
        grossDelta: Math.round(yearlyData[0].modeB_Cashflow * 0.6 - yearlyData[0].modeA_Cashflow * 0.55),
        valuationIncrement: Math.round(Math.max(0, (yearlyData[0].modeB_Cashflow * 0.4 - yearlyData[0].modeA_Cashflow * 0.45) * 6)),
        valuationMultipleDelta: '1.5x ~ 2.0x',
        cohortLtvA: Math.round(firstOrderProfit * 1.2),
        cohortLtvB: Math.round(firstOrderProfit * 1.4),
        stageNote: '初次复购启动期，标准化机构开始显现患者信任留存'
      },
      { 
        period: '第1年末', 
        '单次买量模式 (万元)': yearlyData[0].modeA_Cashflow, 
        '分工SOP模式 (万元)': yearlyData[0].modeB_Cashflow, 
        label: 'Y1',
        yearIndex: 1,
        cumulativeGrossA: Math.round(yearlyData[0].modeA_Cashflow + Math.abs(initialInvestment)),
        cumulativeGrossB: Math.round(yearlyData[0].modeB_Cashflow + Math.abs(initialInvestment)),
        grossDelta: Math.round(yearlyData[0].modeB_Cashflow - yearlyData[0].modeA_Cashflow),
        valuationIncrement: Math.max(0, Math.round((yearlyData[0].modeB_Cashflow - yearlyData[0].modeA_Cashflow) * 7)),
        valuationMultipleDelta: '2.0x ~ 2.5x',
        cohortLtvA: yearlyData[0].modeA_LTV,
        cohortLtvB: yearlyData[0].modeB_LTV,
        stageNote: '第1年结算点：SOP分工机制实现盈亏平衡加速转正'
      },
      { 
        period: '第18个月', 
        '单次买量模式 (万元)': Math.round(yearlyData[0].modeA_Cashflow * 0.35 + yearlyData[1].modeA_Cashflow * 0.65), 
        '分工SOP模式 (万元)': Math.round(yearlyData[0].modeB_Cashflow * 0.35 + yearlyData[1].modeB_Cashflow * 0.65), 
        label: 'M18',
        yearIndex: 1.5,
        cumulativeGrossA: Math.round((yearlyData[0].modeA_Cashflow + yearlyData[1].modeA_Cashflow) * 0.5 + Math.abs(initialInvestment)),
        cumulativeGrossB: Math.round((yearlyData[0].modeB_Cashflow + yearlyData[1].modeB_Cashflow) * 0.5 + Math.abs(initialInvestment)),
        grossDelta: Math.round(((yearlyData[0].modeB_Cashflow + yearlyData[1].modeB_Cashflow) - (yearlyData[0].modeA_Cashflow + yearlyData[1].modeA_Cashflow)) * 0.5),
        valuationIncrement: Math.max(0, Math.round(((yearlyData[1].modeB_Cashflow - yearlyData[1].modeA_Cashflow) * 8.5))),
        valuationMultipleDelta: '2.5x ~ 3.2x',
        cohortLtvA: Math.round((yearlyData[0].modeA_LTV + yearlyData[1].modeA_LTV) / 2),
        cohortLtvB: Math.round((yearlyData[0].modeB_LTV + yearlyData[1].modeB_LTV) / 2),
        stageNote: '第二波复购周期，单次买量模式因获客成本上升收益收窄'
      },
      { 
        period: '第2年末', 
        '单次买量模式 (万元)': yearlyData[1].modeA_Cashflow, 
        '分工SOP模式 (万元)': yearlyData[1].modeB_Cashflow, 
        label: 'Y2',
        yearIndex: 2,
        cumulativeGrossA: Math.round(yearlyData[1].modeA_Cashflow + Math.abs(initialInvestment)),
        cumulativeGrossB: Math.round(yearlyData[1].modeB_Cashflow + Math.abs(initialInvestment)),
        grossDelta: Math.round(yearlyData[1].modeB_Cashflow - yearlyData[1].modeA_Cashflow),
        valuationIncrement: Math.max(0, Math.round((yearlyData[1].modeB_Cashflow - yearlyData[1].modeA_Cashflow) * 10)),
        valuationMultipleDelta: '3.0x ~ 3.8x',
        cohortLtvA: yearlyData[1].modeA_LTV,
        cohortLtvB: yearlyData[1].modeB_LTV,
        stageNote: '第2年分水岭：机构资产化溢价与复利剪刀差全面扩大'
      },
      { 
        period: '第30个月', 
        '单次买量模式 (万元)': Math.round(yearlyData[1].modeA_Cashflow * 0.3 + yearlyData[2].modeA_Cashflow * 0.7), 
        '分工SOP模式 (万元)': Math.round(yearlyData[1].modeB_Cashflow * 0.3 + yearlyData[2].modeB_Cashflow * 0.7), 
        label: 'M30',
        yearIndex: 2.5,
        cumulativeGrossA: Math.round((yearlyData[1].modeA_Cashflow + yearlyData[2].modeA_Cashflow) * 0.5 + Math.abs(initialInvestment)),
        cumulativeGrossB: Math.round((yearlyData[1].modeB_Cashflow + yearlyData[2].modeB_Cashflow) * 0.5 + Math.abs(initialInvestment)),
        grossDelta: Math.round(((yearlyData[1].modeB_Cashflow + yearlyData[2].modeB_Cashflow) - (yearlyData[1].modeA_Cashflow + yearlyData[2].modeA_Cashflow)) * 0.5),
        valuationIncrement: Math.max(0, Math.round(((yearlyData[2].modeB_Cashflow - yearlyData[2].modeA_Cashflow) * 12))),
        valuationMultipleDelta: '3.5x ~ 4.0x',
        cohortLtvA: Math.round((yearlyData[1].modeA_LTV + yearlyData[2].modeA_LTV) / 2),
        cohortLtvB: Math.round((yearlyData[1].modeB_LTV + yearlyData[2].modeB_LTV) / 2),
        stageNote: '转介绍与品牌私域自闭环，自然到院占比提升至35%+'
      },
      { 
        period: '第3年末', 
        '单次买量模式 (万元)': yearlyData[2].modeA_Cashflow, 
        '分工SOP模式 (万元)': yearlyData[2].modeB_Cashflow, 
        label: 'Y3',
        yearIndex: 3,
        cumulativeGrossA: Math.round(yearlyData[2].modeA_Cashflow + Math.abs(initialInvestment)),
        cumulativeGrossB: Math.round(yearlyData[2].modeB_Cashflow + Math.abs(initialInvestment)),
        grossDelta: Math.round(yearlyData[2].modeB_Cashflow - yearlyData[2].modeA_Cashflow),
        valuationIncrement: Math.max(0, Math.round((yearlyData[2].modeB_Cashflow * 14) - (yearlyData[2].modeA_Cashflow * 5))),
        valuationMultipleDelta: '3.8x ~ 4.5x',
        cohortLtvA: yearlyData[2].modeA_LTV,
        cohortLtvB: yearlyData[2].modeB_LTV,
        stageNote: '3年终局对比：平台型连锁享有14-18倍PE，买量型受困于边际收益递减'
      },
    ];

    const modeA_LtvCacRatio = (singleModeA_LTV / modeA_CAC).toFixed(2);
    const modeB_LtvCacRatio = (singleModeB_LTV / modeB_CAC).toFixed(2);

    // Valuation: PE multiple (Buy traffic: 4x-6x, SOP Trust platform: 12x-18x)
    const modeA_Valuation = Math.max(0, Math.round((yearlyData[2].modeA_Cashflow - yearlyData[1].modeA_Cashflow) * 5));
    const modeB_Valuation = Math.max(0, Math.round((yearlyData[2].modeB_Cashflow - yearlyData[1].modeB_Cashflow) * 14));

    const duration = performance.now() - startTime;
    performanceMonitor.logInteraction('CALCULATOR_SIMULATION_UPDATE', duration, {
      cac,
      repeatRate,
      cohortSize
    });

    return {
      singleModeA_LTV: Math.round(singleModeA_LTV),
      singleModeB_LTV: Math.round(singleModeB_LTV),
      modeA_LtvCacRatio,
      modeB_LtvCacRatio,
      yearlyData,
      timelineData,
      modeA_Valuation,
      modeB_Valuation,
      modeA_CumulativeCashflow: Math.round(modeA_CumulativeCashflow / 10000),
      modeB_CumulativeCashflow: Math.round(modeB_CumulativeCashflow / 10000),
      calcDurationMs: Math.max(0.1, duration),
    };
  }, [cac, firstOrderProfit, repeatRate, annualVisits, repeatOrderProfit, cohortSize]);

  useEffect(() => {
    if (ltvSimulation?.calcDurationMs) {
      setLastCalculationTimeMs(ltvSimulation.calcDurationMs);
    }
  }, [ltvSimulation]);

  // ==========================================
  // 2. 100k-Level Aesthetic Value Deconstruction
  // ==========================================
  const [totalPrice, setTotalPrice] = useState<number>(100000); // 10万级项目总价 (元)
  const [doctorSkillRatio, setDoctorSkillRatio] = useState<number>(35); // 医生临床解剖与实操人力资本 (%)
  const [aestheticRatio, setAestheticRatio] = useState<number>(25); // 审美设计与对齐溢价 (%)
  const [safetyRiskRatio, setSafetyRiskRatio] = useState<number>(25); // 院感风控与安全兜底 (%)
  const [materialRatio, setMaterialRatio] = useState<number>(15); // 物理药械与耗材硬件 (%)

  // Normalize ratios to 100% total if needed
  const normalizedValue = useMemo(() => {
    const sum = doctorSkillRatio + aestheticRatio + safetyRiskRatio + materialRatio;
    const factor = sum > 0 ? 100 / sum : 1;

    const doctorAmt = Math.round((totalPrice * (doctorSkillRatio * factor)) / 100);
    const aestheticAmt = Math.round((totalPrice * (aestheticRatio * factor)) / 100);
    const safetyAmt = Math.round((totalPrice * (safetyRiskRatio * factor)) / 100);
    const materialAmt = Math.round(totalPrice - doctorAmt - aestheticAmt - safetyAmt);

    return {
      sum,
      doctor: { pct: (doctorSkillRatio * factor).toFixed(1), amount: doctorAmt },
      aesthetic: { pct: (aestheticRatio * factor).toFixed(1), amount: aestheticAmt },
      safety: { pct: (safetyRiskRatio * factor).toFixed(1), amount: safetyAmt },
      material: { pct: (materialRatio * factor).toFixed(1), amount: materialAmt },
    };
  }, [totalPrice, doctorSkillRatio, aestheticRatio, safetyRiskRatio, materialRatio]);

  // Quick Presets
  const applyPreset = (preset: 'standard' | 'lowPriceTrap' | 'masterSurgeon') => {
    if (preset === 'standard') {
      setDoctorSkillRatio(35);
      setAestheticRatio(25);
      setSafetyRiskRatio(25);
      setMaterialRatio(15);
    } else if (preset === 'lowPriceTrap') {
      setDoctorSkillRatio(10);
      setAestheticRatio(5);
      setSafetyRiskRatio(5);
      setMaterialRatio(80);
    } else if (preset === 'masterSurgeon') {
      setDoctorSkillRatio(45);
      setAestheticRatio(30);
      setSafetyRiskRatio(20);
      setMaterialRatio(5);
    }
  };

  return (
    <section 
      id="economic-calculators" 
      className="my-8 sm:my-14 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 shadow-2xs transition-all"
    >
      {/* Header Badge & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5 sm:pb-6 mb-6 sm:mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-800 dark:text-amber-400 text-[10px] sm:text-xs font-mono font-bold rounded-full">
              <Calculator className="w-3.5 h-3.5" />
              <span>INTERACTIVE ECONOMIC CALCULATOR</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono rounded-md border border-emerald-500/20">
              <Zap className="w-2.5 h-2.5" />
              <span>推演响应: {lastCalculationTimeMs.toFixed(1)}ms</span>
            </div>
          </div>
          <h2 className="text-lg sm:text-2xl font-serif font-black text-zinc-900 dark:text-zinc-100">
            医美产业分析与商业测算器
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            将《国富论》分工演进与价值拆解模型工具化，支持滑动控件实时平滑过渡推演。
          </p>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="grid grid-cols-2 sm:flex items-center p-1 bg-stone-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl sm:rounded-2xl w-full sm:w-auto">
          <button
            id="tab-ltv-btn"
            onClick={() => setActiveTab('ltv')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ltv'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>LTV 复利测算</span>
          </button>

          <button
            id="tab-deconstruct-btn"
            onClick={() => setActiveTab('valueDeconstruct')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'valueDeconstruct'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>十万级价值解构</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODULE 1: CAC / LTV & RETENTION COMPOUNDING CALCULATOR                    */}
      {/* ========================================================================= */}
      {activeTab === 'ltv' && (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
          {/* Controls & Inputs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            
            {/* Left Column: Parameter Sliders */}
            <div className="lg:col-span-5 space-y-5 sm:space-y-6 bg-stone-50/80 dark:bg-zinc-850/60 p-4 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                  经营参数输入 / INPUTS
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-mono">实时动态推演</span>
              </div>

              {/* 1. CAC */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">单客获客成本 (CAC)</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">¥ {cac.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="4000"
                  step="50"
                  value={cac}
                  onChange={(e) => setCac(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>¥200 (私域口碑)</span>
                  <span>¥4,000 (高竞价公域)</span>
                </div>
              </div>

              {/* 2. 首单贡献毛利 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">首单贡献毛利</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">¥ {firstOrderProfit.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={firstOrderProfit}
                  onChange={(e) => setFirstOrderProfit(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>¥0 (引流破冰)</span>
                  <span>¥3,000 (高客单初诊)</span>
                </div>
              </div>

              {/* 3. 复购留存率 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">年度复购留存率 (%)</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{repeatRate} %</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="1"
                  value={repeatRate}
                  onChange={(e) => setRepeatRate(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>5% (单次买量流失)</span>
                  <span>80% (SOP全周期信任)</span>
                </div>
              </div>

              {/* 4. 年均到院频次 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">留存客年均到院频次</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{annualVisits} 次/年</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.2"
                  value={annualVisits}
                  onChange={(e) => setAnnualVisits(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>1.0 次 (年终低频)</span>
                  <span>6.0 次 (轻医美高频维养)</span>
                </div>
              </div>

              {/* 5. 每次复购平均贡献毛利 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">复购平均客单毛利</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">¥ {repeatOrderProfit.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="6000"
                  step="100"
                  value={repeatOrderProfit}
                  onChange={(e) => setRepeatOrderProfit(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>¥500 (基础光电)</span>
                  <span>¥6,000 (综合联合抗衰)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Comparative Analytical Dashboard */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              
              {/* Dual Model KPI Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Model A: 单次买量投流模式 */}
                <div className="p-5 bg-stone-100/70 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>单次买量模式 (重度买量)</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">单客3年 LTV</span>
                    <p className="text-2xl font-serif font-black text-zinc-800 dark:text-zinc-200 font-mono">
                      ¥ {ltvSimulation.singleModeA_LTV.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-200 dark:border-zinc-700">
                    <span className="text-zinc-500">LTV / CAC 比率</span>
                    <span className={`font-mono font-bold ${Number(ltvSimulation.modeA_LtvCacRatio) < 1 ? 'text-rose-600' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {ltvSimulation.modeA_LtvCacRatio}x
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    特征：获客即巅峰，缺乏SOP与品质沉淀，第二年客户几乎流失殆尽。
                  </p>
                </div>

                {/* Model B: 分工SOP与信任沉淀模式 */}
                <div className="p-5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-600/30 dark:border-amber-500/30 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 text-xs font-mono font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>分工 SOP 与信任沉淀模式</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-mono">单客3年 LTV (复利)</span>
                    <p className="text-2xl font-serif font-black text-amber-900 dark:text-amber-200 font-mono">
                      ¥ {ltvSimulation.singleModeB_LTV.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-600/20">
                    <span className="text-amber-800 dark:text-amber-400">LTV / CAC 比率</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {ltvSimulation.modeB_LtvCacRatio}x
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-tight">
                    特征：标准化交付收敛方差，口碑驱动长效复购，形成护城河。
                  </p>
                </div>

              </div>

              {/* 3-Year Institutional Cashflow & Value Growth Chart (Recharts) */}
              <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <h3 className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      3年机构累计净现金流推演对比曲线
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">单位：万元 (按千人客群)</span>
                </div>

                {/* Recharts Curve Component */}
                <div className="h-68 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={ltvSimulation.timelineData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      onClick={(e: any) => {
                        if (e && e.activePayload && e.activePayload.length > 0) {
                          const payloadData = e.activePayload[0].payload as TimelineDataPoint;
                          if (lockedPoint && lockedPoint.period === payloadData.period) {
                            setLockedPoint(null); // click again to unlock
                          } else {
                            setLockedPoint(payloadData);
                          }
                        }
                      }}
                    >
                      <defs>
                        <linearGradient id="sopGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#71717a" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#71717a" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.5} vertical={false} />
                      <XAxis 
                        dataKey="period" 
                        stroke="#a1a1aa" 
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#e4e4e7' }}
                      />
                      <YAxis 
                        stroke="#a1a1aa" 
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `¥${v}w`}
                      />
                      
                      {/* Enhanced Custom Data Detail Bubble Tooltip */}
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const point = payload[0].payload as TimelineDataPoint;
                          const isCurrentlyLocked = lockedPoint?.period === point.period;

                          return (
                            <div className="bg-zinc-950/95 dark:bg-black/95 text-zinc-100 border border-zinc-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-xs text-xs space-y-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                              {/* Header: Timeline Period & Lock Status */}
                              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                                <div className="flex items-center gap-1.5 font-mono">
                                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                  <span className="font-bold text-amber-400 text-sm">{point.period}</span>
                                  <span className="text-[10px] text-zinc-400 font-normal">({point.label})</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                  {isCurrentlyLocked ? (
                                    <span className="flex items-center gap-0.5 text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">
                                      <Lock className="w-2.5 h-2.5" /> 已锁定
                                    </span>
                                  ) : (
                                    <span className="text-zinc-500">点击锁定</span>
                                  )}
                                </div>
                              </div>

                              {/* Core Metrics: Cumulative Net Cashflow Forecast */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    SOP复利模式现金流预测:
                                  </span>
                                  <span className="font-mono font-bold text-amber-300">
                                    ¥{point['分工SOP模式 (万元)']} 万元
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
                                    单次买量模式现金流预测:
                                  </span>
                                  <span className="font-mono font-bold text-zinc-300">
                                    ¥{point['单次买量模式 (万元)']} 万元
                                  </span>
                                </div>

                                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                                  <span className="text-emerald-400 font-bold">现金流剪刀差 (超额留存):</span>
                                  <span className="font-mono font-bold text-emerald-400">
                                    +¥{point.grossDelta} 万元
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
                                  <span>单客累计生命周期 LTV:</span>
                                  <span className="font-mono text-amber-200">¥{point.cohortLtvB.toLocaleString()}</span>
                                </div>
                              </div>

                              {/* Valuation Increment Indicator */}
                              <div className="bg-zinc-900/90 rounded-xl p-2 border border-zinc-800 text-[11px] space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-zinc-400">对应机构估值增量:</span>
                                  <span className="font-mono font-bold text-amber-400">
                                    +{point.valuationIncrement > 0 ? `¥${point.valuationIncrement}万` : '持平'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                                  <span>估值倍数溢价:</span>
                                  <span className="font-mono text-zinc-300">{point.valuationMultipleDelta}</span>
                                </div>
                              </div>

                              {/* Stage Theoretical Note */}
                              <p className="text-[10px] text-zinc-400 italic leading-snug border-t border-zinc-800/80 pt-1.5">
                                💡 {point.stageNote}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        align="right" 
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="分工SOP模式 (万元)"
                        stroke="#b45309"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#sopGradient)"
                        name="分工SOP与信任模式 (复利增长)"
                        isAnimationActive={true}
                        animationDuration={650}
                        animationEasing="ease-out"
                        activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2, className: 'cursor-pointer' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="单次买量模式 (万元)"
                        stroke="#71717a"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fillOpacity={1}
                        fill="url(#trafficGradient)"
                        name="单次投流买量模式 (流失停滞)"
                        isAnimationActive={true}
                        animationDuration={650}
                        animationEasing="ease-out"
                        activeDot={{ r: 5, fill: '#a1a1aa', stroke: '#fff', strokeWidth: 1.5, className: 'cursor-pointer' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Click-to-Lock Comparison Sticky Details Card */}
                {lockedPoint && (
                  <div className="p-4 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-600/40 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-amber-600 text-white rounded-lg">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200 font-mono">
                          已锁定对比点：{lockedPoint.period}（{lockedPoint.label}）
                        </span>
                      </div>

                      <button
                        onClick={() => setLockedPoint(null)}
                        className="text-[11px] flex items-center gap-1 font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                      >
                        <Unlock className="w-3 h-3" />
                        <span>解锁自由悬停</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                      <div className="bg-white/80 dark:bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700">
                        <div className="text-[10px] text-zinc-400 font-sans">分工SOP累计毛利</div>
                        <div className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                          ¥{lockedPoint['分工SOP模式 (万元)']} 万元
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">单客LTV: ¥{lockedPoint.cohortLtvB}</div>
                      </div>

                      <div className="bg-white/80 dark:bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700">
                        <div className="text-[10px] text-zinc-400 font-sans">单次买量累计毛利</div>
                        <div className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mt-0.5">
                          ¥{lockedPoint['单次买量模式 (万元)']} 万元
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">单客LTV: ¥{lockedPoint.cohortLtvA}</div>
                      </div>

                      <div className="bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <div className="text-[10px] text-emerald-800 dark:text-emerald-400 font-sans font-bold">机构估值增量</div>
                        <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                          +{lockedPoint.valuationIncrement > 0 ? `¥${lockedPoint.valuationIncrement}万` : '0万'}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">溢价乘数: {lockedPoint.valuationMultipleDelta}</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans bg-white/50 dark:bg-zinc-900/50 p-2 rounded-lg">
                      <strong>时期洞察：</strong>{lockedPoint.stageNote}
                    </div>
                  </div>
                )}

                {/* 3-Year Enterprise Valuation Delta */}
                <div className="mt-2 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50 dark:bg-zinc-850 p-3.5 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-400">资本市场估值差异 (PE Multiple)</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-500">单次买量型: ¥{ltvSimulation.modeA_Valuation}万</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-sm font-serif font-black text-amber-700 dark:text-amber-400">
                        SOP信任型: ¥{ltvSimulation.modeB_Valuation}万
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    估值乘数差异：约 2.8x ~ 4.2x
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 2: 100K-LEVEL AESTHETIC VALUE DECONSTRUCTION SIMULATOR             */}
      {/* ========================================================================= */}
      {activeTab === 'valueDeconstruct' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Sliders & Preset Profiles */}
            <div className="lg:col-span-5 space-y-6 bg-stone-50/80 dark:bg-zinc-850/60 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                  价值要素自定义 / SLIDERS
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  权重和: {normalizedValue.sum}%
                </span>
              </div>

              {/* Total Project Price */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">项目整体标价 (元)</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">¥ {totalPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="300000"
                  step="5000"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>¥5,000 (入门轻项目)</span>
                  <span>¥300,000 (高定大综合)</span>
                </div>
              </div>

              {/* Slider 1: 医生技术溢价 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    医生解剖与实操人力资本
                  </span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{doctorSkillRatio}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="70"
                  step="1"
                  value={doctorSkillRatio}
                  onChange={(e) => setDoctorSkillRatio(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: 审美设计 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    审美设计与对齐确定性
                  </span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{aestheticRatio}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={aestheticRatio}
                  onChange={(e) => setAestheticRatio(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Slider 3: 院感风控与安全兜底 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zinc-600 dark:bg-zinc-400"></span>
                    院感风控与安全兜底
                  </span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{safetyRiskRatio}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={safetyRiskRatio}
                  onChange={(e) => setSafetyRiskRatio(Number(e.target.value))}
                  className="w-full accent-zinc-500 cursor-pointer"
                />
              </div>

              {/* Slider 4: 药械耗材 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-stone-400"></span>
                    物理药械与耗材硬件
                  </span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{materialRatio}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="1"
                  value={materialRatio}
                  onChange={(e) => setMaterialRatio(Number(e.target.value))}
                  className="w-full accent-stone-400 cursor-pointer"
                />
              </div>

              {/* Quick Presets */}
              <div className="pt-2">
                <p className="text-[11px] text-zinc-400 mb-2 font-mono uppercase">典型行业画像预设：</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyPreset('standard')}
                    className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
                  >
                    国富论黄金比例 (35/25/25/15)
                  </button>
                  <button
                    onClick={() => applyPreset('lowPriceTrap')}
                    className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg text-rose-700 dark:text-rose-400 font-medium transition-colors cursor-pointer"
                  >
                    低价引流陷阱 (耗材80%)
                  </button>
                  <button
                    onClick={() => applyPreset('masterSurgeon')}
                    className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg text-amber-800 dark:text-amber-400 font-medium transition-colors cursor-pointer"
                  >
                    大师高定手术 (人力75%)
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Minimalist Value Structure Diagram */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              
              {/* Value Structure Card */}
              <div className="p-6 bg-stone-50 dark:bg-zinc-850/60 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      项目价值结构细线拆解 / VALUE DECONSTRUCTION
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      总预算：<span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">¥ {totalPrice.toLocaleString()}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/10 text-amber-800 dark:text-amber-400 rounded-full font-bold">
                    SYSTEM VALUE
                  </span>
                </div>

                {/* Minimalist Multi-color Segmented Bar */}
                <div className="space-y-2">
                  <div className="h-5 w-full bg-stone-200 dark:bg-zinc-800 rounded-lg overflow-hidden flex shadow-inner">
                    <div 
                      className="h-full bg-amber-700 transition-all duration-300"
                      style={{ width: `${normalizedValue.doctor.pct}%` }}
                      title={`医生实操人力资本: ${normalizedValue.doctor.pct}%`}
                    />
                    <div 
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${normalizedValue.aesthetic.pct}%` }}
                      title={`审美设计溢价: ${normalizedValue.aesthetic.pct}%`}
                    />
                    <div 
                      className="h-full bg-zinc-600 dark:bg-zinc-400 transition-all duration-300"
                      style={{ width: `${normalizedValue.safety.pct}%` }}
                      title={`院感风控体系: ${normalizedValue.safety.pct}%`}
                    />
                    <div 
                      className="h-full bg-stone-400 dark:bg-zinc-600 transition-all duration-300"
                      style={{ width: `${normalizedValue.material.pct}%` }}
                      title={`物理耗材硬件: ${normalizedValue.material.pct}%`}
                    />
                  </div>

                  {/* Top Bar Percentage Labels */}
                  <div className="grid grid-cols-4 gap-1 text-[11px] font-mono text-zinc-500 text-center">
                    <span className="truncate text-amber-800 dark:text-amber-400">{normalizedValue.doctor.pct}% 医生</span>
                    <span className="truncate text-amber-700 dark:text-amber-300">{normalizedValue.aesthetic.pct}% 审美</span>
                    <span className="truncate text-zinc-700 dark:text-zinc-300">{normalizedValue.safety.pct}% 风控</span>
                    <span className="truncate text-stone-500">{normalizedValue.material.pct}% 耗材</span>
                  </div>
                </div>

                {/* 4 Fine-line Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  
                  {/* Card 1: 医生实操人力 */}
                  <div className="p-3.5 bg-white dark:bg-zinc-900 border-l-3 border-l-amber-700 border-y border-r border-zinc-200 dark:border-zinc-800 rounded-r-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">医生解剖与实操人力</span>
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{normalizedValue.doctor.pct}%</span>
                    </div>
                    <p className="text-base font-serif font-black text-zinc-900 dark:text-zinc-100 font-mono">
                      ¥ {normalizedValue.doctor.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      对应解剖层次规避血管风险与组织张力控制。
                    </p>
                  </div>

                  {/* Card 2: 审美设计 */}
                  <div className="p-3.5 bg-white dark:bg-zinc-900 border-l-3 border-l-amber-500 border-y border-r border-zinc-200 dark:border-zinc-800 rounded-r-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">审美设计与对齐溢价</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-300">{normalizedValue.aesthetic.pct}%</span>
                    </div>
                    <p className="text-base font-serif font-black text-zinc-900 dark:text-zinc-100 font-mono">
                      ¥ {normalizedValue.aesthetic.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      千人千面动态折叠度与骨相折射率匹配。
                    </p>
                  </div>

                  {/* Card 3: 院感风控 */}
                  <div className="p-3.5 bg-white dark:bg-zinc-900 border-l-3 border-l-zinc-600 dark:border-l-zinc-400 border-y border-r border-zinc-200 dark:border-zinc-800 rounded-r-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">院感风控与安全兜底</span>
                      <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{normalizedValue.safety.pct}%</span>
                    </div>
                    <p className="text-base font-serif font-black text-zinc-900 dark:text-zinc-100 font-mono">
                      ¥ {normalizedValue.safety.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      百级层流、应急溶解酶系统与术后随访SOP。
                    </p>
                  </div>

                  {/* Card 4: 耗材硬件 */}
                  <div className="p-3.5 bg-white dark:bg-zinc-900 border-l-3 border-l-stone-400 border-y border-r border-zinc-200 dark:border-zinc-800 rounded-r-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">物理药械与耗材硬件</span>
                      <span className="font-mono font-bold text-stone-600 dark:text-zinc-400">{normalizedValue.material.pct}%</span>
                    </div>
                    <p className="text-base font-serif font-black text-zinc-900 dark:text-zinc-100 font-mono">
                      ¥ {normalizedValue.material.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      正品药械扫码追溯、冷链仓储与仪器损耗。
                    </p>
                  </div>

                </div>

                {/* Insight Quote Footer */}
                <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-600/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-serif italic">
                  “你以为你买的是那一根玻尿酸，其实你在买一个不出错的系统；当材料占比超过 50% 时，该项目本质上已沦为缺少医疗交付保障的标品倒卖。”
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}
