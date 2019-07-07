const fs = require('fs-extra');
const sass = require('node-sass');
const path = require('path');
const os = require('os');
const distDir = path.resolve(__dirname, '../dist');
fs.ensureDirSync(path.resolve(distDir, 'css/fonts'));

fs.copySync(
  path.resolve(__dirname, '../node_modules/npm-font-open-sans/fonts'),
  path.resolve(distDir, 'css/fonts/open-sans'),
);

const result = sass.renderSync({
  file: path.resolve(__dirname, '../scss/style.scss'),
});

const extraCSS = [
  // Insert paths to additional CSS files to be inserted into the final result here
]
  .map((file) => {
    return fs.readFileSync(file, 'utf8');
  })
  .join(os.EOL);

fs.writeFileSync(path.resolve(distDir, 'css/style.css'), result.css + os.EOL + extraCSS);
