import { defineConfig } from 'eslint-define-config';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default defineConfig({
    languageOptions: {
        globals: {
            React: 'readonly', // Global variable definition
        },
        parserOptions: {
            ecmaVersion: 'latest',
            ecmaFeatures: {
                jsx: true,
            },
            sourceType: 'module',
        },
    },
    plugins: {
        prettier: prettierPlugin, // Add the plugin as an object here
        react: reactPlugin,
        '@typescript-eslint': typescriptPlugin,
        'react-hooks': reactHooksPlugin,
    },
    rules: {
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],
        'react/prop-types': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'react/jsx-props-no-spreading': ['error', { custom: 'ignore' }],
        'react/no-unescaped-entities': 'off',
        'import/no-cycle': [0, { ignoreExternal: true }],
        'prefer-const': 'off',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': [
            'error',
            { functions: false, classes: false, variables: false },
        ],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'react/jsx-uses-react': 'error',
        'react/jsx-uses-vars': 'error',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
    },
});
