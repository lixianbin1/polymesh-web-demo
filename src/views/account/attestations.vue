<template>
	<a-col :span="24">
		<div v-if="loading" class="box-shadow">
			<a-skeleton active :loading="loading" :paragraph="{ rows: 8 }" />
		</div>
		<div v-show="!loading" class="box-shadow">
			<a-row type="flex" justify="space-between" class="mb-24">
				<a-space size="middle">
					<span class="font-16">Attestations</span>
					<a-select style="width: 200px" :value="ticker" @change="scopesChange">
						<a-select-option v-for="item in tickers" :key="item.ticker" :value="item.ticker">{{ item.ticker }}</a-select-option>
					</a-select>
				</a-space>
				<a-space size="middle">
					<span>{{ time }}</span>
					<a-button type="link" size="small" style="padding:0;" @click="refresh"><a-icon type="sync" />刷新</a-button>
				</a-space>
			</a-row>
			<a-table
				class="table"
				:columns="columns"
				:data-source="tableData"
				:pagination="{pageSize:10}"
				:loading="loading"
			>
				<template #IssuedBy="IssuedBy">{{ IssuedBy.did.slice(0,20)+'...'+IssuedBy.did.slice(-20) }}</template>
				<template #BuyLockup="BuyLockup">
					<a-space v-if="BuyLockup===null">无期限</a-space>
					<a-space v-else-if="!BuyLockup">
						<a-icon type="minus-circle" class="font-16" />
					</a-space>
					<a-space v-else>{{ BuyLockup.toLocaleDateString() }}</a-space>
				</template>
				<template #SellLockup="SellLockup">
					<a-space v-if="SellLockup===null">无期限</a-space>
					<a-space v-else-if="!SellLockup">
						<a-icon type="minus-circle" class="font-16" />
					</a-space>
					<a-space v-else>{{ SellLockup.toLocaleDateString() }}</a-space>
				</template>
				<template #KnowYourCustomer="KnowYourCustomer">
					<a-space v-if="KnowYourCustomer===null">无期限</a-space>
					<a-space v-else-if="!KnowYourCustomer">
						<a-icon type="minus-circle" class="font-16" />
					</a-space>
					<a-space v-else>{{ KnowYourCustomer.toLocaleDateString() }}</a-space>
				</template>
				<template #Jurisdiction="Jurisdiction">
					<a-space v-if="Jurisdiction">{{ Jurisdiction }}</a-space>
					<a-space v-else>
						<a-icon type="minus-circle" class="font-16" />
					</a-space>
				</template>
				<template #Accredited="Accredited">
					<a-space v-if="Accredited===null">
						<a-icon type="check-circle" style="color: #1890ff;" />
					</a-space>
					<a-space v-else>
						<a-icon type="minus-circle" class="font-16" />
					</a-space>
				</template>
				<template #Affiliate="Affiliate">
					<a-space v-if="Affiliate===null">
						<a-icon type="check-circle" style="color: #1890ff;" />
					</a-space>
					<a-space v-else>
						<a-icon type="minus-circle" class="font-16" />
					</a-space>
				</template>
				<template #Exempted="Exempted">
					<a-space v-if="Exempted===null">
						<a-icon type="check-circle" style="color: #1890ff;" />
					</a-space>
					<a-space v-else>
						<a-icon type="minus-circle" class="font-16" />
					</a-space>
				</template>
				<template #Blocked="Blocked">
					<a-space v-if="Blocked===null">
						<a-icon type="check-circle" style="color: #1890ff;" />
					</a-space>
					<a-space v-else>
						<a-icon type="minus-circle" class="font-16" />
					</a-space>
				</template>
			</a-table>
		</div>
	</a-col>
</template>

<script>
export default {
	name: 'Attestations',
	components: { },
	data() {
		return {
			tickers: [],
			ticker: null,
			columns: [
				{
					title: 'Issued by',
					dataIndex: 'IssuedBy',
					key: 'IssuedBy',
					align: 'left',
					scopedSlots: { customRender: 'IssuedBy' }
				},
				{
					title: 'Buy Lockup',
					align: 'left',
					key: 'BuyLockup',
					dataIndex: 'BuyLockup',
					scopedSlots: { customRender: 'BuyLockup' }
				},
				{
					title: 'Sell Lockup',
					dataIndex: 'SellLockup',
					align: 'left',
					key: 'SellLockup',
					scopedSlots: { customRender: 'SellLockup' }
				},
				{
					title: 'KYC',
					dataIndex: 'KnowYourCustomer',
					align: 'left',
					key: 'KnowYourCustomer',
					scopedSlots: { customRender: 'KnowYourCustomer' }
				},
				{
					title: 'Jurisdiction',
					dataIndex: 'Jurisdiction',
					align: 'left',
					key: 'Jurisdiction',
					scopedSlots: { customRender: 'Jurisdiction' }
				},
				{
					title: 'Accredited',
					dataIndex: 'Accredited',
					align: 'left',
					key: 'Accredited',
					scopedSlots: { customRender: 'Accredited' }
				},
				{
					title: 'Affiliate',
					dataIndex: 'Affiliate',
					align: 'left',
					key: 'Affiliate',
					scopedSlots: { customRender: 'Affiliate' }
				},
				{
					title: 'Exempted',
					dataIndex: 'Exempted',
					align: 'left',
					key: 'Exempted',
					scopedSlots: { customRender: 'Exempted' }
				},
				{
					title: 'Blocked',
					dataIndex: 'Blocked',
					align: 'left',
					key: 'Blocked',
					scopedSlots: { customRender: 'Blocked' }
				}],
			loading: true,
			identity: null,
			tableData: [],
			time: ''
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler(address) {
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
			this.identity = identity
			if (this.identity){
				await this.getScopes()
				await this.getInfo()
			}
			this.loading = false
		},
		// 獲取下拉數據
		async getScopes(){
			const scopes = await this.api.claims.getClaimScopes()
			scopes.length ? this.ticker = scopes[0].ticker : null
			this.tickers = scopes
		},
		reset(){
			this.tickers = []
			this.ticker = null
			this.loading = true
			this.identity = null
			this.tableData = []
		},
		// 获取详情
		async getInfo(){
			this.time = new Date().format('yyyy/MM/dd hh:mm:ss')
			try {
				if (this.ticker === null){ return false }
				const ticker = await this.api.assets.getAsset({ ticker: this.ticker })
				const compliance = await ticker.compliance.trustedClaimIssuers.get()
				const claims = await Promise.all(compliance.map(item => {
					const claim = this.api.claims.getIssuedClaims({
						includeExpired: true,
						target: item.identity.did
					})
					return claim
				}))
				var Double = []
				for (const i in claims){
					var array = []
					claims[i].data.map(item => {
						if (item.claim.scope.value === this.ticker && item.target.isEqual(this.identity)){
							array.push(item)
						}
					})
					if (array.length){
						Double.push(this.setTableData(array, i))
					}
				}
				this.tableData = Double
			} catch (err){
				this.tableData = []
			}
		},
		// 处理数据
		setTableData(data, i){
			const obj = { key: data[0].issuer.did }
			data.map(item => {
				obj.IssuedBy = item.issuer
				if (item.claim.type === 'Jurisdiction'){
					obj[item.claim.type] = item.claim.code
				} else {
					obj[item.claim.type] = item.expiry
				}
			})
			return obj
		},
		// 改变下拉数据
		async scopesChange(val){
			this.ticker = val
			this.loading = true
			await this.getInfo()
			this.loading = false
		},
		// 刷新数据
		async refresh(){
			this.loading = true
			await this.getInfo()
			this.loading = false
		}
	}
}
</script>

<style lang="scss" scoped>

</style>
