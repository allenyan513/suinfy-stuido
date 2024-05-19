import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import webpack from 'webpack'
// eslint-disable-next-line import/default
import CopyWebpackPlugin from 'copy-webpack-plugin'
import path from 'path'

const assets = ['assets']; // asset directories

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new webpack.DefinePlugin({
    'process.env.FLUENTFFMPEG_COV': false
  }),
  new CopyWebpackPlugin({
    patterns: assets.map(asset => ({
      from: path.resolve(__dirname, 'src', 'renderer', asset),
      to: path.resolve(__dirname, '.webpack/renderer', asset)
    })),
  }),

];
