import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import boundaries from 'eslint-plugin-boundaries'
import prettierPlugin from 'eslint-plugin-prettier'

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      boundaries,
      prettier: prettierPlugin,
    },
    ignores: [
      '.eslintrc.js',
      'eslint.config.js',
      'prettier.config.js',
      'scripts/**',
      'dist/**',
      'node_modules/**',
    ],
    rules: {
      ...boundaries.configs.recommended.rules,
      'prettier/prettier': ['error', { semi: false }],
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'domain', allow: [] },
            { from: 'application', allow: ['domain', 'infrastructure'] },
            { from: 'infrastructure', allow: ['application', 'domain'] },
            { from: 'interfaces', allow: ['application'] },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '.*',
            'src/*',
            '!@/*',
          ],
        },
      ],
    },
    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain/**' },
        { type: 'application', pattern: 'src/application/**' },
        { type: 'infrastructure', pattern: 'src/infrastructure/**' },
        { type: 'interfaces', pattern: 'src/interfaces/**' },
      ],
      'import/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.ts', '.js'],
        },
      },
    },
  },
]