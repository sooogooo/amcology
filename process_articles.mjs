import fs from 'fs';
import { articles } from './src/data/articles.ts';

function cleanText(text) {
  if (!text) return text;
  let s = text;

  // 1. Remove em-dashes / dashes
  s = s.replace(/——/g, ' ');
  s = s.replace(/—/g, ' ');
  s = s.replace(/--/g, ' ');

  // 2. Remove colons in titles / module names / headings
  s = s.replace(/：/g, '，');
  s = s.replace(/:/g, ' ');

  // 3. Clean up double quotes on general terms
  const termsToUnquote = [
    '大润发', '超市化', '全能名医', '超级团队', '手工作坊', '现代工业化',
    '重商主义', '美学生产系统', '暴利', '改善经济学', '效率之战', '工业革命',
    '打一针', '管一生', '门口的野蛮人', '核心资产', '神医', '打工医生',
    '买商品', '原材料', '生产工具', '安全感', '好结果', '系统交付结果',
    '护城河', '割韭菜', '降维打击', '馒头脸', '拼图脸', '黑医美', '交钥匙',
    '自来水', '蓄水池', '过路客', '看门人', '野蛮人', '门票', '生产能力',
    '制针工厂', '看不见的手', '消费升级', '容貌焦虑', '重资产', '轻资产',
    '流量池', '漏斗', '私域', '公域', '合规', '美学生产力', '高定'
  ];

  for (const term of termsToUnquote) {
    s = s.replaceAll(`“${term}”`, term);
    s = s.replaceAll(`"${term}"`, term);
    s = s.replaceAll(`'${term}'`, term);
    s = s.replaceAll(`‘${term}’`, term);
  }

  // Replace any remaining English quotes with Chinese full width quotes if balanced
  s = s.replace(/"([^"]+)"/g, '“$1”');
  s = s.replace(/'([^']+)'/g, '“$1”');

  return s;
}

// Process articles
const processed = articles.map(art => {
  let title = art.title;
  // Clean title: remove colons, quotes, dashes
  title = title.replace(/：/g, ' ');
  title = title.replace(/:/g, ' ');
  title = title.replace(/——/g, ' ');
  title = title.replace(/[“”"']/g, '');
  title = title.replace(/\s+/g, ' ').trim();

  let quote = art.quote;
  quote = quote.replace(/：/g, '，');
  quote = quote.replace(/:/g, ' ');
  quote = quote.replace(/——/g, ' ');
  quote = quote.replace(/[‘'’“”"]/g, ''); // quotes in key thought not needed, clean elegant text
  quote = quote.trim();

  let moduleName = art.moduleName.replace(/：/g, ' ').replace(/:/g, ' ').replace(/[“”"']/g, '');
  let moduleDesc = art.moduleDesc.replace(/：/g, ' ').replace(/:/g, ' ').replace(/[“”"']/g, '');

  const sections = art.sections.map(sec => {
    let heading = sec.heading;
    heading = heading.replace(/：/g, ' ');
    heading = heading.replace(/:/g, ' ');
    heading = heading.replace(/——/g, ' ');
    heading = heading.replace(/[“”"']/g, '');
    heading = heading.replace(/\s+/g, ' ').trim();

    const paragraphs = sec.paragraphs.map(p => {
      let cleaned = p;
      // Replace dashes
      cleaned = cleaned.replace(/——/g, '，');
      cleaned = cleaned.replace(/—/g, '，');

      // Specific colon replacements in common flow
      cleaned = cleaned.replace(/发现了几个核心痛点：/g, '发现了几个核心痛点。');
      cleaned = cleaned.replace(/原因很简单：/g, '原因很简单，');
      cleaned = cleaned.replace(/原因有三：/g, '主要有三个原因。');
      cleaned = cleaned.replace(/斯密指出：/g, '斯密指出，');
      cleaned = cleaned.replace(/斯密告诉我们：/g, '斯密告诉我们，');
      cleaned = cleaned.replace(/洞见：/g, '洞见，');
      cleaned = cleaned.replace(/结论是：/g, '结论是，');
      cleaned = cleaned.replace(/本质是：/g, '本质是，');
      cleaned = cleaned.replace(/发现：/g, '发现，');
      cleaned = cleaned.replace(/其实买的并不是那1ml的透明液体，你买的是：/g, '其实买的并不是那1ml的透明液体，而是包括以下维度：');
      cleaned = cleaned.replace(/第一推动力：/g, '第一推动力是');
      cleaned = cleaned.replace(/三个维度：/g, '三个维度。');
      cleaned = cleaned.replace(/核心逻辑：/g, '核心逻辑在于，');
      cleaned = cleaned.replace(/启示：/g, '启示在于，');
      cleaned = cleaned.replace(/：/g, '，'); // replace any other colons with commas
      cleaned = cleaned.replace(/:/g, ' ');

      // Clean unneeded quotes
      cleaned = cleanText(cleaned);

      return cleaned;
    });

    return {
      heading,
      paragraphs
    };
  });

  return {
    id: art.id,
    moduleName,
    moduleDesc,
    title,
    quote,
    sections
  };
});

const fileContent = `export interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

export interface Article {
  id: number;
  moduleName: string;
  moduleDesc: string;
  title: string;
  quote: string;
  sections: ArticleSection[];
}

export const articles: Article[] = ${JSON.stringify(processed, null, 2)};
`;

fs.writeFileSync('src/data/articles.ts', fileContent, 'utf8');
console.log('Successfully updated src/data/articles.ts!');
