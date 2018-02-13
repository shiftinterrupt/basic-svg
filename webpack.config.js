var path = require('path');

module.exports = {
	entry: {
		app: [ 'babel-polyfill', './src/index.js' ],
		example: './src/example.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		loaders: [
			{
				loader: 'babel-loader',
				test: /\.js$/,
				exclude: /node_modules/,
				query: {
					presets: [ 'es2015','stage-0' ]

				}
			}
		]
	}
};
