const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { argv } = require('process')

module.exports = {
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Wargroove Match Viewer',
      template: 'index.html',
      output: {
        publicPath: '/'
      }
    }),
    new CopyWebpackPlugin({ patterns: [{ from: 'assets', to: 'assets' }] }),
  ],
  output: {
    filename: argv.mode === 'production' ? 'app.[contenthash].js' : 'app.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  mode: argv.mode === 'production' ? 'production' : 'development',
}
