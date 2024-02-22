<template>
	<div class="distribution">
		<div class="box-shadow mb-24">
			<a-space direction="vertical" size="large" class="w-100">
				<a-space size="large">
					<a-icon type="bank" theme="filled" class="primary-icon" />
					<div class="font-16">分销代理</div>
				</a-space>
				<div class="flex between-center font-14 secondary-color">
					<a-space direction="vertical">
						<div>
							分销代理的Polymesh账户
							<a-tooltip>
								<template #title>默认情况下，您的polymesh账户被分配为分发代理的polymesh账户。目前不能通过令牌工作室进行更改</template>
								<a-icon type="info-circle" class="primary-color" />
							</a-tooltip>
						</div>
						<div class="title-color">{{ showDid }}</div>
					</a-space>
					<a-space direction="vertical">
						<div>分销代理余额</div>
						<a-space align="baseline">
							<span class="font-32 weight-500 title-color">{{ balance }}</span>
							{{ ticker }}
						</a-space>
					</a-space>
					<a-space size="large">
						<a-button type="primary" :disabled="!showDid" @click="visible=true">铸币</a-button>
						<a-button :disabled="!balance || !showDid" @click="disTokens">分发</a-button>
						<a-button :disabled="!balance || !showDid" @click="visibleBurnbalance=true">销毁</a-button>
					</a-space>
				</div>
			</a-space>
		</div>
		<a-space direction="vertical" size="large" class="box-shadow mb-24">
			<div class="font-16">分发</div>
			<span class="font-14 secondary-color" style="line-height: 22px;">
				分发您的资产是一个简单的两步过程。 首先，您需要为分发代理铸币。 从那里，分发代理可以通过输入他们的 Polymesh ID 并指定要分发给该 ID 的数量来将资产分发给他们的持有者。 只有符合代币合规规则的 ID 才有机会接受或拒绝分发。
			</span>
			<a-tips title="重要提示" :bgSize="66">要接收您的资产，资产持有人需要在平台接受转账。</a-tips>
		</a-space>
		<div class="box-shadow mb-24">
			<div class="flex between-center mb-24">
				<div class="font-16">资产分布</div>
				<a-space size="middle">
					<div class="last-time font-12 secondary-color">{{ table1Time }}</div>
					<a-button type="link" icon="redo" size="small" class="font-12" @click="getAssetHolders">刷新</a-button>
				</a-space>
			</div>
			<div class="flex mb-24 font-14 secondary-color">
				<a-space direction="vertical" class="item-w210 mr-80">
					<a-icon type="money-collect" theme="filled" class="primary-icon" />
					<div class="mt-16">未偿还总额</div>
					<a-space align="baseline">
						<span class="font-32 weight-500 title-color">{{ totalOutstanding }}</span>
						{{ ticker }}
					</a-space>
				</a-space>
				<a-space direction="vertical" class="item-w210">
					<a-icon type="idcard" theme="filled" class="primary-icon" />
					<div class="mt-16">
						持有者总数
						<a-tooltip>
							<template #title>不包括分销代理</template>
							<a-icon type="info-circle" class="font-14 primary-color" />
						</a-tooltip>
					</div>
					<div class="font-32 weight-500 title-color">{{ table1Data.length }}</div>
				</a-space>
			</div>
			<a-table :rowKey="(record, index) => { return index }" :columns="columns" :data-source="table1Data" :loading="table1Loading" :pagination="false">
				<template #amount="text">
					{{ text }} {{ ticker }}
				</template>
				<template #action="record">
					<a-button type="link" class="p-0" @click="table1edit(record)">分发</a-button>
				</template>
			</a-table>
		</div>
		<div class="box-shadow">
			<div class="flex between-center mb-24">
				<div class="font-16">等待分布</div>
				<a-space size="middle">
					<div class="last-time font-12 secondary-color">{{ table2Time }}</div>
					<a-button type="link" icon="redo" size="small" class="font-12" @click="getPendingData">刷新</a-button>
					<a-button v-if="table2Data.length > 0" type="primary" @click="cancelAll">取消所有</a-button>
				</a-space>
			</div>
			<a-table :rowKey="(record, index) => { return index }" :columns="columns2" :data-source="table2Data" :loading="table2Loading" :pagination="false">
				<template #amount="text">
					{{ text }} {{ ticker }}
				</template>
				<template #status>
					<a-icon type="clock-circle" theme="filled" class="font-18" /> 等待中
				</template>
				<template #action="record">
					<a-button type="link" class="error-color p-0" @click="table2edit(record)">取消</a-button>
				</template>
			</a-table>
		</div>
		<MintTokens
			:visible="visible"
			:did="did"
			@close="close"
		/>
		<Distributetokens
			v-if="visibleDistribute"
			:account="editAccount"
			:balance="balance"
			:balanceFree="balanceFree"
			@close="close"
		/>
		<Burnbalance
			:visible="visibleBurnbalance"
			@close="close"
		/>
	</div>
</template>

<script>
import { BigNumber } from '@polymeshassociation/polymesh-sdk'
import ATips from '@/views/components/aTips'
import MintTokens from './component/mintTokens'
import Distributetokens from './component/distributeTokens'
import Burnbalance from './component/burnBalance'

const columns = [
	{
		title: 'Polymesh账户',
		dataIndex: 'account',
		key: 'account',
		class: 'account',
		customRender: (account) => {
			return `${account.substr(0, 7)}...${account.substr(-7)}`
		}
	}, {
		title: '数量',
		dataIndex: 'amount',
		key: 'amount',
		scopedSlots: { customRender: 'amount' }
	}, {
		title: '操作',
		key: 'action',
		scopedSlots: { customRender: 'action' }
	}
]
const columns2 = [
	{
		title: '分发事件',
		dataIndex: 'description',
		key: 'description'
	}, {
		title: '接收Polymesh账户',
		dataIndex: 'to',
		key: 'to',
		customRender: (to) => {
			const account = to.owner.did
			return `${account.substr(0, 7)}...${account.substr(-7)}`
		}
	}, {
		title: '状态',
		dataIndex: 'status',
		key: 'status',
		scopedSlots: { customRender: 'status' }
	}, {
		title: '数量',
		dataIndex: 'amount',
		key: 'amount',
		scopedSlots: { customRender: 'amount' }
	}, {
		title: '操作',
		key: 'action',
		scopedSlots: { customRender: 'action' }
	}
]
export default {
	name: 'Distribution',
	components: {
		ATips,
		MintTokens,
		Distributetokens,
		Burnbalance
	},
	data(){
		return {
			columns,
			columns2,
			table1Data: [],
			table2Data: [],
			table1Loading: false,
			table2Loading: false,
			table1Time: '',
			table2Time: '',
			balance: '0.00',
			balanceFree: '',
			editAccount: '',
			totalOutstanding: '',
			did: '',
			showDid: '',
			distributions: null,
			visible: false,
			visibleDistribute: false,
			visibleBurnbalance: false
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler() {
				this.$router.replace('/tokenStudio')
			}
		}
	},
	created(){
		this.initPageInfo()
	},
	methods: {
		async initPageInfo() {
			this.ticker = this.$route.params.ticker
			this.asset = await this.api.assets.getAsset({
				ticker: this.ticker
			})
			this.identity = await this.api.getSigningIdentity()
			this.agents = await this.asset.permissions.getAgents()
			this.did = this.identity.did
			this.agentsDids = this.agents.map(i => i.agent.did)
			if (this.agentsDids.includes(this.did)) {
				this.showDid = `${this.did.substr(0, 14)}...${this.did.substr(-14)}`
			}
			this.getAssetBalance()
			this.getAssetHolders()
			this.getPendingData()
		},

		async getPendingData(){
			this.table2Loading = true
			const datas = await this.identity.getPendingInstructions()
			this.table2Data = []
			datas.forEach(async(item) => {
				const legs = await item.getLegs()
				const detail = await item.details()
				const venue = await detail.venue.details()
				legs.data.forEach(leg => {
					if (leg.asset.ticker === this.ticker && venue.type === 'Distribution'){
						this.table2Data.push({ ...leg, ...detail, ...venue, curItem: item })
					}
				})
			})
			this.table2Time = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
			this.table2Loading = false
		},

		async getAssetHolders(){
			this.table1Loading = true
			this.table1Data = []
			this.totalOutstanding = '0.00'
			let total = 0
			const assets = await this.asset.assetHolders.get()
			assets.data.forEach(i => {
				const _did = i.identity.did
				if (_did !== this.identity.did) {
					total += i.balance.toNumber()
				}
				if (!this.agentsDids.includes(_did)) {
					const obj = {
						amount: i.balance.toFormat(),
						account: _did
					}
					this.table1Data.push(obj)
				}
			})
			this.totalOutstanding = new BigNumber(total).toFormat()
			this.table1Time = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
			this.table1Loading = false
		},

		async getAssetBalance(){
			const portfolio = await this.identity.portfolios.getPortfolio()
			const balances = await portfolio.getAssetBalances()
			const tickers = balances.filter(i => i.asset.ticker === this.ticker)
			this.balance = tickers[0]?.total.toFormat()
			this.balanceFree = tickers[0]?.free.toFormat()
		},

		close(e){
			this.visible = false
			this.visibleDistribute = false
			this.visibleBurnbalance = false
			this.editAccount = ''
			if (e === 'success') {
				this.getAssetBalance()
			} else if (e === 'distribute') {
				this.getAssetBalance()
				this.getPendingData()
			}
		},

		disTokens(){
			this.editAccount = ''
			this.visibleDistribute = true
		},

		table1edit(row){
			this.editAccount = row.account
			this.visibleDistribute = true
		},

		async cancelAll(){
			try {
				let calls = this.table2Data.map(async(item) => await item.curItem.reject())
				calls = await Promise.all(calls)
				this.$notification.warn({
					key: 'rejects',
					message: '执行中',
					description: `取消所有令牌分发...`,
					duration: 0
				})
				const batchTx = await this.api.createTransactionBatch({
					transactions: calls
				})
				await batchTx.run()
				this.$notification.success({
					key: 'rejects',
					message: '执行成功',
					description: `取消所有令牌分发...`,
					duration: 0
				})
				this.getPendingData()
			} catch (error) {
				this.$notification.destroy()
				this.$message.error(error.message)
			}
		},

		async table2edit(row){
			try {
				this.$notification.warn({
					key: 'reject',
					message: '执行中',
					description: `取消令牌分发...`,
					duration: 0
				})
				const reject = await row.curItem.reject()
				await reject.run()
				this.$notification.success({
					key: 'reject',
					message: '执行成功',
					description: `取消令牌分发...`,
					duration: 0
				})
				this.getPendingData()
			} catch (error) {
				this.$notification.destroy()
				this.$message.error(error.message)
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.flex{
	display: flex;
	&.between-center{
		justify-content: space-between;
		align-items: center;
	}
}
.w-100{
	width: 100%;
}
.item-w210{
	width: 210px;
}
</style>
