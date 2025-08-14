import express from 'express';
import webpack from 'webpack';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import config from './mjs.config.js';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import morgan from 'morgan';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createApp = () => {
  const app = express();
  const PORT = process.env.PORT || 8000;

  app.use(
    morgan('dev', {
      skip: (req) =>
        [
          '/favicon.ico',
          '/bundle.js',
          '/img.jpg',
          '/__webpack_hmr',
          '/.well-known/',
        ].some((path) => req.url.startsWith(path)) ||
        req.url.endsWith('.json') ||
        req.url.endsWith('.js') ||
        req.url.endsWith('.jpg') ||
        req.url.endsWith('.png') ||
        req.url.endsWith('.ico') ||
        req.url.endsWith('.map'),
    })
  );

  const isProd = process.env.NODE_ENV === 'production';
  let compiler;

  if (!isProd) {
    compiler = webpack(config);

    app.use(
      webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
      })
    );

    app.use(webpackHotMiddleware(compiler));
  }

  // Static files
  app.use(express.static(path.join(__dirname, '../public')));

  if (isProd) {
    app.use(express.static(path.join(__dirname, '../dist')));
  }

  // Optional: Prevent HMR endpoint in production
  app.use((req, res, next) => {
    if (req.url === '/__webpack_hmr' && isProd) {
      return res.status(404).send('HMR not available in production');
    }
    next();
  });

  // React App route
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();

    if (compiler && !isProd) {
      const fs = compiler.outputFileSystem;
      const filePath = path.join(config.output.path, 'index.html');
      fs.readFile(filePath, (err, result) => {
        if (err) return next(err);
        res.set('Content-Type', 'text/html');
        res.send(result);
      });
    } else {
      res.sendFile(path.resolve(__dirname, '../dist/index.html'));
    }
  });

  return { app, PORT };
};
