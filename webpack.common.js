const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    fetch_homework: './src/fetch_homework.js',
    show_homework: './src/show_homework.js'
  },
  watchOptions: {
    ignored: /node_modules/,
  },
};
