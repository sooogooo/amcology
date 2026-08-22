export interface ConceptItem {
  id: string;
  term: string;
  aliases: string[];
  pinyin?: string;
  category: 'smith' | 'industry' | 'operation' | 'modern';
  categoryLabel: string;
  definition: string;
  articleId: number;
  articleTitle: string;
  targetSection: string;
  snippet: string;
  keyTakeaway: string;
}

export const economicConcepts: ConceptItem[] = [
  {
    id: 'division-of-labor',
    term: '分工深化 (Division of Labor)',
    aliases: ['分工', '专业化分工', '分工深化', '劳动分工'],
    category: 'smith',
    categoryLabel: '斯密经典理论',
    definition: '将复杂复合工作拆解为标准化独立工序，通过技能专精熟练、减少环节转换耗损以及促进专用工具与SOP工具化，实现产出几何级倍增。',
    articleId: 2,
    articleTitle: '医美产业经济学 02 为什么说医美的“标准化”，不仅可能，而且必须？',
    targetSection: '02 读斯密 为什么分工能创造奇迹？',
    snippet: '斯密在《国富论》开篇指出制针工场的奇迹：单一工匠一天难造20枚针，而10人分工协作日产48000枚。',
    keyTakeaway: '在轻医美中，分工让面诊归审美、实操归医师、随访归系统，将单室日周转率提升2-3倍并消灭质量方差。'
  },
  {
    id: 'diminishing-returns',
    term: '边际收益递减 (Diminishing Marginal Returns)',
    aliases: ['边际收益', '边际收益递减', '边际递减', '边际效应'],
    category: 'industry',
    categoryLabel: '产业与商业模式',
    definition: '在技术水平和其他生产要素固定不变的前提下，连续追加某种单一要素投入（如公域买量预算），所获得的新增产出与边际利润最终逐步下降。',
    articleId: 10,
    articleTitle: '医美产业经济学 10 获客成本越来越高，医美机构该如何破局？',
    targetSection: '01 引子 公域流量红利的终结',
    snippet: '买量单价翻倍、首单过度破价、二回率极低，单靠公域买量投放必将撞上严峻的边际收益递减墙。',
    keyTakeaway: '机构必须从“公域一次性买量消耗”转向“私域存量运营与LTV复利飞轮”，打破边际枯竭。'
  },
  {
    id: 'lemons-market',
    term: '柠檬市场与逆向淘汰 (The Market for Lemons)',
    aliases: ['柠檬市场', '逆向淘汰', '劣币驱逐良币', '信息不对称'],
    category: 'modern',
    categoryLabel: '现代信息经济学',
    definition: '阿克洛夫提出的信息经济学经典模型：当买方无法准确甄别商品真实品质时，只愿支付平均价，导致高品质良品亏本退出，劣品充斥市场。',
    articleId: 4,
    articleTitle: '医美产业经济学 04 为什么99元的光子嫩肤，毁掉了整个行业？',
    targetSection: '02 看行业 99元背后的“柠檬市场”陷阱',
    snippet: '超低价团购的背后是偷减发数、降低能量、缩水时长，实质交付低效伪品，反噬了求美者对正品机构的信任。',
    keyTakeaway: '良币机构必须建立不可伪造的履约信用信号（如正品验真、参数记录透明化、医生直诊），穿透信息黑箱。'
  },
  {
    id: 'transaction-cost',
    term: '交易费用与企业边界 (Transaction Cost)',
    aliases: ['交易费用', '交易成本', '科斯定理', '企业边界'],
    category: 'modern',
    categoryLabel: '新制度经济学',
    definition: '罗纳德·科斯提出：市场交易并非零成本，包含搜寻、谈判、履约和监督成本。企业的本质是通过内部科层组织替代外部市场来节约交易费用。',
    articleId: 8,
    articleTitle: '医美产业经济学 08 医美机构的核心资产究竟是什么？',
    targetSection: '02 读斯密 固定资本与人力资本',
    snippet: '机构在自建供应链、外包投流、医生合伙人制之间的权衡，本质上都是在组织内部管理成本与外部市场交易费用之间寻找边际均衡。',
    keyTakeaway: '通过标准化 SOP 和合伙人利益捆绑，降低医患及医管之间的内部博弈成本，是机构做大的核心前提。'
  },
  {
    id: 'invisible-hand',
    term: '看不见的手与自利机制 (The Invisible Hand)',
    aliases: ['看不见的手', '自利机制', '自利', '价格机制'],
    category: 'smith',
    categoryLabel: '斯密经典理论',
    definition: '市场主体出于对自身长远利益的追求，在健全法治与信誉约束下，通过价格信号自由协作，客观上极大促进了社会整体福祉。',
    articleId: 6,
    articleTitle: '医美产业经济学 06 为什么“过度营销”的机构，最终一定会被反噬？',
    targetSection: '02 读斯密 “看不见的手”背后的道德基石',
    snippet: '斯密在《道德情操论》与《国富论》中反复强调：唯有在同理心、正义与声誉约束下的自利交换，才能形成繁荣自循环。',
    keyTakeaway: '过度营销收割客户属于破坏性短视博弈，坚守医疗本质积累终身信任资产，才是最理性的自利。'
  },
  {
    id: 'opportunity-cost',
    term: '机会成本 (Opportunity Cost)',
    aliases: ['机会成本', '次优选择'],
    category: 'modern',
    categoryLabel: '微观经济学',
    definition: '为了选择某种资源配置方案而放弃的所有其他方案中，所能带来的最大潜在收益或价值。',
    articleId: 3,
    articleTitle: '医美产业经济学 03 医生IP与机构品牌：一场关于“生产要素”的博弈',
    targetSection: '03 看行业 名医与平台的生产要素博弈',
    snippet: '高阶资深医生如果把时间全部耗费在低客单走量项目上，实质上牺牲了打磨高难度术式与建立学术壁垒的巨大机会成本。',
    keyTakeaway: '机构应根据医生的生产力禀赋分层配置：资深主诊攻克高价值方案，标准化助理承接基础流程，实现机会成本最小化。'
  },
  {
    id: 'conspicuous-consumption',
    term: '炫耀性消费与信号发送 (Conspicuous Consumption)',
    aliases: ['炫耀性消费', '凡勃伦效应', '信号发送', '身份认同'],
    category: 'modern',
    categoryLabel: '制度与行为经济学',
    definition: '托斯丹·凡勃伦提出：消费者购买高价非生活必需品，不仅为了物理使用价值，更是为了向社会群体发送自身财富、品味与阶层地位的可靠信号。',
    articleId: 9,
    articleTitle: '医美产业经济学 09 十万级消费背后：高净值客群究竟在买什么？',
    targetSection: '02 读斯密 必需品、便利品与奢侈品',
    snippet: '十万级抗衰求美者买的从来不是几毫升药剂，而是审美设计认同、尊荣私密交付以及社交圈层的美学辨识度。',
    keyTakeaway: '高客单业务切忌陷入“算药剂成本”的工程师思维，必须构建审美心智、情绪共鸣与高确定性交付。'
  },
  {
    id: 'marginal-utility',
    term: '边际效用 (Marginal Utility)',
    aliases: ['边际效用', '效用递减', '边际价值'],
    category: 'modern',
    categoryLabel: '边际效用学派',
    definition: '消费者多消费一单位商品或服务所获得的额外心理满足程度。长期来看，决定商品市场价值的是边际效用而非历史沉没成本。',
    articleId: 7,
    articleTitle: '医美产业经济学 07 价格战的尽头：医美会变成下一个“快消品”吗？',
    targetSection: '03 看行业 破局价格战的三维重构',
    snippet: '基础光电给求美者带来的初次边际效用极高，随着体验常态化，必须通过联合疗程与定制方案唤醒新的边际满足。',
    keyTakeaway: '产品研发必须围绕用户痛点的递进升级（从基础补水到轮廓重塑到情绪抗衰）设计梯次方案。'
  },
  {
    id: 'total-factor-productivity',
    term: '全要素生产率 (Total Factor Productivity, TFP)',
    aliases: ['全要素生产率', 'TFP', '生产率提升'],
    category: 'industry',
    categoryLabel: '宏观经济与增长',
    definition: '除了资本和劳动单纯数量堆砌之外，由技术进步、流程组织创新、管理效率与专业化制度演进带来的综合生产力增长率。',
    articleId: 5,
    articleTitle: '医美产业经济学 05 从“作坊”到“工业化”：轻医美连锁的生产力革命',
    targetSection: '02 读斯密 从单兵作坊到工业化协作',
    snippet: '单纯招募更多咨询师和医生已进入边际报酬递减，唯有引入智能化光电诊疗排程与SOP知识系统，才能引爆TFP。',
    keyTakeaway: '轻医美未来的盈利分水岭不取决于门店面积，而取决于单平米坪效与单医生时效的全要素生产率。'
  },
  {
    id: 'reputation-capital',
    term: '信誉资产与声誉抵押 (Reputation Capital)',
    aliases: ['信誉资产', '声誉抵押', '声誉机制', '品牌护城河'],
    category: 'modern',
    categoryLabel: '契约理论',
    definition: '在重复博弈中建立的不可伪造的诚信记录。声誉是企业在信息不对称市场中向客户质押的无形担保品。',
    articleId: 8,
    articleTitle: '医美产业经济学 08 医美机构的核心资产究竟是什么？',
    targetSection: '04 实践指南 打造机构的内生复利飞轮',
    snippet: '建立声誉需要十年如一日的合规履约，而毁掉它只需一次事故。合规声誉是抵御低价内卷最宽的护城河。',
    keyTakeaway: '机构最大的无形资本是医疗底线与零事故口碑，它是降低新客搜寻门槛并支撑客单溢价的核心抵押。'
  },
  {
    id: 'quality-variance',
    term: '质量方差趋零 (Zero Quality Variance)',
    aliases: ['质量方差', '交付方差', '方差收敛', '标准化质控'],
    category: 'operation',
    categoryLabel: '运营与质控',
    definition: '衡量医疗与审美交付结果偏离标准预期的离散程度。高方差意味着高医疗事故率与客诉纠纷，方差收敛是规模化复制的前提。',
    articleId: 2,
    articleTitle: '医美产业经济学 02 为什么说医美的“标准化”，不仅可能，而且必须？',
    targetSection: '03 看行业 把“非标”拆解成标准模块',
    snippet: '医美的非标在审美沟通，但交付流程必须标准。把医生情绪与手感变成精准注量和严密解剖层次。',
    keyTakeaway: '依靠 SOP 与双核把关，将医疗事故率与审美纠纷方差无限压缩趋零。'
  },
  {
    id: 'intangible-capital',
    term: '无形资产积累 (Intangible Capital Accumulation)',
    aliases: ['无形资产', '资本积累', '固定资本', '知识资产'],
    category: 'smith',
    categoryLabel: '斯密资本理论',
    definition: '沉淀在机构组织内部的 SOP 知识库、梯队造血机制、品牌美誉度与终身客户信任，非单一医生可以带走的资产。',
    articleId: 8,
    articleTitle: '医美产业经济学 08 医美机构的核心资产究竟是什么？',
    targetSection: '02 读斯密 固定资本与人力资本',
    snippet: '仪器会折旧，针剂是原料，唯有组织体系、知识资产与客群信任才是跨越周期的真正固定资本。',
    keyTakeaway: '摆脱“名医单飞带走全店客流”的脆弱作坊结构，打造机构品牌护城河。'
  },
  {
    id: 'ltv-cac-flywheel',
    term: 'LTV/CAC 飞轮模型 (LTV/CAC Flywheel)',
    aliases: ['LTV', 'CAC', 'LTV/CAC', '客户生命周期价值', '获客成本'],
    category: 'operation',
    categoryLabel: '运营与质控',
    definition: '客户全生命周期价值 (LTV) 与单客获取成本 (CAC) 的动态比率，决定了机构现金流造血能力与长期企业价值。',
    articleId: 10,
    articleTitle: '医美产业经济学 10 获客成本越来越高，医美机构该如何破局？',
    targetSection: '03 看行业 从单次买量到全生命周期价值 (LTV)',
    snippet: '当转介绍率突破临界点，新客获取成本急剧下降，LTV/CAC 比值突破 3:1 进入健康内生增长。',
    keyTakeaway: '深耕存量复购与审美心智升级，让每一位满意客户成为自带流量的裂变节点。'
  },
  {
    id: 'value-anatomy',
    term: '医美真实价值解构 (Value Anatomy)',
    aliases: ['价值构成', '价值拆解', '医美价值构成', '确定性溢价'],
    category: 'industry',
    categoryLabel: '产业与商业模式',
    definition: '十万医美消费并非购买耗材原料，而是购买医生实操解剖资本(35%)、审美对齐确定性(25%)、院感风控(25%)与硬件折旧(15%)。',
    articleId: 1,
    articleTitle: '医美产业经济学 01 为什么只卖项目的机构，注定会被淘汰？',
    targetSection: '04 消费启示 你买的不是一根针，而是确定性',
    snippet: '你支付的费用不是1ml透明凝胶，而是医生避开血管的解剖精度、十年临床训练与机构应急风控底线。',
    keyTakeaway: '消费者买的是“零事故交付的确定性”，机构卖的是美学生产系统。'
  },
  {
    id: 'market-clearing',
    term: '市场出清与合规重估 (Market Clearing)',
    aliases: ['市场出清', '合规出清', '行业出清', '自然淘汰'],
    category: 'smith',
    categoryLabel: '斯密经典理论',
    definition: '当行业供给过剩、价格战恶化至极限时，监管收紧与消费者成熟加速淘汰劣质作坊，合规优质产能重获定价权。',
    articleId: 12,
    articleTitle: '医美产业经济学 12 行业终局与未来十年的产业重构',
    targetSection: '03 看行业 从草莽野蛮到合规出清',
    snippet: '优胜劣汰的自然法则下，黑医美与单次收割型机构迅速出清，行业进入高质量分工成熟期。',
    keyTakeaway: '大洗牌并非寒冬，而是合规优质机构以极低成本接管优质市场份额的历史机遇。'
  }
];
