import { ConfigWithExtendsArray } from '@eslint/config-helpers';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import jest from 'eslint-plugin-jest';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooksLint from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  js.configs.recommended,
  tseslint.configs.recommended as ConfigWithExtendsArray[number],
  eslintPluginPrettierRecommended,
  reactHooksLint.configs.flat.recommended,
  [
    globalIgnores(['./build', '**/*.js', '**/node_modules']),
    {
      languageOptions: {
        globals: { ...globals.browser },
        parser: tsParser,
        ecmaVersion: 5,
        sourceType: 'module',
        parserOptions: { project: 'tsconfig.json' },
      },
      rules: {
        // ✅ 启用格式化验证，这里只进行警告，警告是会被 --fix 修复的，请勿使用 error，不然写代码时会有红色波浪线提示错误
        'prettier/prettier': 'warn',
        // ✅ 允许空格与 `tab` 一起混用，必须是 `off`，因为 `prettier` 会格式化，所以不存在该情况
        'no-mixed-spaces-and-tabs': 'off',
        // ✅ 允许多个无用行，必须是 `off`，因为 `prettier` 会格式化，所以不存在该情况
        'no-unexpected-multiline': 'off',
        // ✅ 允许连续的 `case` 语句，即可以缺少 `break`
        'no-fallthrough': 'off',
        // ❌ 不允许使用 `undefined`
        'no-undefined': 'error',
        // ✅ 允许常量判断条件
        'no-constant-condition': 'off',
        // ❌ 不允许简写箭头函数： `a => 123;` -> `a => { return 123; }`
        'arrow-body-style': 'off',
        // ⚠️ 不允许没有 `yield` 的 `generator` 函数
        'require-yield': 'warn',
        // ✅ 允许无用的分号，必须是 `off`，因为 `prettier` 会格式化，所以不存在该情况
        '@typescript-eslint/no-extra-semi': 'off',
        // ✅ 允许空函数
        '@typescript-eslint/no-empty-function': 'off',
        // ❌ 不允许代码上下文中重复定义变量名
        '@typescript-eslint/no-shadow': 'error',
        // ⚠️ 不允许未使用的变量
        '@typescript-eslint/no-unused-vars': [
          'error',
          { ignoreRestSiblings: true, caughtErrors: 'none', varsIgnorePattern: '^_' },
        ],
        // ✅ 允许空的 `interface`，便于 `interface A extends B {}` 的写法
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-empty-object-type': [
          'error',
          {
            // ✅ 允许空的 `interface`，便于 `interface A extends B {}` 的写法
            allowInterfaces: 'with-single-extends',
          },
        ],
        // ❌ 不允许函数没有返回类型： `() => {}` -> `(): void => {}`
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowTypedFunctionExpressions: false,
            allowDirectConstAssertionInArrowFunctions: false,
            allowHigherOrderFunctions: false,
          },
        ],
        // ❌ 不允许 `any`
        '@typescript-eslint/no-explicit-any': 'error',
        // 将 `ahooks` 中部分 `hooks` 进行依赖检查
        'react-hooks/exhaustive-deps': [
          'error',
          {
            additionalHooks:
              '^(useUpdateEffect|useUpdateLayoutEffect|useAsyncEffect|useDebounceEffect|useThrottleEffect|useDeepCompareEffect|useDeepCompareLayoutEffect|useCreation)$',
          },
        ],
      },
    },
    {
      files: ['**/**.test.{t,j}s{x,}'],
      plugins: { jest },
      languageOptions: {
        globals: jest.environments.globals.globals,
      },
    },
  ],
);
