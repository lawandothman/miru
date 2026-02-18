const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Allow Metro to resolve files from the monorepo root
config.watchFolders = [monorepoRoot];

// Resolve node_modules from both mobile and root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Prevent Metro from trying to bundle server-side code
config.resolver.blockList = [
  /packages\/db\/src\/.*/,
  /packages\/trpc\/src\/.*/,
];

// Required for Better Auth ESM exports to resolve correctly
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
