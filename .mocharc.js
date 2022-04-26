module.exports = {
  exit: true,
  slow: 75,
  timeout: 2000,
  ui: 'bdd',
  diff: true,
  reporter: 'dot',
  spec: 'test/**/*.test.js',
  'watch-files': ['test/**/*.js'],
  require: ['babel-core/register', 'test/helpers.js']
};
