// Requer: npm i -D typescript-eslint (parser TypeScript) — ver README.
import tseslint from 'typescript-eslint';

export default tseslint.config({ ignores: ['.angular/**', 'dist/**', 'out-tsc/**', 'node_modules/**', 'test-results/**'] }, ...tseslint.configs.strict, {
  files: ['src/**/*.ts', 'tests/**/*.ts'],
  rules: {
    'no-console': 'error',
    'no-empty': 'error',
    'max-params': ['error', 3],
    'max-depth': ['error', 2],
    eqeqeq: 'error',
    '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
  },
});
