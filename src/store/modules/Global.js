const state = () => ({
	loading: false
})
// mutations
const mutations = {
	LOADING(state, res){
		state.loading = res
	}
}

// actions
const actions = {
	setLoading({ commit }, res) {
		commit('LOADING', res)
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
