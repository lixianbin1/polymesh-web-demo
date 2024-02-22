import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './lib/ui'
import './lib/prototype'
import '@/styles/common.scss'
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager'
import { Polymesh } from '@polymeshassociation/polymesh-sdk'
// import keyring from '@polkadot/ui-keyring'
import store from '@/store'
import { setAccount } from '@/lib/repeatQuote'

Vue.config.productionTip = false
new Vue({
	router,
	render: h => h('div', { attrs: { class: 'page-loading', id: 'app' }}, [h('a-spin', { attrs: { size: 'large' }})])
}).$mount('#app')
BrowserExtensionSigningManager.create({
	appName: 'securities-blockchain-transaction',
	extensionName: 'polywallet'
}).then(async signingManager => {
	const connect = () => {
		return Polymesh.connect({
			nodeUrl: 'wss://testnet-rpc.polymesh.live',
			signingManager,
			middleware: {
				link: 'https://testnet-graphql.polymesh.live',
				key: 'deprecated'
			}
		})
	}
	let api = await connect()
	window.fn = async (fun, str) => {
		window[str] = await fun
	}
	window.api = api
	console.log(api)
	signingManager.onAccountChange(async accounts => {
		store.dispatch('Global/setLoading', true)
		await api.disconnect()
		api = await connect()
		Vue.prototype.api = api
		const account = accounts[0] || ''
		store.dispatch('Account/setAddress', { accounts, account })
		store.dispatch('Global/setLoading', false)
		setAccount(account, api.context)
	})
	// 切换网络先不做
	signingManager.onNetworkChange(async networkInfo => {
		store.dispatch('Account/setNetwork', networkInfo)
	})

	const accounts = await signingManager.getAccounts() || []
	Vue.prototype.api = api
	setAccount(accounts[0], api.context)

	store.dispatch('Account/setAddress', { accounts, account: accounts[0] })

	// 目前还用不到密钥环的管理,先屏蔽
	// keyring.loadAll({ ss58Format: 42, type: 'sr25519' })

	new Vue({
		router,
		store,
		render: h => h(App)
	}).$mount('#app')
}).catch(e => {
	Vue.prototype.$message.error('连接测试网超时,请刷新页面')
	console.error('error create :', e)
})

