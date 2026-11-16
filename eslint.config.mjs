import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', '.data/**/*', 'src/**/*', '*.ts', '*.tsx', '*.js'],
  },
  {
    files: ['**/*.rules'],
    ...firebaseRulesPlugin.configs['flat/recommended'],
  },
];
