require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  extends: ['custom', 'plugin:tailwindcss/recommended', 'next/core-web-vitals'],
  plugins: ['tailwindcss'],
  root: true,
}
