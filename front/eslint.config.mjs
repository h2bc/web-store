import stylistic from '@stylistic/eslint-plugin'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const paddingLines = [
  'error',
  { blankLine: 'always', prev: '*', next: 'return' },
  { blankLine: 'always', prev: ['const', 'let'], next: '*' },
  { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
  { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
  { blankLine: 'always', prev: '*', next: 'multiline-block-like' },
]

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    plugins: { '@stylistic': stylistic },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@stylistic/padding-line-between-statements': paddingLines,
    },
  },
]

export default eslintConfig
