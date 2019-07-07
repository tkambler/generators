import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import importAlias from 'rollup-plugin-import-alias';
import analyze from 'rollup-plugin-analyzer';
import svg from 'rollup-plugin-svg';
import path from 'path-extra';
import fs from 'fs-extra';
import yaml from 'js-yaml';
import { sync as glob } from 'glob';

const componentDir = path.resolve(__dirname, 'src/components');
const internalNodeModules = [
  'amazon-cognito-identity-js',
  'currency-symbol-map',
  'es-cookie',
  'graphql-tag',
  'react-datepicker',
  'react-datasheet',
  'react-toastify',
];

function getIndexFileForPath(cwd) {
  const files = glob('index.*', {
    cwd
  });
  if (files.length !== 1) {
    throw new Error(`Multiple index files found for path: ${cwd}`);
  }
  return files[0];
}

function getComponentInputs() {
  const manifest = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, 'manifest.yaml'), 'utf8'));
  const components = manifest.components
    .filter((component) => {
      return typeof component.export === 'boolean' ? component.export : true;
    })
    .map((component) => {
      return {
        src: path.join('src', component.path, getIndexFileForPath(path.join('src', component.path))),
        dest: component.path,
      };
    });
  
  const input = {};
  for (const srcFile of components) {
    input[srcFile.dest] = srcFile.src;
  }
  // input['components/index'] = 'src/components/index.js';
  return input;
}

function getNonComponentInputs() {
  const input = {};
  const files = glob('**/*', {
    cwd: path.resolve(__dirname, 'src'),
    nodir: true,
  })
    .filter((path) => {
      return path.indexOf('components/') !== 0;
    })
    .map((_path) => {
      return {
        src: path.join('src', _path),
        dest: path.join(path.dirname(_path), path.basename(_path, path.extname(_path))),
      };
    });
  for (const file of files) {
    input[file.dest] = file.src;
  }
  return input;
}

function getFileExtension(f) {
  const base = path.basename(f);
  const files = glob(`${base}.*`, {
    cwd: path.dirname(f)
  });
  if (files.length !== 1) {
    throw new Error(`Unable to determine file extension: ${f}`);
  }
  return path.extname(files[0]);
}

const input = Object.assign({}, getComponentInputs(), getNonComponentInputs());

export default {
  plugins: [
    {
      resolveId: function ( importee, importer ) {
        if (!importer) {
          return;
        }
        if (importee.indexOf('#component') !== 0) {
          return;
        }
        const relPath = path.relative(componentDir, importer);
        const componentName = relPath.split('/')[0];
        let targetPath = path.resolve(componentDir, componentName, importee.substr(11));
        const stats = fs.statSync(targetPath);
        let ext;
        if (stats.isDirectory()) {
          targetPath = path.resolve(targetPath, getIndexFileForPath(targetPath));
          return targetPath;
        } else {
          ext = getFileExtension(targetPath);
          return targetPath + ext;
        }
      }
    },
    analyze({
      writeTo: (data) => {
        fs.writeFileSync('analysis.txt', data);
      }
    }),
    importAlias({
      Paths: {
        '@built/react': './src',
        'style-inject': 'style-inject',
      },
      Extensions: ['js', 'ts', 'tsx'],
    }),
    resolve({
      preferBuiltins: false,
      extensions: [
        '.mjs',
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.css',
        '.scss',
        '.module.css',
        '.module.scss',
        '.svg',
      ],
    }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        '@material-ui/core/styles/index.js': ['createGenerateClassName', 'createMuiTheme', 'createStyles', 'jssPreset', 'MuiThemeProvider', 'withStyles', 'withTheme'],
        '@material-ui/core/Modal/index.js': ['ModalManager'],
      },
    }),
    postcss({
      modules: true,
      extensions: ['.css', '.module.scss']
    }),
    typescript({
      include: [/\.js/, /\.jsx/, /\.ts/, /\.tsx/],
      tsconfig: 'tsconfig.json',
    }),
    svg(),
  ],
  input,
  external: function(id, parent, isResolved) {

    let resolved;
    try {
      resolved = require.resolve(id);
    } catch(err) {
    }

    if (id.indexOf('style-inject') >= 0) {
      return false;
    } else if (id.indexOf('src') === 0) {
      return false;
    } else if (id.indexOf('node_modules') >= 0) {
      return true;
    } else if (id.indexOf('@built') === 0) {
      return false;
    } else if (id[0] === '.') {
      return false;
    } else if ((resolved && resolved.indexOf('node_modules') >= 0) || typeof resolved === 'undefined' && internalNodeModules.indexOf(id) === -1) {
      return true;
    } else {
      return false;
    }
    
  },
  output: {
    dir: 'dist',
    entryFileNames: '[name].js',
    chunkFileNames: '[name]-[hash].js',
    format: 'es',
  },
};
