const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/DashboardClient.tsx',
  'src/app/entry/EntryForm.tsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix invalid classes caused by previous replacements
  content = content.replace(/dark:bg-slate-800\/50\/80/g, 'dark:bg-slate-800/80');
  content = content.replace(/dark:bg-slate-800\/50\/50/g, 'dark:bg-slate-800/50');
  content = content.replace(/dark:bg-slate-800\/50\/30/g, 'dark:bg-slate-800/30');
  
  // Fix hover states
  content = content.replace(/group-hover:bg-slate-50 dark:bg-slate-800\/50/g, 'group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50');
  content = content.replace(/hover:bg-slate-50 dark:bg-slate-800\/50/g, 'hover:bg-slate-50 dark:hover:bg-slate-800/50');
  
  // Fix specific colors that were missed
  content = content.replace(/text-indigo-900(?! dark:text-indigo-100)/g, 'text-indigo-900 dark:text-indigo-100');
  content = content.replace(/bg-amber-50\/50(?! dark:bg-amber-900\/20)/g, 'bg-amber-50/50 dark:bg-amber-900/20');
  content = content.replace(/bg-amber-50\/20(?! dark:bg-amber-900\/10)/g, 'bg-amber-50/20 dark:bg-amber-900/10');
  content = content.replace(/bg-amber-50(?! dark:bg-amber-900\/20)/g, 'bg-amber-50 dark:bg-amber-900/20');
  
  content = content.replace(/bg-indigo-50\/80(?! dark:bg-indigo-900\/30)/g, 'bg-indigo-50/80 dark:bg-indigo-900/30');
  content = content.replace(/bg-indigo-50\/60(?! dark:bg-indigo-900\/20)/g, 'bg-indigo-50/60 dark:bg-indigo-900/20');
  content = content.replace(/hover:bg-indigo-50\/80(?! dark:hover:bg-indigo-900\/30)/g, 'hover:bg-indigo-50/80 dark:hover:bg-indigo-900/30');
  
  content = content.replace(/text-amber-900(?! dark:text-amber-100)/g, 'text-amber-900 dark:text-amber-100');
  content = content.replace(/text-amber-700(?! dark:text-amber-300)/g, 'text-amber-700 dark:text-amber-300');
  content = content.replace(/bg-emerald-100(?! dark:bg-emerald-900\/50)/g, 'bg-emerald-100 dark:bg-emerald-900/50');
  content = content.replace(/text-emerald-700(?! dark:text-emerald-300)/g, 'text-emerald-700 dark:text-emerald-300');
  content = content.replace(/bg-rose-100(?! dark:bg-rose-900\/50)/g, 'bg-rose-100 dark:bg-rose-900/50');
  content = content.replace(/text-rose-700(?! dark:text-rose-300)/g, 'text-rose-700 dark:text-rose-300');
  
  // Make sure table headers have proper dark mode contrast
  content = content.replace(/text-slate-500 dark:text-slate-400/g, 'text-slate-500 dark:text-slate-300');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned up ${file} dark mode classes.`);
});
