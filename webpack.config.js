const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',  // Change to './src/index.ts' if TypeScript entry point
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
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/worklet/processor.js', to: 'processor.js' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,  // Support TypeScript
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',  // Ensures JSX is supported
              '@babel/preset-typescript',  // Add TypeScript support
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.png', '.svg'],  // Add .tsx for TypeScript with JSX
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
