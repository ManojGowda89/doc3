import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import webpack from 'webpack';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const env = dotenv.config({
  path: path.resolve(__dirname, '../.env'),
  quiet: true,
}).parsed || {};

// Prepare env vars for React
const reactEnv = Object.keys(env)
  .filter(key => key.startsWith('REACT_APP_'))
  .reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(env[key]);
    return acc;
  }, {});

// ✅ Custom plugin to show "Build successful" in green
class BuildSuccessPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('BuildSuccessPlugin', () => {
      console.log('\x1b[32m%s\x1b[0m', '✅ Build successful');
    });
  }
}

const isProd = process.env.NODE_ENV === 'production';

export default {
  entry: [
    !isProd && 'webpack-hot-middleware/client?reload=true&timeout=1000&quiet=true',
    './app/main.jsx',
  ].filter(Boolean),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  mode: isProd ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true,
            configFile: path.resolve(__dirname, './.babelrc'),
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/index.html',
    }),
    new webpack.DefinePlugin(reactEnv),
    !isProd && new webpack.HotModuleReplacementPlugin(),
    new BuildSuccessPlugin(),
  ].filter(Boolean),
  performance: {
    hints: false,
  },
  stats: 'errors-warnings',
};
