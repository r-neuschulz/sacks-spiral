import pluginVue from 'eslint-plugin-vue'
import configPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  { ignores: ['dist', 'node_modules', '.yarn', '**/*.min.js'] },
  ...pluginVue.configs['flat/recommended'],
  configPrettier,
  {
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/component-definition-name-casing': 'off',
      'vue/attributes-order': 'off',
    },
  },
]
