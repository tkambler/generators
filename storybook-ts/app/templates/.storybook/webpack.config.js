const path = require('path');
const _ = require('lodash');
const pkgDir = path.resolve(__dirname, '../');
const componentDir = path.resolve(pkgDir, 'src/components');
const ComponentResolver = require('./resolvers/component')(componentDir);

module.exports = ({
  config = {}
}) => {

  _.defaultsDeep(config, {
    module: {
      rules: [],
    },
    resolve: {
      plugins: [],
    },
  });

  config.resolve.plugins.push(ComponentResolver);

  _.merge(config, {
    resolve: {
      alias: {
        'casual': 'casual-browserify',
        'graphql-mocks': path.resolve(__dirname, '../graphql-mocks'),
        '@built/react': path.resolve(__dirname, '../src'),
        'handlebars': path.resolve(__dirname, '../node_modules/handlebars/dist/handlebars.js'),
      },
      extensions: [
        '.ts',
        '.tsx',
        '.mjs',
        '.js',
        '.jsx',
        '.json',
        '.html',
        '.png',
        '.jpg',
        '.gif',
        '.svg',
        '.scss',
        '.css',
        '.module.css',
        '.module.scss',
      ]
    }
  });

  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('ts-loader'),
    include: path.resolve(__dirname, '../src'),
  });

  config.module.rules.push({
    test: /\.module\.scss$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
          modules: true,
          localIdentName: '[name]__[local]___[hash:base64:5]',
        },
      },
      {
        loader: 'sass-loader',
        options: {
          includePaths: [path.resolve(__dirname, '../scss')],
        },
      },
    ],
  });

  return config;

};
