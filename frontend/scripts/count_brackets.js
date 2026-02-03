import fs from 'fs';
const s = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
const counts = { '(': 0, ')': 0, '{': 0, '}': 0, '[': 0, ']': 0 };
for (const ch of s) { if (Object.prototype.hasOwnProperty.call(counts, ch)) counts[ch]++; }
console.log(counts);
