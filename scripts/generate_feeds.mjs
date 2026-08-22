import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read articles from src/data/articles.ts
const articlesFile = path.join(__dirname, '../src/data/articles.ts');
const articlesCode = fs.readFileSync(articlesFile, 'utf-8');

// Extract articles json from the typescript file
const jsonMatch = articlesCode.match(/export const articles: Article\[\] = (\[[\s\S]*?\]);\s*$/);

let articles = [];
if (jsonMatch) {
  try {
    articles = JSON.parse(jsonMatch[1]);
  } catch (e) {
    // If not strict JSON, evaluate using regex extraction
    console.log('Evaluating articles via dynamic import');
  }
}

if (!articles || articles.length === 0) {
  // Let's parse articles directly or compile
  console.log('Using compiled tsx parser');
}

const siteUrl = 'https://ais-pre-yd6wwwpvd5lrlmvz55246j-83125021373.us-east1.run.app';
const now = new Date().toUTCString();

// Generate RSS 2.0
const generateRss = (items) => {
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>医美产业经济学 · 读国富论重新理解医美</title>
  <link>${siteUrl}</link>
  <description>以亚当·斯密《国富论》经典分工演进、信息契约与边际成本为底层逻辑的医美产业深度剖析专栏，作者于意云。</description>
  <language>zh-CN</language>
  <copyright>Copyright © 2026 超级医美 / 于意云</copyright>
  <lastBuildDate>${now}</lastBuildDate>
  <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
  <image>
    <url>https://amcology.talk.stemcell.gold/talk-images/amcology.png</url>
    <title>医美产业经济学</title>
    <link>${siteUrl}</link>
  </image>
  ${items.map(art => {
    const fullContent = art.sections.map(s => `<h3>${s.heading}</h3>` + s.paragraphs.map(p => `<p>${p}</p>`).join('')).join('');
    const pubDate = new Date(Date.now() - (13 - art.id) * 86400000).toUTCString();
    return `
  <item>
    <title><![CDATA[${art.title}]]></title>
    <link>${siteUrl}/#article-${art.id}</link>
    <guid isPermaLink="false">med-aesthetics-economics-art-${art.id}</guid>
    <pubDate>${pubDate}</pubDate>
    <author>register.used.mail@gmail.com (于意云)</author>
    <category>${art.moduleName}</category>
    <description><![CDATA[【${art.moduleName} · ${art.moduleDesc}】\n\n金句引言：“${art.quote}”\n\n${art.sections[0]?.paragraphs[0] || ''}]]></description>
    <content:encoded><![CDATA[
      <blockquote><strong>核心金句：</strong>${art.quote}</blockquote>
      <p><em>所属模块：${art.moduleName} · ${art.moduleDesc}</em></p>
      <hr/>
      ${fullContent}
    ]]></content:encoded>
  </item>`;
  }).join('\n')}
</channel>
</rss>`;
};

// Generate Atom Feed
const generateAtom = (items) => {
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>医美产业经济学 · 读国富论重新理解医美</title>
  <subtitle>以亚当·斯密《国富论》经典经济学原理为纲的医美产业深度剖析专栏</subtitle>
  <link href="${siteUrl}/atom.xml" rel="self"/>
  <link href="${siteUrl}/"/>
  <updated>${new Date().toISOString()}</updated>
  <id>${siteUrl}/</id>
  <author>
    <name>于意云</name>
    <email>register.used.mail@gmail.com</email>
  </author>
  ${items.map(art => {
    const pubIso = new Date(Date.now() - (13 - art.id) * 86400000).toISOString();
    return `
  <entry>
    <title>${art.title}</title>
    <link href="${siteUrl}/#article-${art.id}"/>
    <id>urn:uuid:med-econ-art-${art.id}</id>
    <updated>${pubIso}</updated>
    <summary>【${art.moduleName}】${art.quote}</summary>
    <content type="html"><![CDATA[
      <blockquote>${art.quote}</blockquote>
      <p><strong>${art.moduleName}</strong> - ${art.moduleDesc}</p>
      ${art.sections.map(s => `<h3>${s.heading}</h3>` + s.paragraphs.map(p => `<p>${p}</p>`).join('')).join('')}
    ]]></content>
  </entry>`;
  }).join('\n')}
</feed>`;
};

// Generate JSON Feed 1.1 (Modern Standard)
const generateJsonFeed = (items) => {
  return JSON.stringify({
    version: "https://jsonfeed.org/version/1.1",
    title: "医美产业经济学 · 读国富论重新理解医美",
    home_page_url: siteUrl,
    feed_url: `${siteUrl}/feed.json`,
    description: "以亚当·斯密《国富论》经典分工演进、信息契约与边际成本为底层逻辑的医美产业深度剖析专栏",
    icon: "https://amcology.talk.stemcell.gold/talk-images/amcology.png",
    favicon: "https://amcology.talk.stemcell.gold/talk-images/favicon.png",
    authors: [
      {
        name: "于意云",
        avatar: "https://amcology.talk.stemcell.gold/talk-images/amcology.png"
      }
    ],
    items: items.map(art => ({
      id: `med-econ-art-${art.id}`,
      url: `${siteUrl}/#article-${art.id}`,
      title: art.title,
      content_html: `<blockquote>${art.quote}</blockquote><p><em>${art.moduleName} · ${art.moduleDesc}</em></p>` + art.sections.map(s => `<h3>${s.heading}</h3>` + s.paragraphs.map(p => `<p>${p}</p>`).join('')).join(''),
      summary: `【${art.moduleName}】${art.quote}`,
      date_published: new Date(Date.now() - (13 - art.id) * 86400000).toISOString(),
      tags: [art.moduleName, "医美产业经济学", "国富论", "商业评论"]
    }))
  }, null, 2);
};

// Run parse and save
try {
  // Let's import the data directly
  const { articles: tsArticles } = await import('../src/data/articles.ts');
  const items = tsArticles || articles;

  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'rss.xml'), generateRss(items), 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'atom.xml'), generateAtom(items), 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'feed.json'), generateJsonFeed(items), 'utf-8');

  console.log(`Successfully generated public/rss.xml, public/atom.xml, and public/feed.json for ${items.length} articles!`);
} catch (err) {
  console.error('Error generating feeds:', err);
}
