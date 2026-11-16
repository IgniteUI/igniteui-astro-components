// Copies the built ig-design-system package into src/styles/design-system.
// Usage: node scripts/sync-design-system.mjs [path to ig-design-system]
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(process.argv[2] ?? path.join(here, '../../ig-design-system'));
const target = path.join(here, '../src/styles/design-system');

if (!fs.existsSync(path.join(source, 'dist/tokens.css'))) {
  console.error(
    `No dist/tokens.css under ${source}. Pass the path to an ig-design-system checkout that has been built.`,
  );
  process.exit(1);
}

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(path.join(target, 'fonts'), { recursive: true });
for (const file of ['fonts.css', 'tokens.css', 'theme.css']) {
  fs.copyFileSync(path.join(source, 'dist', file), path.join(target, file));
}
for (const font of fs.readdirSync(path.join(source, 'dist/fonts'))) {
  fs.copyFileSync(path.join(source, 'dist/fonts', font), path.join(target, 'fonts', font));
}

const commit = execSync('git rev-parse --short HEAD', { cwd: source }).toString().trim();
fs.writeFileSync(path.join(target, 'VERSION'), `ig-design-system ${commit}\n`);
console.log(`design-system: copied ${commit} to ${path.relative(process.cwd(), target)}`);
