const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    // fetch_homework: './src/fetch_homework.js',
    // show_homework: './src/show_homework.js',
    fetch_homework_storage: './src/fetch_homework_storage.js',
    show_homework_storage: './src/show_homework_storage.js',
    popup: './src/popup.js',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json' },
        { from: 'src/icon16.png' },
        { from: 'src/icon48.png' },
        { from: 'src/icon128.png' },
        { from: 'src/popup.html' },
      ]
    }),
  ],
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
  },
  watchOptions: {
    ignored: /node_modules/,
  },
};
