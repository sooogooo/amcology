const fs = require('fs');
let content = fs.readFileSync('./src/data/articles.ts', 'utf8');

// 1. Titles and Subtitles
// Replace colons in module names, titles, and headings
content = content.replace(/moduleName: "(.*?)：(.*?)"/g, 'moduleName: "$1 $2"');
content = content.replace(/moduleName: "(.*?) —— (.*?)"/g, 'moduleName: "$1 $2"');
content = content.replace(/title: "(.*?)：(.*?)"/g, 'title: "$1 $2"');
content = content.replace(/heading: "(.*?)[：:](.*?)"/g, 'heading: "$1 $2"');
content = content.replace(/heading: "(.*?)——(.*?)"/g, 'heading: "$1 $2"');

// 2. Remove quotes from headings
content = content.replace(/heading: "(.*?)“(.*?)”(.*?)"/g, 'heading: "$1$2$3"');
content = content.replace(/heading: "(.*?)“(.*?)”(.*?)"/g, 'heading: "$1$2$3"'); // run twice in case of multiple

// 3. Remove dashes
content = content.replace(/——/g, ' ');

// 4. Minimize colons in paragraph starts (e.g. "经营启示：") -> "经营启示 "
// Actually, let's keep them if they are in normal text, but the prompt says "尽量减少冒号的使用".
// Let's replace "： " or "：" after a short prefix at the beginning of a paragraph with a space if it's acting as a subtitle.
content = content.replace(/'(.*?)：(.*?)'/g, (match, p1, p2) => {
  if (p1.length < 15 && !p1.includes('。') && !p1.includes('，')) {
    return `'${p1} ${p2}'`;
  }
  return match;
});

// 5. Enforce full-width quotes if used
content = content.replace(/"/g, '"'); // standard json/ts quotes remain
content = content.replace(/“/g, '“');
content = content.replace(/”/g, '”');

fs.writeFileSync('./src/data/articles.ts', content, 'utf8');
console.log('Replacements done!');
