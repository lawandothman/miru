const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const path = require("node:path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getSentryExpoConfig(projectRoot, {
	annotateReactComponents: true,
});

// Expo Doctor for SDK 55 flags this Metro option as unknown.
if (config.watcher) {
	delete config.watcher.unstable_workerThreads;
}

// Allow Metro to resolve files from the monorepo root
config.watchFolders = [
	...new Set([...(config.watchFolders ?? []), monorepoRoot]),
];

// Resolve node_modules from both mobile and root
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(monorepoRoot, "node_modules"),
];

// Prevent Metro from trying to bundle server-side code
config.resolver.blockList = [
	...(config.resolver.blockList ?? []),
	/packages\/db\/src\/.*/,
	/packages\/trpc\/src\/.*/,
];

// Required for Better Auth ESM exports to resolve correctly
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
