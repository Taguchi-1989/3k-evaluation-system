const fs = require('fs');

console.log('\n=== Lighthouse Scores Comparison ===\n');

// Homepage
const report1 = JSON.parse(fs.readFileSync('./lighthouse-localhost.json', 'utf8'));
console.log('📄 Homepage (/)');
Object.keys(report1.categories).forEach(key => {
  const score = Math.round(report1.categories[key].score * 100);
  const title = report1.categories[key].title;
  const emoji = score >= 90 ? '✅' : score >= 50 ? '⚠️' : '❌';
  console.log(`   ${emoji} ${title}: ${score}/100`);
});

// Dashboard
const report2 = JSON.parse(fs.readFileSync('./lighthouse-dashboard.json', 'utf8'));
console.log('\n📊 Dashboard (/dashboard)');
Object.keys(report2.categories).forEach(key => {
  const score = Math.round(report2.categories[key].score * 100);
  const title = report2.categories[key].title;
  const emoji = score >= 90 ? '✅' : score >= 50 ? '⚠️' : '❌';
  console.log(`   ${emoji} ${title}: ${score}/100`);
});

console.log('\n');
