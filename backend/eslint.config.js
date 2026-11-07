export default [
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2024, sourceType: 'module' },
    rules: {
      'no-console': 'error',
      'no-empty': 'error',
      'no-unused-vars': 'error',
      'no-magic-numbers': ['warn', { ignore: [0, 1, -1, 2, 100], ignoreArrayIndexes: true }],
      'max-params': ['error', 3],
      'max-depth': ['error', 2],
      'max-lines-per-function': ['warn', { max: 25, skipBlankLines: true, skipComments: true }],
      'max-lines': ['warn', { max: 200, skipBlankLines: true }],
      eqeqeq: 'error',
    },
  },
  {
    files: ['tests/**/*.js', 'src/config/dados-iniciais.js'],
    rules: { 'no-magic-numbers': 'off', 'max-lines-per-function': 'off', 'max-lines': 'off' },
  },
];
