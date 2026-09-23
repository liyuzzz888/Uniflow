const { packager } = require('@electron/packager');
const path = require('node:path');
const pkg = require('../package.json');

const projectRoot = path.resolve(__dirname, '..');
const bundleId = process.env.UNIFLOW_MAC_BUNDLE_ID;
const identity = process.env.UNIFLOW_MAC_SIGNING_IDENTITY;
const provisioningProfile = process.env.UNIFLOW_MAC_PROVISIONING_PROFILE;
const arch = process.env.UNIFLOW_MAC_ARCH || 'arm64';

const required = [
  ['UNIFLOW_MAC_BUNDLE_ID', bundleId],
  ['UNIFLOW_MAC_SIGNING_IDENTITY', identity],
  ['UNIFLOW_MAC_PROVISIONING_PROFILE', provisioningProfile]
];
const missing = required.filter(([, value]) => !value).map(([name]) => name);
if (missing.length) {
  throw new Error(`MAS build requires: ${missing.join(', ')}`);
}
if (bundleId === 'app.uniflow.desktop' || bundleId === 'app.uniflow.ios') {
  throw new Error('UNIFLOW_MAC_BUNDLE_ID is still a placeholder; register the final Bundle ID first.');
}
if (!['arm64', 'x64', 'universal'].includes(arch)) {
  throw new Error(`Unsupported UNIFLOW_MAC_ARCH: ${arch}`);
}

const appEntitlements = path.join(projectRoot, 'entitlements', 'mas.plist');

packager({
  dir: projectRoot,
  name: 'UniFlow',
  appBundleId: bundleId,
  appVersion: pkg.version,
  buildVersion: String(pkg.uniflowBuildNumber),
  platform: 'mas',
  arch,
  out: path.join(projectRoot, 'build'),
  electronZipDir: process.env.UNIFLOW_ELECTRON_ZIP_DIR || undefined,
  overwrite: true,
  asar: true,
  icon: path.join(projectRoot, 'assets', 'UniFlow.icns'),
  osxSign: {
    identity,
    provisioningProfile,
    platform: 'mas',
    type: 'distribution',
    continueOnError: false,
    optionsForFile(filePath) {
      // The user-selected-file entitlement belongs to the main application.
      // Electron's built-in MAS helper entitlements remain in effect for helpers.
      if (filePath.endsWith(`${path.sep}Contents${path.sep}MacOS${path.sep}UniFlow`)) {
        return { entitlements: appEntitlements };
      }
      return {};
    }
  },
  // Never include unrelated files from the workspace in a release bundle.
  ignore: /^\/(?!desktop(?:\/|$)|dist(?:\/|$)|package\.json$).*/
}).then(paths => console.log(paths.join('\n'))).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
