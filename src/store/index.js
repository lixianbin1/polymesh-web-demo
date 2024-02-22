import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import Account from './modules/Account'
import Global from './modules/Global'

Vue.use(Vuex)
const debug = process.env.NODE_ENV !== 'production'

const plugins = []
if (debug){
	plugins.push(createLogger())
}
const store = new Vuex.Store({
	modules: {
		Account,
		Global
	},
	strict: debug,
	plugins
})
export default store
