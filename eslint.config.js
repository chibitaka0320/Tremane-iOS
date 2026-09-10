// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // TODO: 既存コードのuseEffect内setStateパターンを見直してから有効化する
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);
