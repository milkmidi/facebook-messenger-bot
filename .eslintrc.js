module.exports = {
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  parser: 'babel-eslint',
  settings: {
  },
  rules: {
    'no-console': 0,
    'import/no-unresolved': 0,
    'global-require': 0,
    'class-methods-use-this': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'no-extraneous-dependencies': 'off',
    'import/extensions': ['off', 'never'],
    'no-param-reassign': ['error', {
      props: false
    }],
    'no-plusplus': ['error', {
      allowForLoopAfterthoughts: true
    }],
  },
};