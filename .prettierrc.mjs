/** @type {import("prettier").Config} */
export default {
  plugins: ['prettier-plugin-astro'],
  singleQuote: true,
  semi: true,
  printWidth: 100,
  tabWidth: 2,
  trailingComma: 'all',
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
