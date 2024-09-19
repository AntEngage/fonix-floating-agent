const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    // Copy processor.js to the dist directory
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/worklet/processor.js', to: 'processor.js' },
      ],
    }),
  ],
  mode: 'development', // Change to 'development' for non-production builds
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'chat-sdk.js',
    library: 'ChatSDK',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', 'png', 'svg']
  },
  optimization: {
    minimize: false, // Enable minimization

  },
  devtool: 'source-map',
};
