module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ["airbnb-base", "prettier", "eslint-config-prettier"],
  parserOptions: {
    ecmaVersion: 12,
  },
  globals: {
    db: true,
  },
  rules: {
    "no-console": [0],
  },
};
