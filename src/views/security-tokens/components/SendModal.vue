<template>
	<a-modal
		title="发送资产"
		:visible="visible"
		:width="648"
		centered
		:closable="false"
	>
		<a-form-model ref="form" :model="formData" :rules="rules" layout="vertical">
			<a-form-model-item
				label="资产"
				prop="asset"
			>
				<a-select
					v-model="formData.asset"
					placeholder="请选择资产"
					@change="handleSelectChange"
				>
					<a-select-option v-for="balance in balances" :key="balance.ticker">
						{{ balance.name }}
					</a-select-option>
				</a-select>
			</a-form-model-item>
			<a-form-model-item
				:label="free ? `金额 (${free} 可用)` : '金额'"
				prop="amount"
			>
				<a-input
					v-model="formData.amount"
					placeholder="请输入金额"
					:disabled="!formData.asset"
					:suffix="ticker"
					@change="onChangeAmount"
				/>
			</a-form-model-item>
			<a-form-model-item
				label="发送到"
				prop="sendType"
			>
				<a-radio-group v-model="formData.sendType">
					<a-radio :value="1">
						我的投资组合之一
					</a-radio>
					<a-radio :value="2">
						其他Polymesh账户
					</a-radio>
				</a-radio-group>
			</a-form-model-item>
			<template>
				<a-form-model-item v-if="formData.sendType === 1" label="投资组合" prop="portfolio">
					<a-select
						v-model="formData.portfolio"
						placeholder="请选择投资组合"
					>
						<a-select-option v-for="item in filterPortfolios" :key="item.uuid">
							{{ item.name }}
						</a-select-option>
					</a-select>
				</a-form-model-item>
				<a-form-model-item v-if="formData.sendType === 2" label="Polymesh账户" prop="account">
					<a-input
						v-model="formData.account"
						placeholder="请输入Polymesh账户"
					/>
				</a-form-model-item>
			</template>
		</a-form-model>
		<template #footer>
			<div class="py-16">
				<a-button @click="onClose">取消</a-button>
				<a-button type="primary" @click="onSubmit">保存</a-button>
			</div>
		</template>
	</a-modal>
</template>
<script>
import {
	getPortfolios,
	getCustodiedPortfolios,
	formatterPortfolios,
	getNotification,
	sliceHash
} from '../utils'
import { BigNumber } from '@polymeshassociation/polymesh-sdk'

export default {
	name: 'SendModal',
	props: {
		currentPortfolio: {
			type: Object,
			default: () => {}
		}
	},
	data() {
		return {
			visible: false,
			rules: {
				asset: [{ required: true, message: '资产不能为空', trigger: 'change' }],
				amount: [
					{
						required: true,
						message: '金额不能为空',
						trigger: 'blur'
					},
					{
						required: true,
						validator: this.validateFree,
						trigger: 'change'
					}
				],
				portfolio: [{ required: true, message: '投资组合不能为空' }],
				account: [{ required: true, message: 'Polymesh账户不能为空' }]
			},
			formData: {
				asset: undefined,
				amount: '',
				sendType: 1,
				portfolio: undefined,
				account: ''
			},
			balances: [],
			portfolios: [],
			free: '',
			ticker: ''
		}
	},
	computed: {
		filterPortfolios() {
			return this.portfolios.filter(portfolio => portfolio.uuid !== this.currentPortfolio.uuid)
		}
	},
	watch: {
		visible(val) {
			if (val) this.initData()
		}
	},
	methods: {
		toggle() {
			this.visible = !this.visible
		},
		initData() {
			this.getAssets()
			this.getPortfolios()
		},
		handleSelectChange(value) {
			const asset = this.balances.find(asset => asset.asset.ticker === value)
			this.free = asset && asset.free.toNumber()
			this.ticker = asset && asset.ticker
		},
		async getAssets() {
			try {
				this.portfolio = this.currentPortfolio.portfolio
				const balances = await this.portfolio.getAssetBalances()
				this.balances = await Promise.all(
					balances.map(async balance => {
						const { name } = await balance.asset.details()
						return {
							...balance,
							name,
							ticker: balance.asset.ticker
						}
					})
				)
			} catch (err) {
				console.log('getPortfolio方法@@@', err)
			}
		},
		async getPortfolios() {
			const custodiedPortfolios = await getCustodiedPortfolios(this.api)
			this.portfolios = await formatterPortfolios([...(await getPortfolios(this.api)), ...custodiedPortfolios])
		},
		onClose() {
			this.toggle()
			this.free = ''
			this.ticker = ''
			this.$refs.form.resetFields()
		},
		onSubmit() {
			this.$refs.form.validate(async (valid) => {
				if (valid) {
					const { amount, asset, portfolio: portfolioUuid, sendType } = this.formData
					if (sendType === 1) {
						const portfolio = this.portfolios.find(portfolio => portfolio.uuid === portfolioUuid)
						const notification = getNotification(this, { message: '转移资产到投资组合', icon: <a-icon type='loading' />, width: 648 })
						this.onClose()
						notification.confirm(
							{
								subTitle: '请查看并确认以下详细信息',
								children: [
									{ label: '来自投资组合', value: this.currentPortfolio.name },
									{ label: '发送到投资组合', value: portfolio.name },
									{ label: '资产名称', value: asset },
									{ label: '金额', value: amount }
								]
							},
							async () => {
								try {
									const moveQueue = await this.portfolio.moveFunds({
										to: portfolio.portfolio,
										items: [
											{
												asset,
												amount: new BigNumber(amount)
											}
										]
									})
									notification.run(moveQueue, () => {
										this.$emit('on-success')
									})
								} catch (err) {
									console.log('onSubmit@@@', err)
								}
							}
						)
					} else {
						this.transferAssetToOtherAccount()
					}
				}
			})
		},
		async transferAssetToOtherAccount() {
			try {
				const { asset, amount, account: toIdentity } = this.formData
				const that = this
				const notification = getNotification(this, { message: '转移资产到账户', icon: <a-icon type='loading' />, width: 648 })
				this.onClose()
				notification.confirm(
					{
						subTitle: '请查看并确认下面的资产转移详细信息',
						children: [
							{ label: '来自投资组合', value: this.currentPortfolio.name },
							{ label: '发送到账户', value: sliceHash(toIdentity, 11) },
							{ label: '资产名称', value: asset },
							{ label: '金额', value: amount }
						]
					},
					async () => {
						try {
							// 获取默认type为Other的venue, 没有则创建
							let venue
							const venues = await that.getVenues()
							if (venues.length) {
								venue = venues[0].venue
							} else {
								const venueQueue = await that.api.settlements.createVenue({
									type: 'Other',
									description: 'Default'
								})
								venue = await venueQueue.run()
							}
							const addQueue = await venue.addInstruction({
								// array of Asset movements (amount, from, to, asset)-资产移动数组（金额、自、至、资产）
								legs: [
									{
										amount: new BigNumber(amount),
										from: that.portfolio,
										to: toIdentity,
										asset
									}
								]
							})
							notification.run(addQueue, () => {
								that.$emit('on-success')
							})
						} catch (err) {
							console.log('transferAssetToOtherAccount@@@', err)
						}
					}
				)
			} catch (err) {
				console.log('transferAssetToOtherAccount@@@', err)
			}
		},
		async getVenues() {
			try {
				const venues = await Promise.all(
					(await (await this.api.getSigningIdentity()).getVenues()).map(async venue => {
						const details = await venue.details()
						return {
							...details,
							venue
						}
					})
				)
				return venues.filter(venue => venue.type === 'Other')
			} catch (err) {
				console.log('getVenue方法@@@', err)
			}
		},
		validateFree(rule, value, callback) {
			if (value && value > this.free) {
				callback('资产余额不足')
			}
			callback()
		},
		onChangeAmount(event) {
			this.formData.amount = event.target.value.replace(/^(0+)|[^\d]+/g, '')
		}
	}
}
</script>
