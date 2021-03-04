const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js' ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Wargroove Match Viewer',
      template: 'index.html'
    }),
  ],
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development'
};
