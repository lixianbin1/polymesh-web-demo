<template>
	<div class="portfolio-detail">
		<a-modal
			title="投资组合详情"
			class="portfolio-detail"
			:centered="true"
			:closable="false"
			:maskClosable="false"
			:visible="visible"
			:width="670"
			:bodyStyle="{ 'max-height': '650px', 'overflow-y': 'auto' }"
		>
			<div class="portfolio-info">
				<a-row type="flex" justify="start">
					<div class="label">组合名称：</div>
					<div class="value">
						<span>{{ formData.name }}</span>
						<!-- 默认组合、不是主账号不允许更改 -->
						<a-icon v-if="isPrimaryAccount && portfolio.portfolioType !== 'DefaultPortfolio'" type="edit" class="ml-16" @click="onEdit(formData.name)" />
					</div>
				</a-row>
				<a-row v-show="formData.createdAt" type="flex" justify="start" class="mt-16">
					<div class="label">创建日期：</div>
					<div class="value">{{ formData.createdAt }}</div>
				</a-row>
				<div class="mt-16">
					<div class="font-14 mb-16">投资组合经理</div>
					<a-table
						:columns="columns"
						:data-source="managers"
						:rowKey="row => row.address"
						:pagination="false"
						:loading="{
							spinning: secondaryLoading,
						}"
					>
						<span slot="action" slot-scope="text, record">
							<a-icon v-if="isPrimaryAccount && record.isSecondaryAccount" type="delete" class="font-16" style="color: red" @click="deleteManager(record)" />
						</span>
					</a-table>
					<a-button v-if="isPrimaryAccount" type="link" class="mt-16" style="padding-left: 0" @click="addVisible = true">
						<a-icon type="plus" /> 添加投资组合经理
					</a-button>
				</div>
				<div class="transaction-history mt-32">
					<a-row type="flex" justify="space-between">
						<div class="title font-16">交易历史记录</div>
						<a-space size="middle">
							<span>{{ new Date().format('yyyy/MM/dd hh:mm:ss') }}</span>
							<a-button type="link" size="small" class="font-12 p-0" @click="refresh"><a-icon type="sync" />刷新</a-button>
						</a-space>
					</a-row>
					<a-row class="mt-24" type="flex" justify="center" :class="[historyLoading ? 'loading' : '']">
						<a-spin :spinning="historyLoading" class="w-100">
							<template v-if="isShow">
								<div v-if="calculationHistory.length">
									<a-table
										:columns="historyColumns"
										:data-source="calculationHistory"
										:rowKey="row => row.idx"
										:pagination="false"
										:showHeader="false"
									>
										<a-space slot="describe" slot-scope="text, record" :size="0">
											<SendIcon v-if="record.type === 'Sent'" />
											<SendIcon v-if="record.type === 'Received'" rotate />
											<a-tooltip placement="top">
												<template slot="title">
													<span>{{ record.describe }}</span>
												</template>
												<span class="ml-8">{{ record.describe | filterDescribe }}</span>
											</a-tooltip>
										</a-space>
										<!-- <span slot="describe" slot-scope="text, record">
										</span> -->
										<span slot="status">
											<a-tag color="green">
												Success
											</a-tag>
										</span>
										<span slot="amount" slot-scope="text, record">
											<span class="amount">{{ record.amount }} </span>
											<span class="token-type">{{ record.ticker }}</span>
										</span>
									</a-table>
									<div class="text-right mt-32">
										<a-pagination
											:total="total"
											:page-size="pageSize"
											:default-current="currentPage"
											@change="changePage"
										/>
									</div>
								</div>
								<a-empty v-else description="无交易记录" />
							</template>
						</a-spin>
					</a-row>
				</div>
			</div>
			<div slot="footer" class="py-16">
				<a-button type="primary" @click="onDone">
					关闭
				</a-button>
			</div>
		</a-modal>
		<!-- 修改名称 -->
		<a-modal
			title="修改组合名称"
			class="modify-name"
			:closable="false"
			:maskClosable="false"
			:visible="modifyVisible"
			:width="670"
			cancelText="取消"
			okText="保存"
			@ok="onModifyName"
			@cancel="onCancelModify"
		>
			<a-form-model ref="modifyForm" :model="modifyForm" layout="vertical">
				<a-form-model-item
					label="组合名称"
					prop="name"
					:rules="{ required: true, message: '组合名称不能为空', trigger: 'blur' }"
				>
					<a-input
						v-model="modifyForm.name"
						placeholder="请输入组合名称"
					/>
				</a-form-model-item>
			</a-form-model>
		</a-modal>
		<!-- 添加投资组合经理 -->
		<a-modal
			title="添加投资组合经理"
			class="add-portfolio__management"
			:closable="false"
			:maskClosable="false"
			:visible="addVisible"
			:width="670"
			:centered="true"
			cancelText="取消"
			okText="保存"
			@ok="onSavePortfolioManager"
			@cancel="onClosePortfolioManager"
		>
			<a-form-model ref="addForm" :model="addForm" layout="vertical">
				<a-form-model-item
					label="投资组合经理"
					prop="secondaryAccount"
					:rules="{ required: true, message: '投资组合经理不能为空', trigger: 'change' }"
				>
					<a-select
						v-model="addForm.secondaryAccount"
						placeholder="请选择投资组合经理"
					>
						<a-select-option v-for="account in secondaryAccounts" :key="account.address" :value="account.address">
							{{ account.label }}
						</a-select-option>
					</a-select>
				</a-form-model-item>
			</a-form-model>
		</a-modal>
	</div>
</template>
<script>
import { BigNumber } from '@polymeshassociation/polymesh-sdk'
import { getNotification, sliceHash, getWeb3Accounts } from '../utils'
import SendIcon from './sendIcon.vue'

export default {
	name: 'PortfolioDetail',
	components: { SendIcon },
	filters: {
		filterDescribe(value) {
			return sliceHash(value, 11)
		}
	},
	props: {
		currentPortfolio: {
			type: Object,
			default: () => {}
		},
		isPrimaryAccount: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			visible: false,
			historyLoading: false,
			isShow: null,
			modifyVisible: false,
			addVisible: false,
			secondaryLoading: false,
			formData: {
				name: '',
				createdAt: ''
			},
			modifyForm: {
				name: ''
			},
			addForm: {
				secondaryAccount: undefined
			},
			managers: [],
			columns: [
				{
					dataIndex: 'name',
					key: 'name',
					title: '昵称'
				},
				{
					dataIndex: 'sliceAddress',
					key: 'sliceAddress',
					title: '地址'
				},
				{
					key: 'action',
					scopedSlots: { customRender: 'action' }
				}
			],
			historyColumns: [
				{
					dataIndex: 'describe',
					key: 'describe',
					scopedSlots: { customRender: 'describe' }
				},
				{
					dataIndex: 'status',
					key: 'status',
					scopedSlots: { customRender: 'status' }
				},
				{
					dataIndex: 'amount',
					key: 'amount',
					scopedSlots: { customRender: 'amount' }
				}
			],
			portfolio: this.currentPortfolio,
			accountName: {},
			transactionHistory: [],
			secondaryAccounts: [],
			currentPage: 1,
			pageSize: 5,
			total: 0,
			accounts: [],
			accountNames: {}
		}
	},
	computed: {
		calculationHistory() {
			const start = this.currentPage === 1 ? 0 : this.currentPage * this.pageSize - this.pageSize
			const end = this.currentPage * this.pageSize
			return this.transactionHistory.slice(start, end)
		}
	},
	watch: {
		currentPortfolio: {
			handler(newVal) {
				this.portfolio = newVal
			}
		},
		visible(newVal) {
			if (newVal) this.init()
		}
	},
	created() {
	},
	methods: {
		async init() {
			this.formData.createdAt = this.portfolio.createdAt
			this.formData.name = this.portfolio.name
			// 获取辅助账号的权限, 判断是否具有PortfolioManagement权限标识
			this.getSecondartAccountPermissions()
			this.getTransactionHistory()
		},
		async getTransactionHistory() {
			try {
				this.historyLoading = true
				const transactionHistory = await this.portfolio.portfolio.getTransactionHistory({ size: new BigNumber(9999) })
				this.total = transactionHistory?.count.toNumber()
				this.transactionHistory = await Promise.all(
					transactionHistory?.data.map(async (transaction, idx) => {
						const legs = transaction.legs
						const { amount, asset, from, to, direction } = legs[0]
						const fromName = from._id ? await from.getName() : '未分配'
						const toName = to._id ? await to.getName() : '未分配'
						const type = direction === 'Incoming' ? 'Received' : 'Sent'
						return {
							idx,
							amount: amount.toNumber(),
							ticker: asset.ticker,
							type,
							fromName,
							toName,
							describe: `${type === 'Received' ? '收到' : '发送'} ${asset.ticker} ${type === 'Received' ? '来自于' : '到'} "${type === 'Received' ? fromName : toName}" 投资组合`
						}
					})
				)
				this.historyLoading = false
				this.isShow = true
			} catch (err) {
				this.historyLoading = false
				this.isShow = true
				console.log('getTransactionHistory方法@@@', err)
			}
		},
		async getSecondartAccountPermissions() {
			this.secondaryLoading = true
			const identity = await this.api.getSigningIdentity()
			const { account: signAccount } = await identity.getPrimaryAccount()
			const [accounts, accountNames] = await getWeb3Accounts()
			const signManage = accounts.filter(account => account.address === signAccount.address)
			const { data } = await identity.getSecondaryAccounts()
			this.secondaryAccounts = data.map(account => {
				const name = accountNames[account.account.address] || '未命名'
				const sliceAddress = sliceHash(account.account.address, 10)
				return {
					...account.account,
					name,
					sliceAddress,
					isSecondaryAccount: true,
					label: name ? `${name} (${sliceAddress})` : '',
					permissions: account.permissions,
					account: account.account
				}
			})
			this.managers = signManage
				.concat(
					...(await Promise.all(
						this.secondaryAccounts.map(async account => {
							// TODO 校验辅助账户是否有投资组合管理员权限, 官网只校验了投资组合
							const checkPermissions = await account.account.checkPermissions({
								// transactions: txGroupToTxTags('PortfolioManagement'),
								portfolios: [this.currentPortfolio.portfolio]
							})
							return {
								...account,
								checkPermissions
							}
						})
					)).filter(account => account.checkPermissions.result)
				)
			this.secondaryLoading = false
		},
		onDone() {
			this.visible = false
			this.isShow = null
			this.transactionHistory = []
			this.secondaryAccounts = []
			this.managers = []
			this.secondaryAccount = ''
			this.formData = {
				name: '',
				createdAt: ''
			}
			this.currentPage = 1
		},
		onEdit(name) {
			this.modifyVisible = true
			this.modifyForm.name = name
		},
		async onModifyName() {
			this.$refs.modifyForm.validate(async valid => {
				if (valid) {
					const { name } = this.formData
					const that = this
					this.modifyVisible = false
					const notification = getNotification(this, { message: '重命名投资组合', icon: <a-icon type='loading' />, width: 670 })
					notification.confirm(
						{
							subTitle: '请确认您要重命名的投资组合',
							children: [{ label: '当前名称', value: name }, { label: '新名称', value: this.modifyForm.name }]
						},
						async () => {
							try {
								const modifyQueue = await that.portfolio.portfolio.modifyName({ name: this.modifyForm.name })
								// 操作提示
								notification.run(modifyQueue, () => {
									that.modifySuccess()
								})
							} catch (err) {
								notification.open({
									type: 'error',
									description: err.message,
									duration: 3
								})
							}
						}
					)
				}
			})
		},
		async modifySuccess() {
			const name = await this.portfolio.portfolio.getName()
			this.formData.name = name
			this.$emit('on-success')
		},
		onCancelModify() {
			this.modifyVisible = false
			this.$refs.modifyForm.resetFields()
		},
		onSavePortfolioManager() {
			this.$refs.addForm.validate(async valid => {
				if (valid) {
					const { secondaryAccount } = this.addForm
					try {
						const that = this
						const account = await this.api.accountManagement.getAccount({ address: secondaryAccount })
						const { assets, portfolios, transactionGroups } = await account.getPermissions()
						that.onClosePortfolioManager()
						const notification = getNotification(this, { message: '添加投资组合经理', icon: <a-icon type='loading' />, width: 670 })
						notification.confirm(
							{
								subTitle: '请查看并确认以下详细信息',
								children: [{ label: '账户', value: sliceHash(secondaryAccount, 11) }, { label: '投资组合', value: this.formData.name }]
							},
							async () => {
								try {
									const modifyQueue = await that.api.accountManagement.modifyPermissions({
										secondaryAccounts: [
											{
												account,
												permissions: {
													assets,
													portfolios: {
														type: portfolios ? portfolios.type : 'Include',
														values: portfolios ? [...new Set([...portfolios.values, that.portfolio.portfolio])] : [that.portfolio.portfolio]
													},
													transactionGroups: [...new Set([...transactionGroups, 'PortfolioManagement'])]
												}
											}
										]
									})
									// 操作提示
									notification.run(modifyQueue, () => {
										that.getSecondartAccountPermissions()
										that.onClosePortfolioManager()
									})
								} catch (err) {
									notification.open({
										type: 'error',
										description: err.message
									})
								}
							}
						)
					} catch (err) {
						console.log('onSavePortfolioManager@@@', err)
					}
				}
			})
		},
		async deleteManager(account) {
			try {
				const that = this
				const { assets, portfolios, transactionGroups } = await account.permissions
				transactionGroups.splice(transactionGroups.findIndex(group => group === 'PortfolioManagement'), 1)
				portfolios.values.splice(portfolios.values.findIndex(portfolio => portfolio.uuid === that.currentPortfolio.portfolio.uuid), 1)
				const notification = getNotification(this, { message: '移除投资组合经理', icon: <a-icon type='loading' />, width: 670 })
				notification.confirm(
					{
						subTitle: '请查看并确认以下详细信息',
						children: [{ label: '账户', value: sliceHash(account.address, 11) }, { label: '投资组合', value: this.formData.name }]
					},
					async () => {
						const modifyQueue = await that.api.accountManagement.modifyPermissions({
							secondaryAccounts: [
								{
									account: account.account,
									permissions: {
										assets,
										portfolios,
										transactionGroups
									}
								}
							]
						})
						// 操作提示
						notification.run(modifyQueue, () => {
							that.getSecondartAccountPermissions()
						})
					}
				)
			} catch (err) {
				console.log('deleteManager@@@', err)
			}
		},
		onClosePortfolioManager() {
			this.addVisible = false
			this.$refs.addForm.resetFields()
		},
		refresh() {
			this.isShow = false
			this.getTransactionHistory()
		},
		changePage(page, size) {
			this.currentPage = page
			this.pageSize = size
		},
		toggle() {
			this.visible = !this.visible
		}
	}
}
</script>
