import { copyFileSync, cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const apiDirectory = resolve(process.argv[2] ?? 'api');
const sharedDirectory = resolve('packages/shared');
const apiManifestPath = resolve(apiDirectory, 'package.json');
const sharedManifestPath = resolve(sharedDirectory, 'package.json');
const sharedDistPath = resolve(sharedDirectory, 'dist');
const packagedSharedDirectory = resolve(apiDirectory, 'shared');

for (const path of [apiManifestPath, sharedManifestPath, sharedDistPath]) {
  if (!existsSync(path)) {
    throw new Error(`Required Static Web Apps API packaging input not found: ${path}`);
  }
}

const apiManifest = JSON.parse(readFileSync(apiManifestPath, 'utf8'));
const sharedManifest = JSON.parse(readFileSync(sharedManifestPath, 'utf8'));
if (apiManifest.name !== '@tarot/api' || sharedManifest.name !== '@tarot/shared') {
  throw new Error('Unexpected API or shared package manifest while preparing the SWA API.');
}

apiManifest.dependencies ??= {};
if (!apiManifest.dependencies['@tarot/shared']) {
  throw new Error('The API manifest does not declare its @tarot/shared dependency.');
}

cpSync(sharedDistPath, resolve(packagedSharedDirectory, 'dist'), { recursive: true });
copyFileSync(sharedManifestPath, resolve(packagedSharedDirectory, 'package.json'));
apiManifest.dependencies['@tarot/shared'] = 'file:./shared';
writeFileSync(apiManifestPath, `${JSON.stringify(apiManifest, null, 2)}\n`);

console.log('Prepared a self-contained Static Web Apps API package.');
