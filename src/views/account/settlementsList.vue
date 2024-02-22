<template>
	<a-col :span="24">
		<div class="box-shadow">
			<a-row type="flex" justify="space-between" class="mb-24">
				<a-space size="middle">
					<span class="font-16">结算</span>
				</a-space>
				<a-space size="middle">
					<span>{{ time }}</span>
					<a-button type="link" size="small" style="padding:0;" @click="refresh"><a-icon type="sync" />刷新</a-button>
				</a-space>
			</a-row>
			<a-row>
				<a-tabs default-active-key="1">
					<a-tab-pane key="1">
						<span slot="tab">
							<span>传入分发</span>
							<span class="antd-tabs-number">{{ arrayData[0].length }}</span>
						</span>
						<SettlementsTable :columns="columns" :toData="arrayData[0]" :loading="loading" @refresh="update" />
					</a-tab-pane>
					<a-tab-pane key="2">
						<span slot="tab">
							<span>传入转账</span>
							<span class="antd-tabs-number">{{ arrayData[1].length }}</span>
						</span>
						<SettlementsTable :columns="columns" :toData="arrayData[1]" :loading="loading" @refresh="update" />
					</a-tab-pane>
					<a-tab-pane key="3">
						<span slot="tab">
							<span>传出转账</span>
							<span class="antd-tabs-number">{{ arrayData[2].length }}</span>
						</span>
						<SettlementsTable :columns="columns2" :toData="arrayData[2]" :loading="loading" @refresh="update" />
					</a-tab-pane>
					<a-tab-pane key="4">
						<span slot="tab">
							<span>传入股息</span>
							<span class="antd-tabs-number">{{ arrayData[3].length }}</span>
						</span>
						<SettlementsTable :columns="columns4" :toData="arrayData[3]" :loading="loading" @refresh="update" />
					</a-tab-pane>
				</a-tabs>
			</a-row>
		</div>
	</a-col>
</template>

<script>
const columns = [
	{
		title: '创建时间',
		dataIndex: 'createdAt',
		width: '20%',
		align: 'left',
		scopedSlots: { customRender: 'createdAt' }
	},
	{
		dataIndex: 'Token',
		width: '20%',
		align: 'left',
		key: 'Token',
		title: '代币',
		scopedSlots: { customRender: 'Token' }
	},
	{
		title: '发送人',
		dataIndex: 'sender',
		width: '20%',
		align: 'left',
		key: 'sender',
		scopedSlots: { customRender: 'sender' }
	},
	{
		title: '代币数量',
		dataIndex: 'Amount',
		width: '20%',
		align: 'left',
		key: 'Amount',
		scopedSlots: { customRender: 'Amount' }
	}, {
		title: '操作',
		dataIndex: 'action',
		width: '20%',
		align: 'right',
		key: 'action',
		scopedSlots: { customRender: 'action' }
	}
]
const columns2 = [
	{
		title: '创建时间',
		dataIndex: 'createdAt',
		width: '15%',
		align: 'left',
		scopedSlots: { customRender: 'createdAt' }
	},
	{
		dataIndex: 'Token',
		width: '15%',
		align: 'left',
		key: 'Token',
		title: '代币',
		scopedSlots: { customRender: 'Token' }
	},
	{
		title: '发送人',
		dataIndex: 'sender',
		width: '15%',
		align: 'left',
		key: 'sender',
		scopedSlots: { customRender: 'sender' }
	},
	{
		title: '接收人',
		dataIndex: 'receive',
		width: '15%',
		align: 'left',
		key: 'receive',
		scopedSlots: { customRender: 'receive' }
	},
	{
		title: '代币数量',
		dataIndex: 'Amount',
		width: '20%',
		align: 'left',
		key: 'Amount',
		scopedSlots: { customRender: 'Amount' }
	},
	{
		title: '场地ID',
		dataIndex: 'venueId',
		width: '10%',
		align: 'left',
		key: 'venueId',
		scopedSlots: { customRender: 'venueId' }
	},
	{
		title: '操作',
		dataIndex: 'action3',
		width: '20%',
		align: 'right',
		key: 'action3',
		scopedSlots: { customRender: 'action3' }
	}
]
const columns4 = [{
	dataIndex: 'asset',
	width: '20%',
	key: 'asset',
	title: '资产',
	scopedSlots: { customRender: 'asset' }
},
{
	title: '申报日期',
	dataIndex: 'declarationDate',
	width: '20%',
	key: 'declarationDate',
	scopedSlots: { customRender: 'declarationDate' }
},
{
	title: '有效期',
	dataIndex: 'expiryDate',
	width: '20%',
	key: 'expiryDate',
	scopedSlots: { customRender: 'expiryDate' }
}, {
	title: '股息',
	dataIndex: 'mount',
	width: '20%',
	key: 'mount',
	scopedSlots: { customRender: 'mount' }
}, {
	title: '描述',
	dataIndex: 'description',
	width: '15%',
	key: 'description',
	scopedSlots: { customRender: 'description' }
}, {
	title: '操作',
	dataIndex: 'action2',
	width: '5%',
	key: 'action2',
	scopedSlots: { customRender: 'action2' }
}]
import { BigNumber } from '@polymeshassociation/polymesh-sdk'
import SettlementsTable from '@/views/account/settlementsTable'
export default {
	name: 'SettlementsList',
	components: { SettlementsTable },
	props: {

	},
	data(){
		return {
			loading: true,
			identity: null,
			data: [],
			arrayDataCopy: [[], [], [], []],
			arrayData: [[], [], [], []],
			columns,
			columns2,
			columns4,
			time: ''
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler(address) {
				this.reset()
				this.init(address)
			}
		}
	},
	mounted(){
		this.init()
	},
	methods: {
		reset(){
			this.loading = true
			this.identity = null
			this.arrayData = [[], [], [], []]
		},
		async init(){
			const identity = await this.$account.getIdentity()
			this.identity = identity
			if (identity){
				this.getTable()
			} else {
				this.loading = false
			}
		},
		async getTable(){
			this.time = this.getTime()
			await this.getDistribution()
			await this.getVenues()
			this.loading = true
			var array = []; var key = 0; var type
			const identity = this.identity
			const Instructions = await identity.getInstructions()
			const portfolioses = Instructions.pending
			if (!portfolioses.length){ this.loading = false }
			if (!portfolioses.length){ this.setData() }
			portfolioses.map(async(item) => {
				const legs = await item.getLegs()
				const detail = await item.details()
				const venue = await detail.venue.details()
				legs.data.map(async(leg, i) => {
					this.loading = true
					if (leg.from.owner.did === identity.did || leg.to.owner.did === identity.did){
						const check = await leg.asset.settlements.canTransfer({
							...leg,
							amount: new BigNumber(0)
						})
						const details = await leg.asset.details()
						var title = ''
						title = this.errorTitle(check)
						if (leg.from.owner.did === identity.did){
							type = 'from'
						} else {
							type = 'to'
						}
						try {
							array.push({
								title,
								createdAt: detail.createdAt,
								check: check,
								key: key++,
								name: details.name,
								Token: leg.asset.ticker,
								sender: leg.from.owner.did,
								Amount: new BigNumber(leg.amount).toFormat(0),
								Instruction: item,
								venue: venue,
								type
							})
						} catch (err){
							this.errData = err
						}
						this.setData()
						this.loading = false
					}
				})
			})
			this.data = array
		},
		async getVenues() {
			const venues = await this.identity.getVenues()
			const fetchInstructions = await Promise.all(
				venues.map(async venue => {
					const fetchInstructions = await venue.fetchInstructions()
					// const getInstructions = await venue.getInstructions()
					// const getPendingInstructions = await venue.getPendingInstructions()
					// console.log('fetchInstructions@@@', fetchInstructions)
					return [...fetchInstructions]
				})
			)
			const instrutions = (await Promise.all(
				[].concat.apply([], fetchInstructions).map(async (instrution, index) => {
					const details = await instrution.details()
					const { data } = await instrution.getLegs()
					const [{ from, to, amount, asset }] = data
					const { name } = await asset.details()
					const check = await asset.settlements.canTransfer({
						...data[0],
						amount: new BigNumber(0)
					})
					const title = this.errorTitle(check)
					const { data: affirmations } = await instrution.getAffirmations()
					return {
						...details,
						key: index,
						Amount: new BigNumber(amount).toFormat(0),
						sender: from.owner.did,
						receive: to.owner.did,
						Token: asset.ticker,
						Instruction: instrution,
						name,
						check,
						title,
						affirmations
					}
				})
			)).sort((a, b) => b.createdAt - a.createdAt)
			this.$set(this.arrayDataCopy, 2, instrutions)
			return Promise.resolve()
		},
		errorTitle(check){
			var title = ''
			if (!check.result){
				if (!check.compliance.complies){
					title = '合规性检查未通过,无法接收.'
				}
				if (check.general.length){
					switch (check.general[0]){
					case 'InsufficientBalance':
						title = '发送方没有足够的余额来支付金额.'
						break
					case 'InsufficientPortfolioBalance':
						title = '发送方的投资组合没有足够的余额来支付金额.'
						break
					case 'InvalidGranularity':
						title = '无效的传输额度.'
						break
					case 'InvalidReceiverCdd':
						title = '接收方没有进行CDD认证.'
						break
					case 'InvalidReceiverPortfolio':
						title = '接受方投资组合不存在.'
						break
					case 'InvalidSenderCdd':
						title = '发送方没有进行CDD认证.'
						break
					case 'InvalidSenderPortfolio':
						title = '发件人投资组合不存在.'
						break
					case 'ScopeClaimMissing':
						title = '没有有效的资产投资者唯一性声明.'
						break
					case 'SelfTransfer':
						title = '自转无效.'
						break
					case 'TransfersFrozen':
						title = '资产被冻结.'
						break
					}
				}
				if (check.restrictions.length){
					title = '转移限制检查未通过,无法接收.'
				}
			}
			return title
		},
		async getDistribution(){
			const identity = this.identity; var key = 0
			const Distribution = await identity.getPendingDistributions()
			const array = (await Promise.all(Distribution.map(async(item) => {
				const detail = await item.distribution.asset.details()
				const idents = await item.distribution.getParticipant()
				var title = ''
				if (!idents){ title = '检查点无该参与者,无法确定分配参与者的相应付款.' }
				return {
					flag: item.distribution.toHuman().targets.identities.indexOf(identity.did) > -1,
					title,
					key: key++,
					name: detail.name,
					result: !!idents,
					mount: idents?.amount ? new BigNumber(idents?.amount).toFormat(2) : undefined,
					description: item.distribution.description,
					expiryDate: this.getTime(item.distribution.expiryDate),
					declarationDate: this.getTime(item.distribution.declarationDate),
					createdAt: item.distribution.declarationDate,
					currency: item.distribution.currency,
					asset: item.distribution.asset,
					distribution: item.distribution
				}
			}))).filter((item) => item.flag).sort((a, b) => a.createdAt >= b.createdAt)
			this.arrayDataCopy[3] = array
		},
		checkAuthor(action){
			if (action.accountFrozen){
				return false
			}
		},
		setData(){
			const data = this.data
			var array = [[], [], [], []]
			data.forEach(item => {
				if (item.venue.type === 'Distribution'){
					array[0].push(item)
				} else {
					if (item.type === 'to'){
						array[1].push(item)
					}
				}
			})
			array[0].sort((a, b) => b.createdAt - a.createdAt)
			array[1].sort((a, b) => b.createdAt - a.createdAt)
			// array[2].sort((a, b) => b.createdAt - a.createdAt)
			this.arrayData[0] = array[0]
			this.arrayData[1] = array[1]
			this.arrayData[2] = this.arrayDataCopy[2]
			this.arrayData[3] = this.arrayDataCopy[3]
			// this.arrayData[2] = array[2]
		},
		refresh(){
			if (!this.loading){
				this.reset()
				this.init()
			}
		},
		update(){
			this.$emit('update')
			this.refresh()
		},
		getTime(newDate = new Date()){
			if (newDate == null){
				return null
			}
			const time = new Date(newDate)
			var year = time.getFullYear()
			var Month = time.getMonth() + 1
			var day = time.getDate()
			var Hours = time.getHours()
			var Minu = time.getMinutes()
			var Secon = time.getSeconds()
			Month > 9 ? Month : Month = '0' + Month
			day > 9 ? day : day = '0' + day
			Hours > 9 ? Hours : Hours = '0' + Hours
			Minu > 9 ? Minu : Minu = '0' + Minu
			Secon > 9 ? Secon : Secon = '0' + Secon
			return year + '/' + Month + '/' + day + ' ' + Hours + ':' + Minu + ':' + Secon
		}
	}
}
</script>
<style scoped>
</style>
