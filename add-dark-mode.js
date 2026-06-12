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
  
  // Replace colors for dark mode support
  content = content.replace(/bg-white/g, 'bg-white dark:bg-slate-900');
  content = content.replace(/bg-slate-50/g, 'bg-slate-50 dark:bg-slate-800/50');
  content = content.replace(/bg-slate-100/g, 'bg-slate-100 dark:bg-slate-800');
  content = content.replace(/text-slate-900/g, 'text-slate-900 dark:text-white');
  content = content.replace(/text-slate-800/g, 'text-slate-800 dark:text-slate-100');
  content = content.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-200');
  content = content.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-300');
  content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-400');
  content = content.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-700');
  content = content.replace(/border-slate-100/g, 'border-slate-100 dark:border-slate-800');
  content = content.replace(/border-slate-300/g, 'border-slate-300 dark:border-slate-600');
  
  // Fix specific doubled strings if we ran this multiple times by accident
  content = content.replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file} for dark mode.`);
});
