const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const ExtensionReloader = require('webpack-extension-reloader');

module.exports = (env, argv) => {
  return merge(
    common,
    {
      mode: 'development',
      devtool: 'inline-source-map',
      plugins: [
        (argv.watch || argv.w) ? (new ExtensionReloader({
          port: 9090,
          reloadPage: true,
          manifest: path.resolve(__dirname, 'src', 'manifest.json'),
        })) : false,
      ].filter(Boolean),
    }
  );
};
