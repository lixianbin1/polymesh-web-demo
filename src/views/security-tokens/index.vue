<template>
	<div class="security-tokens">
		<a-row type="flex" :gutter="[24, 24]">
			<SettlementsList @update="refresh" />
			<a-col :span="24">
				<div class="box-shadow">
					<a-row type="flex" justify="space-between" class="mb-24">
						<div class="font-16">持有资产</div>
						<a-space v-if="isIdentity" size="middle">
							<span>{{ new Date().format('yyyy/MM/dd hh:mm:ss') }}</span>
							<a-button type="link" size="small" class="font-12" style="padding:0" @click="refresh"><a-icon type="sync" />刷新</a-button>
						</a-space>
					</a-row>
					<a-table
						:columns="columns"
						:data-source="holdings"
						:rowKey="row => row.ticker"
						:pagination="false"
						:showHeader="false"
						:loading="{
							spinning: holdingLoading
						}"
						:locale="holdingLocale"
						:customRow="holdingsRow"
					>
						<span slot="balance" slot-scope="text, record">{{ record.balance.toFormat(0) }} {{ record.ticker }}</span>
					</a-table>
				</div>
			</a-col>
			<a-col :span="24">
				<div class="box-shadow">
					<a-row type="flex" justify="space-between" class="mb-24">
						<div class="font-16">投资组合</div>
						<a-space v-if="isPrimaryAccount" size="middle">
							<a-button type="primary" @click="createPortfolio">
								创建投资组合
							</a-button>
						</a-space>
					</a-row>
					<a-row type="flex" justify="center">
						<a-spin :spinning="portfolioLoading">
							<!-- <a-icon slot="indicator" type="loading" class="font-24" spin /> -->
							<a-row v-if="isIdentity && portfolios.length" type="flex" :gutter="[16, 16]">
								<a-col v-for="portfolio in portfolios" :key="portfolio.uuid" :span="8" flex="0 0 432px" class="portfolio-col">
									<div class="box-shadow h-100">
										<a-row type="flex" justify="start" align="middle" style="flex-wrap: nowrap;">
											<a-icon	v-if="portfolio.portfolioType === 'DefaultPortfolio'" class="primary-icon mr-16" type="money-collect" />
											<div class="portfolio-info text-ellipsis">
												<a-tooltip>
													<template slot="title">
														{{ portfolio.name }}
													</template>
													<span class="mb-8 font-24">{{ portfolio.name }}</span>
												</a-tooltip>
												<!-- <div class="mb-8 font-24">
													<span v-if="!portfolio.isCustodiedBy" class="primary-color">已托管</span>
													<span v-if="portfolio.portfolio.isCustodiedPortfolio" class="primary-color">托管组合</span>
												</div> -->
												<div class="primary-color weight-500">{{ portfolio.balances.length }} tokens</div>
											</div>
										</a-row>
										<a-row style="height:270px">
											<a-table
												:columns="portfolioColumns"
												:data-source="portfolio.balances"
												:rowKey="row => row.asset.ticker"
												:pagination="false"
												:showHeader="false"
												:scroll="{ y: 270 }"
												:locale="locale"
											>
												<span slot="ticker" slot-scope="text, record">{{ record.asset.ticker }}</span>
												<span slot="balance" slot-scope="text, record">{{ record.total.toFormat(0) }} {{ record.asset.ticker }}</span>
											</a-table>
										</a-row>
										<a-row type="flex" justify="center" class="mt-16">
											<a-space :size="24" align="center">
												<a-button :disabled="portfolio.balances.length === 0" @click="onHanldePortfolio('sendModal', portfolio)">
													发送
												</a-button>
												<!-- 默认投资、不是主账号、有资产的组合不能删除 -->
												<a-button v-if="portfolio.portfolioType !== 'DefaultPortfolio' && isPrimaryAccount && !portfolio.balances.length" @click="onRemove(portfolio)">
													删除
												</a-button>
												<a-button v-if="isPrimaryAccount" type="primary" @click="onHanldePortfolio('detailModal', portfolio)">
													管理
												</a-button>
												<a-button v-else type="primary" @click="onHanldePortfolio('detailModal', portfolio)">
													详情
												</a-button>
											</a-space>
										</a-row>
									</div>
								</a-col>
							</a-row>
							<a-empty v-if="showEmpty" description="此账户暂无投资组合" />
						</a-spin>
					</a-row>
				</div>
			</a-col>
		</a-row>
		<CreatePortfolioModal ref="createModal" @on-success="() => getPortfolios('create')" />
		<HoldingDetailDialog ref="holdingModal" :asset="currentAsset" />
		<SendModal ref="sendModal" :current-portfolio="currentPortfolio" @on-success="() => getPortfolios('send')" />
		<PortfolioDetailModal
			ref="detailModal"
			:current-portfolio="currentPortfolio"
			:isPrimaryAccount="isPrimaryAccount"
			@on-success="() => getPortfolios('detail')"
		/>
	</div>
</template>

<script>
import {
	getSigningIdentity,
	getPortfolios,
	getCustodiedPortfolios,
	formatterPortfolios,
	getAssets,
	getNotification
} from './utils'
import SettlementsList from '@/views/account/settlementsList'
import { CreatePortfolioModal, HoldingDetailDialog, SendModal, PortfolioDetailModal } from './components'
import { createNamespacedHelpers } from 'vuex'
const { mapState } = createNamespacedHelpers('Account')

export default {
	name: 'SecurityTokens',
	components: { SettlementsList, CreatePortfolioModal, HoldingDetailDialog, SendModal, PortfolioDetailModal },
	data() {
		return {
			holdingLoading: false,
			portfolioLoading: false,
			isPrimaryAccount: false,
			isIdentity: false,
			showEmpty: false,
			createVisible: false,
			holdings: [],
			locale: {
				emptyText: <a-empty description='此投资组合中没有资产' />
			},
			columns: [
				{
					dataIndex: 'name',
					key: 'name'
				},
				{
					dataIndex: 'assetType',
					key: 'assetType'
				},
				{
					dataIndex: 'balance',
					key: 'balance',
					scopedSlots: { customRender: 'balance' }
				}
			],
			portfolios: [],
			portfolioColumns: [
				{
					dataIndex: 'ticker',
					key: 'ticker',
					align: 'left',
					scopedSlots: { customRender: 'ticker' }
				},
				{
					dataIndex: 'balance',
					key: 'balance',
					align: 'right',
					scopedSlots: { customRender: 'balance' }
				}
			],
			currentAsset: {},
			holdingsRow: (record) => {
				return {
					style: {
						cursor: 'pointer'
					},
					on: {
						click: () => {
							this.currentAsset = record
							this.$refs.holdingModal.toggle()
						}
					}
				}
			},
			currentPortfolio: {}
		}
	},
	computed: {
		...mapState({
			signingAddress: (state) => state.address
		}),
		holdingLocale() {
			return { emptyText: this.showEmpty ? <a-empty description='此账户暂无资产' /> : '' }
		}
	},
	watch: {
		signingAddress() {
			this.refresh()
		}
	},
	created() {
		this.initData()
	},
	methods: {
		async initData() {
			const identity = await getSigningIdentity(this.api)
			if (identity) {
				this.isIdentity = true
				this.showEmpty = false
				const { account } = await identity.getPrimaryAccount()
				this.isPrimaryAccount = account.address === this.signingAddress
				this.getPortfolios()
			} else {
				this.showEmpty = true
			}
		},
		async getPortfolios(operationType = 'init') {
			if (operationType === 'init') this.holdingLoading = true
			this.portfolioLoading = true
			const custodiedPortfolios = await getCustodiedPortfolios(this.api)
			this.portfolios = await formatterPortfolios([...(await getPortfolios(this.api)), ...custodiedPortfolios])
			this.portfolioLoading = false
			this.showEmpty = this.portfolios.length === 0
			this.holdings = await getAssets(this.api, this.portfolios)
			this.holdingLoading = false
		},
		viewAssetDetail(asset) {
			this.holdingVisible = true
			this.currentTicker = asset.ticker
			this.currentAsset = asset
		},
		createPortfolio() {
			this.$refs.createModal && this.$refs.createModal.toggle()
		},
		onHanldePortfolio(ref, portfolio) {
			this.$refs[ref] && this.$refs[ref].toggle()
			this.currentPortfolio = portfolio
		},
		async onRemove({ name, id }) {
			try {
				const that = this
				const notification = getNotification(this, { message: '删除投资组合', icon: <a-icon type='loading' /> })
				notification.confirm(
					{
						subTitle: '请查看并确认要删除的投资组合详细信息',
						children: [{ label: '投资组合名称', value: name }]
					},
					async () => {
						const identity = await that.api.getSigningIdentity()
						const deleteQ = await identity.portfolios.delete({ portfolio: id })
						// 操作提示
						notification.run(deleteQ, () => {
							that.getPortfolios('del')
						})
					}
				)
			} catch (err) {
				this.$message.error(err.message)
			}
		},
		refresh() {
			this.portfolios = []
			this.holdings = []
			this.initData()
		}
	}
}
</script>

<style lang="scss">
.security-tokens {
	.ant-table-placeholder {
		border: none;
		color: $heading-color;
	}
	.ant-table-body {
		overflow-y: auto !important;
	}
}
.confirm-notification {
	.ant-modal-body {
		padding: 0 0 24px;
		.anticon {
			display: none;
		}
		.confirm-notification__title {
			padding: 16px 24px;
			border: 1px solid #F0F0F0;
		}
		.ant-modal-confirm-content {
			margin-left: 0!important;
		}
		.ant-modal-confirm-btns {
			float: none;
			text-align: center;
		}
	}
}
</style>
