/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'next/core-web-vitals'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Enforce type safety
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',

    // Consistency
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
      fixStyle: 'separate-type-imports'
    }],
    '@typescript-eslint/consistent-type-exports': 'error',

    // Best practices
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',

    // Prevent direct adapter imports in core (but allow in src/)
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['packages/adapters-*/*', '../packages/adapters-*'],
        message: 'Use @3k/adapters-* imports instead of relative paths to adapter packages.'
      }]
    }],

    // React/Next.js specific (relaxed from strict)
    'react/no-unescaped-entities': 'off',
    '@next/next/no-html-link-for-pages': 'off'
  },
  ignorePatterns: [
    'node_modules',
    '.next',
    'out',
    'dist',
    'build',
    '*.config.js',
    '*.config.ts',
    '*.config.mjs',
    '3k-evaluation-app'
  ]
}