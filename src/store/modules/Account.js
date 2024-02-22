const state = () => ({
	address: '',
	allAddress: [],
	networkInfo: null,
	update: new Date().getTime()
})
// mutations
const mutations = {
	ADDRESS(state, res){
		state.address = res.account
		state.allAddress = res.accounts
	},
	NETWORKINFO(state, networkInfo){
		state.networkInfo = networkInfo
	},
	UPDATE(state){
		state.update = new Date().getTime()
	}
}

// actions
const actions = {
	setAddress({ commit }, res) {
		commit('ADDRESS', res)
	},
	setNetwork({ commit }, networkInfo) {
		commit('NETWORKINFO', networkInfo)
	},
	update({ commit }) {
		commit('UPDATE')
	}
}
// getters
const getters = {

}
export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}
