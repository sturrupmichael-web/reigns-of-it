// Code check: `npm run lint` (also run by the Tests workflow on every push). It catches
// real mistakes (misspelled or undefined names, unused variables, unreachable code),
// not formatting. The built index.html isn't checked.

import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['_site/', 'node_modules/'] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: { ...globals.browser } },
    rules: {
      'no-unused-vars': ['error', { args: 'none', ignoreRestSiblings: true }],
    },
  },
  // Node scripts: the build, the tests and the balance report.
  { files: ['*.mjs', 'tests/**/*.mjs', 'scripts/**/*.mjs'], languageOptions: { globals: { ...globals.node } } },
  // Code the tests run inside the page, where main.js defines window.reigns.
  { files: ['tests/**/*.mjs'], languageOptions: { globals: { reigns: 'readonly' } } },
];
