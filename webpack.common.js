const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    // fetch_homework: './src/fetch_homework.js',
    // show_homework: './src/show_homework.js',
    fetch_homework_storage: './src/fetch_homework_storage.js',
    show_homework_storage: './src/show_homework_storage.js',
    background: './src/background.js',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json' },
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
