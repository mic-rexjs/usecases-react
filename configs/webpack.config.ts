import * as path from 'path';
import { Configuration } from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const initConfig = (): Configuration => {
  const projectDir = path.resolve(__dirname, '../');
  const outDir = path.resolve(projectDir, 'build');
  const distPath = path.resolve(outDir, 'dist');
  const configsDir = path.resolve(projectDir, 'configs');

  return {
    mode: 'production',
    entry: path.resolve(outDir, 'es/index.js'),
    output: {
      filename: 'index.min.js',
      path: distPath,
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    externals: ['@rex-js/usecases', 'react', 'ahooks'],
    resolve: {
      extensions: ['.js'],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          options: {
            extends: path.resolve(configsDir, '.babelrc'),
          },
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(projectDir, 'package.json'),
            to: path.resolve(outDir, 'package.json'),
            transform(content): string {
              const json = JSON.parse(content.toString());

              json.private = false;
              return JSON.stringify(json, null, 2);
            },
          },
          ...['README.md'].map((filename: string): CopyWebpackPlugin.Pattern => {
            return {
              from: path.resolve(projectDir, filename),
              to: path.resolve(outDir, filename),
            };
          }),
        ],
      }),
    ],
  };
};

export default initConfig();
