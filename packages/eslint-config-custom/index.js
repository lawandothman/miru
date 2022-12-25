module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'warn',
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    'jsx-quotes': ['error', 'prefer-single'],
  },
  ignorePatterns: ['src/__generated__/*.ts'],
}
