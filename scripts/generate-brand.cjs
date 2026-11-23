const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const directory = path.join(__dirname, '../assets/brand');
  const svg = await fs.readFile(path.join(directory, 'app-icon.svg'), 'utf8');
  await sharp(Buffer.from(svg)).png().toFile(path.join(directory, 'app-icon.png'));
  const foreground = svg.replace(/<rect[^>]+\/>/, '');
  await sharp(Buffer.from(foreground))
    .png()
    .toFile(path.join(directory, 'app-icon-foreground.png'));
  console.log('Iconos MiliBrows generados desde el SVG.');
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
