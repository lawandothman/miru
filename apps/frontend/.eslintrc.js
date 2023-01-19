require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  extends: ['custom', 'plugin:tailwindcss/recommended', 'next/core-web-vitals'],
  plugins: ['tailwindcss'],
  root: true,
  rules: {
    'tailwindcss/no-custom-classname': [
      1,
      {
        callees: ['cx'],
        whitelist: [
          '^aspect.*',
          '^radix.*',
          'animate-slide-down-fade',
          'animate-slide-up-fade',
          'animate-slide-left-fade',
          'animate-slide-right-fade',
          'animate-tilt-n-move-shaking',
        ],
      },
    ],
  },
}
