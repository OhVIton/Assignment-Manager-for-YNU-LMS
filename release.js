const zip = require('bestzip');
let destination = `./release/release`;
if (process.argv.length >= 3) {
  destination += `_${process.argv[2]}`;
}
destination += '.zip';
zip({
  source: 'dist/*',
  destination,
});
