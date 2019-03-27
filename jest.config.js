/* eslint-disable flowtype/require-valid-file-annotation */

module.exports = {
  setupFiles: [
    // for some painful reason this is needed for our 'async' usage
    // in drop-dev-warnings-for-prod.spec.js
    require.resolve('regenerator-runtime/runtime'),
  ],
};
