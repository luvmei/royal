const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './client/public/js/index.js',
  output: {
    path: path.resolve(__dirname, './client/public/bundle'),
    filename: 'bundle.js',
  },
  resolve: {
    alias: {
      '/public': path.resolve(__dirname, 'client/public'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      bootstrap: 'bootstrap',
      moment: 'moment',
      io: ['socket.io-client', 'default'],
      i18next: [path.resolve(__dirname, './client/public/vendor/i18next/i18next.min.js')],
      korean: [path.resolve(__dirname, './client/public/js/common.js'), 'korean'],
      spinnerToggle: [path.resolve(__dirname, './client/public/js/common.js'), 'spinnerToggle'],
      clientId: [path.resolve(__dirname, './client/public/js/socket.js'), 'clientId'],
      clientType: [path.resolve(__dirname, './client/public/js/socket.js'), 'clientType'],
      socket: [path.resolve(__dirname, './client/public/js/socket.js'), 'socket'],
      socketPath: [path.resolve(__dirname, './client/public/js/socket.js'), 'socketPath'],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
};
