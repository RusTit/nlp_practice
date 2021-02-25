module.exports = {
  env: {
    es6: true,
    node: true,
    mocha: true
  },
  extends: [
    "airbnb-base",
    "plugin:prettier/recommended",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    document: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {},
  plugins: []
};
