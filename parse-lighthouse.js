const fs = require('fs');

const report = JSON.parse(fs.readFileSync('./lighthouse-localhost.json', 'utf8'));
const categories = report.categories;

console.log('\n=== Lighthouse Scores (localhost:3001) ===\n');
Object.keys(categories).forEach(key => {
  const score = Math.round(categories[key].score * 100);
  const title = categories[key].title;
  const emoji = score >= 90 ? '✅' : score >= 50 ? '⚠️' : '❌';
  console.log(`${emoji} ${title}: ${score}/100`);
});
console.log('\n');
