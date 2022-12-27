module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'warn',
    indent: 'off',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/semi': ['error', 'never'],
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    'jsx-quotes': ['error', 'prefer-single'],
  },
  ignorePatterns: ['src/__generated__/*.ts'],
}
