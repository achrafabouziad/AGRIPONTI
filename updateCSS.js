const fs = require('fs');
const path = './client/src/index.css';

let css = fs.readFileSync(path, 'utf8');

// 1. Add --surface to :root
css = css.replace(/(:root\s*\{)/, '$1\n  --surface: #ffffff;');

// 2. Add [data-theme="dark"] block
const darkTheme = `

[data-theme='dark'] {
  --surface: #1e293b;
  --slate-50: #0f172a;
  --slate-100: #1e293b;
  --slate-200: #334155;
  --slate-300: #475569;
  --slate-400: #64748b;
  --slate-500: #94a3b8;
  --slate-600: #cbd5e1;
  --slate-700: #e2e8f0;
  --slate-800: #f1f5f9;
  --slate-900: #f8fafc;

  --emerald-50: #022c22;
  --emerald-100: #064e3b;
  --emerald-200: #065f46;
  --emerald-300: #047857;
  --emerald-400: #059669;
  --emerald-500: #10b981;
  --emerald-600: #34d399;
  --emerald-700: #6ee7b7;
  --emerald-800: #a7f3d0;
  --emerald-900: #ecfdf5;

  --blue-50: #172554;
  --blue-400: #60a5fa;
  --blue-500: #3b82f6;
  --blue-600: #2563eb;
  --blue-700: #93c5fd;

  --red-50: #450a0a;
  --red-400: #f87171;
  --red-500: #ef4444;
  --red-600: #fca5a5;

  --amber-50: #451a03;
  --amber-400: #fbbf24;
  --amber-500: #f59e0b;
  --amber-600: #fcd34d;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.6);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.8);

  --glass-bg: rgba(15, 23, 42, 0.7);
  --glass-border: rgba(255, 255, 255, 0.05);
}
`;
css = css.replace(/(--glass-border: rgba\(255, 255, 255, 0\.3\);\n\})/, `$1\n${darkTheme}`);

// 3. Replace white with var(--surface)
css = css.replace(/background:\s*white;/g, 'background: var(--surface);');
css = css.replace(/background-color:\s*white;/g, 'background-color: var(--surface);');

// 4. Update body transitions
css = css.replace(/(body\s*\{[\s\S]*?min-height: 100vh;)/, '$1\n  transition: background-color var(--transition-base), color var(--transition-base);');

// 5. Add custom dark mode overrides for specific gradients that clash in dark mode
const customOverrides = `
/* Dark mode overrides */
[data-theme='dark'] .price-card.has-alert {
  background: linear-gradient(to bottom, var(--red-50), var(--surface));
}

[data-theme='dark'] .navbar-tab.active-b2c,
[data-theme='dark'] .navbar-tab.active-b2b {
  background: var(--slate-200);
}

[data-theme='dark'] .price-item.wholesale { background: var(--emerald-50); }
[data-theme='dark'] .price-item.recommended { background: var(--blue-50); }
[data-theme='dark'] .price-item.market { background: var(--slate-100); }
`;
css += customOverrides;

fs.writeFileSync(path, css);
console.log('CSS updated successfully');
