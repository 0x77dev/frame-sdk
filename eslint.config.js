import { fixupConfigRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import pluginJs from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const compat = new FlatCompat()

export default [
  ...fixupConfigRules(
    compat.config({
      extends: ['standard']
    })
  ),
  { files: ['**/*.{js,mjs,cjs,ts}'], ignores: ['dist/*', 'node_modules/*'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended
]
