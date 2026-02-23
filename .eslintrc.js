const path = require('path');

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  settings: {
    next: {
      rootDir: path.join(__dirname)
    }
  }
};
