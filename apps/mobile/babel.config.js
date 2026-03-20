module.exports = function exports(api) {
	api.cache(true);
	return {
		presets: ["babel-preset-expo"],
		plugins: [
			["babel-plugin-react-compiler"],
			[
				"module-resolver",
				{
					alias: {
						"@": "./src",
					},
				},
			],
		],
	};
};
