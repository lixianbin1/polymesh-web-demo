<template>
	<div>
		<a-row type="flex" :gutter="[24, 24]">
			<a-col :span="24">
				<div v-if="loading2" class="box-shadow">
					<a-skeleton active :loading="loading2" />
				</div>
				<div v-else>
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
						<a-button><router-link to="account">详情</router-link></a-button>
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
				</div>
			</a-col>
			<a-col :span="12">
				<div class="box-shadow h-100">
					<a-space direction="vertical" size="large">
						<a-icon class="primary-icon" type="money-collect" />
						<a-space direction="vertical">
							<div class="secondary-color">您的总余额</div>
							<a-space align="baseline">
								<span class="font-32">{{ balance.total || 0 }}</span>
								<span class="secondary-color">POLYX</span>
							</a-space>
						</a-space>
						<a-space :size="80">
							<a-space direction="vertical">
								<a-space align="end" class="secondary-color"><span class="font-24 primary-color">{{ balance.free || 0 }}</span>POLYX</a-space>
								<div class="secondary-color">当前可使用余额</div>
							</a-space>
							<a-space direction="vertical">
								<a-space align="end" class="secondary-color"><span class="font-24">{{ balance.locked || 0 }}</span>POLYX</a-space>
								<div class="secondary-color">当前不可使用余额</div>
							</a-space>
						</a-space>
					</a-space>
					<div class="mt-32">
						<a-button type="primary" @click="$refs.transferAccount.toggle()"><a-icon type="swap" />转账</a-button>
					</div>
				</div>
			</a-col>
			<a-col :span="12">
				<div class="box-shadow h-100">
					<a-row type="flex" justify="space-between" class="mb-24">
						<div class="font-16">投资组合</div>
						<a-space size="middle">
							<span>{{ new Date().format('yyyy/MM/dd hh:mm:ss') }}</span>
							<a-button type="link" size="small" style="padding:0;" @click="reload('getPortfolios')"><a-icon type="sync" />刷新</a-button>
						</a-space>
					</a-row>
					<a-table
						:columns="[
							{title:'投资组合',dataIndex:'name'},
							{title:'资产数',dataIndex:'balances.length'}]"
						:data-source="portfolios"
						:pagination="portfolios.length>5?{pageSize:5}:false"
						:loading="loading.portfolios"
						:rowKey="item => item.name"
					></a-table>
				</div>
			</a-col>
			<a-col :span="24">
				<div class="box-shadow">
					<a-row type="flex" justify="space-between" class="mb-24">
						<div class="font-16">持有资产</div>
						<a-space size="middle">
							<span>{{ new Date().format('yyyy/MM/dd hh:mm:ss') }}</span>
							<a-button type="link" size="small" style="padding:0;" @click="reload('getAssetDetails')"><a-icon type="sync" />刷新</a-button>
						</a-space>
					</a-row>
					<a-table
						:columns="[
							{title:'name',dataIndex:'details.name'},
							{title:'assetType',dataIndex:'details.assetType'},
							{title:'balance',dataIndex:'balances.format.total',scopedSlots: { customRender: 'balance' }}]"
						:showHeader="false"
						:data-source="holdings"
						:pagination="holdings.length>5?{pageSize:5}:false"
						:rowKey="item => item.asset.ticker"
						:loading="loading.holdings"
						:customRow="holdingsRow"
					>
						<template #balance="total,r">{{ total }} {{ r.asset.ticker }}</template>
					</a-table>
				</div>
			</a-col>
			<a-col :span="24">
				<div class="box-shadow">
					<a-row type="flex" justify="space-between" class="mb-24">
						<a-space size="middle">
							<span class="font-16">操作记录</span>
							<a-select v-if="selectAccount.name" :value="selectAccount.name" style="width: 200px" @change="selectAccountChange">
								<a-select-option v-for="item in accounts" :key="item.meta?.name || item.account.address" :value="item.account.address">
									{{ item.meta?.name || item.account.address.slice(0,10)+'...'+item.account.address.slice(-10) }}
								</a-select-option>
							</a-select>
						</a-space>
						<a-space size="middle">
							<span>{{ new Date().format('yyyy/MM/dd hh:mm:ss') }}</span>
							<a-button type="link" size="small" style="padding:0;" @click="reload('getOperationRecord')"><a-icon type="sync" />刷新</a-button>
						</a-space>
					</a-row>
					<a-table
						class="table"
						:columns="columns"
						:data-source="operationRecord"
						:pagination="{pageSize:10}"
						:loading="loading.operationRecord"
						:rowKey="item => item.id"
					>
						<template #success="type">
							<a-tag
								:color="type?'rgb(212 247 231)':'rgb(250, 230, 232)'"
								:style="{color:type?'rgb(0, 170, 94)':'rgb(219, 44, 62)'}"
							>{{ type?'Success':'Failed' }}</a-tag>
						</template>
						<template #id="id">
							<a-icon type="link" style="color: #1890ff;margin-right: 5px" />
							<a :href="'https://polymesh-testnet.subscan.io/extrinsic/'+id" target="_blank">{{ id }}</a>
						</template>
					</a-table>
				</div>
			</a-col>
		</a-row>
		<TransferAccounts ref="transferAccount" :balance="balance" @transferPolyx="transferPolyx"></TransferAccounts>
		<HoldingsDetails :show="showHoldingDetails" :detail="holdingDetails" @ok="()=>{showHoldingDetails = false}"></HoldingsDetails>
	</div>
</template>

<script>
import { Account, Asset, Identity } from '@polymeshassociation/polymesh-sdk/internal'
import { FormatBalance } from '@/lib/common'
import { BigNumber } from '@polymeshassociation/polymesh-sdk'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import TransferAccounts from '@/views/Overview/TransferAccounts'
import HoldingsDetails from '@/views/Overview/HoldingsDetails'
const columns = [
	{ title: 'ID', dataIndex: 'id', scopedSlots: { customRender: 'id' }},
	{ title: '区块', dataIndex: 'block' },
	{ title: '事件模块', dataIndex: 'module' },
	{ title: '事件类型', dataIndex: 'call' },
	{ title: '状态', dataIndex: 'success', scopedSlots: { customRender: 'success' }}
]
export default {
	name: 'Overview',
	// eslint-disable-next-line vue/no-unused-components
	components: { TransferAccounts, HoldingsDetails },
	data() {
		return {
			did: '',
			issuerDid: '',
			cddInfo: {},
			loading2: true,
			loading: {},
			balance: {},
			operationRecord: [],
			holdings: [],
			holdingDetails: {},
			portfolios: [],
			allAssets: {},
			selectAccount: {},
			accounts: [],
			web3Data: [],
			showHoldingDetails: false,
			columns
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler(address) {
				if (address){
					this.init()
				}
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
				this.getPortfolios()
				this.getRelationAccount()
			}
			this.getBalance()
			this.getOperationRecord()
		},
		reset(){
			this.did = ''
			this.issuerDid = ''
			this.cddInfo = {}
			this.loading2 = true
		},
		// 获取CDD身份信息
		async getCddClaims(){
			const CddClaims = await this.api.claims.getCddClaims()
			this.cddInfo = CddClaims[0]
			this.issuerDid = this.cddInfo.issuer.did
			this.loading2 = false
		},
		// 获取余额
		async getBalance(){
			this.loading.balance = true
			const balanceBigNumber = await this.$account.getBalance()
			this.balance = FormatBalance(balanceBigNumber)
			this.loading.balance = false
			this.loading2 = false
		},
		// 获取投资组合
		async getPortfolios(){
			this.portfolios = []
			this.loading.holdings = true
			this.loading.portfolios = true
			const res = await new Identity({ did: this.did }, this.api.context)
			const portfolios = await res.portfolios.getPortfolios()
			const allAssets = {}
			for (const item of portfolios){
				if (item.constructor.name === 'NumberedPortfolio'){
					item.name = await item.getName()
				} else {
					item.name = '未分配资产'
				}
				const balancesArr = await item.getAssetBalances() || []
				if (balancesArr.length > 0){
					item.balances = balancesArr.map(b => {
						const key = b.asset.ticker
						const BN = new BigNumber(0)
						const balances = { free: BN, locked: BN, total: BN }
						allAssets[key] = allAssets[key] || { balances }
						let { free, locked, total } = allAssets[key].balances
						free = BigNumber.sum(free, b.free)
						locked = BigNumber.sum(locked, b.locked)
						total = BigNumber.sum(total, b.total)
						allAssets[key].balances.free = free
						allAssets[key].balances.locked = locked
						allAssets[key].balances.total = total
						allAssets[key].balances.format = FormatBalance({ free, locked, total })
						allAssets[key].asset = b.asset
						return {
							...b,
							format: FormatBalance(b)
						}
					}).filter(balance => balance.total.toNumber())
				}
			}
			this.portfolios = portfolios
			this.loading.portfolios = false
			this.allAssets = allAssets
			this.getAssetDetails()
		},
		// 获取各个资产详情
		async getAssetDetails(){
			this.holdings = []
			this.loading.holdings = true
			const allAssets = this.allAssets
			const holdings = []
			for (const key in allAssets){
				if (Object.hasOwnProperty.call(allAssets, key)){
					const item = allAssets[key]
					const asset = await new Asset({ ticker: item.asset.ticker }, this.api.context)
					const details = await asset.details()
					const round = await asset.currentFundingRound()
					const createdAt = await asset.createdAt()
					const blockNumber = new BigNumber(createdAt.blockNumber)
					const eventIndex = new BigNumber(createdAt.eventIndex)
					const id = blockNumber + '-' + eventIndex
					holdings.push({
						...item,
						details,
						round,
						createdAt,
						id,
						blockNumber,
						eventIndex
					})
				}
			}
			this.holdings = holdings.filter(asset => asset.balances.total.toNumber())
			this.loading.holdings = false
		},
		// 获取相关联账户
		async getRelationAccount(){
			web3Enable('polkadot-js/apps')
			const identity = await this.$account.getIdentity()
			const primary = (await identity.getPrimaryAccount()).account
			const secondary = (await identity.getSecondaryAccounts()).data
			const accounts = []
			const allAccount = await web3Accounts()
			const web3Data = {}
			allAccount.map(item => {
				web3Data[item.address] = item.meta
			})
			accounts.push({
				type: 'primary',
				account: primary,
				meta: web3Data[primary.address]
			})
			secondary.map(item => {
				accounts.push({
					type: 'secondary',
					account: item.account,
					meta: web3Data[item.account.address]
				})
			})
			this.web3Data = web3Data
			this.selectAccount = web3Data[this.$store.state.Account.address]
			this.accounts = accounts
		},
		// 获取交易(操作)记录
		async getOperationRecord(address){
			this.operationRecord = []
			this.loading.operationRecord = true
			address = address || this.$store.state.Account.address
			const account = new Account({ address }, this.api.context)
			const data = (await account.getTransactionHistory({ size: new BigNumber(9999) })).data || []
			data.reverse()
			data.forEach(item => {
				const block = new BigNumber(item.blockNumber)
				const txTagArr = item.txTag.split('.')
				item.id = block + '-' + new BigNumber(item.extrinsicIdx)
				item.block = block.toString()
				item.module = txTagArr[0].slice(0, 1).toUpperCase() + txTagArr[0].slice(1)
				item.call = txTagArr[1].slice(0, 1).toUpperCase() + txTagArr[1].slice(1)
			})
			this.operationRecord = data
			this.loading.operationRecord = false
		},
		selectAccountChange(e){
			this.selectAccount = this.web3Data[e] || {
				name: e
			}
			this.getOperationRecord(e)
		},
		holdingsRow(record){
			return {
				style: {
					cursor: 'pointer'
				},
				on: {
					click: () => {
						this.holdingDetails = record
						this.showHoldingDetails = true
					}
				}
			}
		},
		transferPolyx(status){
			if (status === 'Succeeded'){
				this.getBalance()
				this.getOperationRecord()
			}
		},
		reload(method){
			this[method]()
		}
	}
}
</script>

<style lang="scss" scoped>

</style>
