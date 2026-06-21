const fs = require('fs');
const path = require('path');
const crypto = require('node:crypto');
const root = process.cwd();
const walk = dir => {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(p));
    } else {
      results.push(p);
    }
  }
  return results;
};
const files = walk(root).filter(f => ['.js','.html','.css','.md'].includes(path.extname(f)));
const hm = {};
files.forEach(f => {
  const data = fs.readFileSync(f);
  const h = crypto.createHash('sha256').update(data).digest('hex');
  const key = h + ':' + data.length;
  if (!hm[key]) hm[key] = [];
  hm[key].push(f);
});
let out = '=== Exact duplicate files ===\n';
Object.entries(hm).forEach(([k, ps]) => {
  if (ps.length > 1) {
    const len = k.split(':')[1];
    out += `---- ${len} bytes ${ps.length} files\n`;
    ps.forEach(p => { out += `  ${p}\n`; });
  }
});
out += '\n=== Potential duplicate JS function blocks ===\n';
const blocks = {};
files.filter(f => path.extname(f) === '.js' && !f.includes(`${path.sep}vendor${path.sep}`)).forEach(f => {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  for (let i = 0; i < lines.length - 5; i++) {
    const block = lines.slice(i, i + 6).join('\n').trim();
    if (block) {
      blocks[block] = (blocks[block] || 0) + 1;
    }
  }
});
Object.entries(blocks).sort((a,b) => b[1]-a[1]).slice(0,30).forEach(([block,count]) => {
  if (count > 1) {
    out += `COUNT ${count}\n`;
    out += block.replace(/\n/g, ' | ').slice(0,400) + '\n---\n';
  }
});
fs.writeFileSync('duplicate_report.txt', out);
