const { defineConfig } = require('@vue/cli-service')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
module.exports = defineConfig({
	// devServer: {
	// 	proxy: 'https://polymesh-testnet.api.subscan.io'
	// },
	transpileDependencies: true,
	// lintOnSave: false,
	configureWebpack: {
		plugins: [
			new NodePolyfillPlugin()
		]
	},
	chainWebpack: config => {
		config.plugin('html')
			.tap(args => {
				args[0].title = '基于Polymesh的区块链证券交易系统V1.0'
				return args
			})
	},
	css: {
		loaderOptions: {
			sass: {
				additionalData: `@import '~@/styles/variables.scss';`
			}
		}
	}
})
