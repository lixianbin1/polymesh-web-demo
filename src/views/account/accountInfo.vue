<template>
	<!-- <a-col :span="24"> -->
	<a-row v-if="did" class="box-shadow" type="flex" justify="space-between" align="middle">
		<a-space size="large">
			<a-icon class="primary-icon" type="money-collect" />
			<a-space direction="vertical">
				<a-space class="secondary-color">您的Polymesh账户<a-tag color="green">已验证</a-tag></a-space>
				<div>{{ did.slice(0,20) }}...{{ did.slice(-20) }}</div>
				<a-space size="large">
					<a-space><span class="secondary-color">账户使用期限</span>{{ cddInfo.expiry?FormatTime(cddInfo.expiry):'无限' }}</a-space>
					<a-space><span class="secondary-color">核实人</span>{{ issuerDid.slice(0,10)+'...'+issuerDid.slice(-10) }}</a-space>
				</a-space>
			</a-space>
		</a-space>
	</a-row>

	<a-row v-else class="box-shadow" type="flex" justify="space-between" align="middle">
		<a-space size="large">
			<a-icon class="primary-icon" type="money-collect" />
			<a-space direction="vertical">
				<div class="font-32">您的账户不完整！</div>
				<div>当前账户未进行身份认证，要使用此账户，请进行身份认证，或将此账号分配给另一个已认证的账户作为辅助账户。</div>
			</a-space>
		</a-space>
	</a-row>
	<!-- </a-col> -->
</template>

<script>
import { FormatTime } from '@/lib/common'

export default {
	name: 'AccountInfo',
	data() {
		return {
			FormatTime,
			did: '',
			issuerDid: '',
			cddInfo: {},
			loading: true
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler(address) {
				this.init()
			}
		},
		'$store.state.Account.update': {
			handler(up) {
				this.init()
			}
		}
	},
	mounted() {
		this.init()
	},
	methods: {
		async init(){
			this.reset()
			const identity = await this.$account.getIdentity()
			if (identity){
				this.did = identity.did
				this.getCddClaims()
			}
		},
		reset(){
			this.did = ''
			this.issuerDid = ''
			this.loading = true
			this.cddInfo = {}
		},
		// 获取CDD身份信息
		async getCddClaims(){
			const CddClaims = await this.api.claims.getCddClaims()
			this.cddInfo = CddClaims[0]
			this.issuerDid = this.cddInfo.issuer.did
			this.loading = false
		}
	}
}
</script>

<style lang="scss" scoped>

</style>
