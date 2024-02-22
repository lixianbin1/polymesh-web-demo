<template>
	<div class="network">
		<a-row :gutter="[24, 24]">
			<a-col :span="12">
				<div class="box-shadow h-100">
					<div class="font-16 pb-24">Treasury账户信息</div>
					<a-spin :spinning="spinning">
						<a-descriptions :column="1" class="mt-24" :colon="false">
							<a-descriptions-item label="账户">  {{ did }}</a-descriptions-item>
							<a-descriptions-item label="地址">{{ address }}</a-descriptions-item>
							<a-descriptions-item label="可支配余额">{{ balance.free }}</a-descriptions-item>
							<a-descriptions-item label="锁定余额">{{ balance.locked }}</a-descriptions-item>
							<a-descriptions-item label="总计">{{ balance.total }}</a-descriptions-item>
						</a-descriptions>
					</a-spin>
				</div>
			</a-col>
			<a-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="network100">
				<div
					class="box-shadow h-100"
				>
					<div class="font-16 pb-24">网络属性</div>
					<a-spin :spinning="spinning3">
						<a-descriptions :column="1" class="mt-24" :colon="false">
							<a-descriptions-item label="网络名称">  {{ networkName }}</a-descriptions-item>
							<a-descriptions-item label="当前网络版本">  {{ version }}</a-descriptions-item>
							<a-descriptions-item label="运行时版本">  {{ networkVersion }}</a-descriptions-item>
							<!-- <a-descriptions-item label=" "> </a-descriptions-item>
							<a-descriptions-item label=" "> </a-descriptions-item> -->
						</a-descriptions>
					</a-spin>
				</div>
			</a-col>
		</a-row>

		<a-row :gutter="[24, 24]">
			<a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
				<div
					class="box-shadow h-100"
				>
					<div class="font-16 pb-24">协议费用查询</div>
					<a-spin :spinning="spinning2">
						<a-form
							class="mt-24"
							:model="formState"
							name="basic"
							layout="vertical"
							:wrapper-col="{ span: 10 }"
							autocomplete="off"
							:rules="rules"
							@finish="onFinish"
							@validate="handleValidate"
							@finishFailed="onFinishFailed"
						>
							<a-form-item label="模块名称" name="module" has-feedback>
								<a-select
									ref="select"
									v-model="formState.module"
									placeholder="请选择"
									@change="handleChange"
								>
									<a-select-option
										v-for="(item, index) in tags"
										:key="index"
										:value="item"
									>{{ item }}</a-select-option>
								</a-select>
							</a-form-item>
							<a-form-item label="协议名称" name="feesTag">
								<a-select
									ref="select"
									v-model="formState.feesTag"
									placeholder="请选择"
								>
									<a-select-option
										v-for="(item, key) in feeObj"
										:key="key"
										:value="item"
									>{{ key }}</a-select-option>
								</a-select>
							</a-form-item>
							<a-button type="primary" :loading="loading" @click="onSubmit">查询</a-button>
							<div
								v-if="tagfee != null"
								class="mt-24"
							>
								该协议的费用为：{{ tagfee }}
							</div>
						</a-form>
					</a-spin>
				</div>
			</a-col>
		</a-row>
		<a-row :gutter="[24, 24]">
			<a-col :span="24">
				<div class="box-shadow mb-24">
					<div class="font-16 mb-24">资产列表</div>
					<a-skeleton :active="true" :loading="assetsLoading"></a-skeleton>
					<a-table
						v-if="!assetsLoading"
						:dataSource="dataSource"
						:pagination="{pageSize:10}"
						:columns="columns"
						@change="tableChange"
					>
						<template #fullAgents="fullAgents,record">
							<a-tooltip
								v-if="record && record.details && record.details.fullAgents&& record.details.fullAgents.length>0"
								placement="topLeft"
								:title="record?.details?.fullAgents.length>0?record?.details?.fullAgents[0]?.did:'--'"
							>
								{{ record?.details?.fullAgents.length>0? record?.details?.fullAgents[0]?.did:'--' }}
							</a-tooltip>
						</template>
					<!-- :pagination="false" :bordered="true" :scroll="{ x: '100%' }" -->
					</a-table>
				</div>
			</a-col>
		</a-row>
	</div>
</template>

<script>
// import { TxTags } from '@/lib/TxTags'
import { ModuleName, TxTags } from '@polymeshassociation/polymesh-sdk/types'
export default {
	data() {
		return {
			networkName: '',
			networkVersion: '',
			spinning: false,
			spinning2: false,
			spinning3: false,
			did: '',
			address: '',
			balance: {
				free: '',
				locked: '',
				total: ''
			},
			version: '',
			formState: {
				module: undefined,
				feesTag: undefined
			},
			tags: Object.values(ModuleName),
			loading: false,
			rules: {
				module: [{ required: true, message: '请选择模块', trigger: 'change' }],
				feesTag: [{ required: true, message: '请选择tag', trigger: 'change' }]
			},
			tagfee: null,
			feeObj: {},
			current: 1,
			assetsLoading: false,
			start: null,
			dataSource: [],
			total: 0,
			fundingRoundList: [
				{ label: 'Angel', value: 'Angel' }, // 天使轮
				{ label: 'Pre-Seed', value: 'Pre-Seed' }, // Pre种子轮
				{ label: 'Seed', value: 'Seed' }, // 种子轮
				{ label: 'Venture - Series Unknown', value: 'Venture' }, // 创投
				{ label: 'Series A2', value: 'Series A1' }, // A轮
				{ label: 'Series B', value: 'Series B' }, // B轮
				{ label: 'Series C', value: 'Series C' }, // C轮
				{ label: 'Equity Crowdfunding', value: 'Equity Crowdfunding' }, // 股权众筹
				{ label: 'Private Equity', value: 'Private Equity' }, // 私募基金
				{ label: 'Convertible Note', value: 'Convertible Note' }, // 可转债
				{ label: 'Debt Financing', value: 'Debt Financing' }, // 债务融资
				{ label: 'Other', value: 'Other' } // 其他
			],
			columns: [
				{
					title: '股票代码',
					// width: 120,
					dataIndex: 'ticker',
					key: 'ticker'
				},
				{
					title: 'DID',
					width: 150,
					ellipsis: true,
					dataIndex: 'did',
					key: 'did',
					customRender: (text) => (
						<a-tooltip placement='topLeft' title={text}>
							{text}
						</a-tooltip>
					)
				},
				{
					title: '资产名称',
					// width: 150,
					dataIndex: 'assetsname',
					key: 'assetsname',
					customRender: (text, record) => {
						return record.details.name
					}
				},
				{
					title: '资产类型',
					// width: 150,
					dataIndex: 'assetType',
					key: 'assetType',
					customRender: (text, record) => {
						return record.details.assetType
					}
				},
				{
					title: '融资状态',
					// width: 150,
					dataIndex: 'fundingRound',
					key: 'fundingRound'
				},
				{
					title: '代理方',
					width: 150,
					ellipsis: true,
					dataIndex: 'fullAgents',
					key: 'fullAgents',
					scopedSlots: { customRender: 'fullAgents' }
				},
				{
					title: '所有者',
					width: 150,
					ellipsis: true,
					dataIndex: 'name',
					key: 'name',
					customRender: (text, record) => {
						return (
							<a-tooltip placement='topLeft' title={record.details.owner?.did}>
								{record.details.owner?.did}{' '}
							</a-tooltip>
						)
					}
				},
				{
					title: '投资者唯一性',
					dataIndex: 'requiresInvestorUniqueness',
					// width: 150,
					key: 'requiresInvestorUniqueness',
					customRender: (text, record) => {
						return record.details.requiresInvestorUniqueness ? '是' : '否'
					}
				},
				{
					title: '是否可分割',
					dataIndex: 'isDivisible',
					// width: 150,
					key: 'isDivisible',
					customRender: (text, record) => {
						return record.details.isDivisible ? '是' : '否'
					}
				},
				{
					title: '总供给量',
					dataIndex: 'totalSupply',
					// width: 150,
					key: 'totalSupply',
					customRender: (text, record) => {
						return record.details.totalSupply?.toFormat()
					}
				}
			]
		}
	},
	mounted() {
		this.getNetworkProperties()
		this.getTreasuryAccount()
		this.getVersion()
		this.getAllAssets(1)
	},
	methods: {
		handleValidate(...args) {
			console.log(args)
		},
		onSubmit() {
			this.getProtocolFees()
		},
		onFinish(values) {
			console.log('Success:', values)
		},

		onFinishFailed(errorInfo) {
			console.log('Failed:', errorInfo)
		},
		handleChange() {
			console.log(TxTags[this.formState.module])
			this.formState.feesTag = ''
			this.feeObj = TxTags[this.formState.module]
		},
		async getVersion() {
			// 获取版本
			const res = await this.api.network.getVersion()
			console.log(res)
			this.version = res
		},
		async getTreasuryAccount() {
			// 获取Treasury 账号的信息
			this.spinning = true
			const res = await this.api.network.getTreasuryAccount()
			console.log(res)
			const balance0 = await res.getBalance()
			console.log(balance0)
			console.log(balance0.total.toFormat())
			this.did = res.key
			this.address = res.address
			this.balance.free = balance0.free.toFormat()
			this.balance.locked = balance0.locked.toFormat()
			this.balance.total = balance0.total.toFormat()
			this.spinning = false
			// const balance = await this.api.network.getTreasuryBalance()
			// console.log(balance)
			// console.log(balance.toFormat())
		},
		async getNetworkProperties() {
			this.spinning3 = true
			// 获取网络特性
			const res = await this.api.network.getNetworkProperties()
			console.log(res)
			this.networkName = res.name
			this.networkVersion = res.version.toFormat()
			this.networkVersion = this.networkVersion.replace(/\,/g, '.')
			this.spinning3 = false
			console.log(res.version)
		},
		async getProtocolFees() {
			this.spinning2 = true
			this.tagfee = null
			this.loading = true
			const res = await this.api.network.getProtocolFees({
				tags: [this.formState.feesTag]
			})
			this.loading = false
			console.log(res)
			this.tagfee = res[0].fees.toFormat()
			this.spinning2 = false
		},
		// 资产列表相关
		async pageChange(page) {
			console.log(page)
			this.getAllAssets(page)
		},
		async tableChange(e) {
			console.log(e)
			this.dataSource = await Promise.all(
				this.dataSource.map(async (item, index) => {
					if (index >= (e.current - 1) * e.pageSize && index < e.current * e.pageSize) {
						if (item.details){
							item.details = await item.details()
							item.fundingRound = await item.currentFundingRound()
							// console.log(item.fundingRound)
							// item.key = item.did
							// this.fundingRoundList.forEach((li) => {
							// 	if (item.fundingRound === li.value) {
							// 		item.fundingRound = li.label
							// 	}
							// })
						}
					}

					return item
				})
			)
		},
		async getAllAssets() {
			// 分页获取资产列表
			this.assetsLoading = true
			const res = await this.api.assets.get()
			console.log(res)
			this.dataSource = await Promise.all(
				res.data.map(async (item, index) => {
					if (index >= 0 && index < 10) {
						item.details = await item.details()
						item.fundingRound = await item.currentFundingRound()
						// console.log(item.fundingRound)
						// this.fundingRoundList.forEach((li) => {
						// 	if (item.fundingRound === li.value) {
						// 		item.fundingRound = li.label
						// 	}
						// })
					}

					item.key = item.did
					return item
				})
			)
			this.assetsLoading = false
		}
	}
}
</script>
<style lang="scss" scoped>
.network100 {
  position:absolute;
  right: 0;
  height: 100%;
}
::v-deep .ant-descriptions-row > td{
	display: flex;
}
::v-deep .ant-descriptions-item-label {
	width: 110px;
	flex: 0 0 auto;
}
::v-deep .ant-descriptions-item > span{
	word-wrap: break-word;
    word-break: break-all;
}
</style>
