<template>
	<a-row class="box-shadow">
		<a-col :span="18" :offset="3" class="mt-20">
			<a-steps
				progress-dot
				:current="progress"
			>
				<a-step title="选择分红账户" />
				<a-step title="管理预扣税" />
				<a-step title="配置股息支付" />
			</a-steps>
		</a-col>
		<!-- <a-col
			:span="24"
			class="mt-24 mb-16"
		>
			<div>管理预扣税</div>
		</a-col> -->
		<!-- <a-col :span="6">
			<div class="secondary-color">代币持有人</div>
			<p class="mt-8">{{ statisticsObj.tokenholders }}</p>
		</a-col>
		<a-col :span="6">
			<div class="secondary-color">排除的令牌持有者</div>
			<p class="mt-8">{{ statisticsObj.excludedTokenholders }}</p>
		</a-col>
		<a-col v-show="progress===1" :span="6">
			<div class="secondary-color">代扣代缴税款的代币持有人</div>
			<p class="mt-8">{{ statisticsObj.taxesWithheld }}</p>
		</a-col>
		<a-col v-show="progress===2" :span="6">
			<div class="secondary-color">收到股息的代币持有人</div>
			<p class="mt-8">{{ statisticsObj.tokenholders }}</p>
		</a-col> -->
		<a-col :span="24">
			<StepOne v-show="progress===0" :holdList="holdList" :isInterest="isInterest" :progress="progress" @to-next="nextStep"></StepOne>
			<StepTwo
				v-show="progress===1" :stepOneResult="stepOneResult" :statisticsObj="statisticsObj" :progress="progress"
				:isInterest="isInterest" @to-next="nextStep" @edit-step-one-result="editStepOneResult"
			></StepTwo>
			<StepThree
				v-show="progress === 2 || progress === 3" :ticker="ticker" :assets="assets" :loading="loading" :progress="progress"
				:currentPoint="currentPoint" :statisticsObj="statisticsObj" :isInterest="isInterest" @to-next="nextStep"
			></StepThree>
		</a-col>
	</a-row>
</template>
<script>
import { BigNumber } from '@polymeshassociation/polymesh-sdk'
import { TargetTreatment } from '@polymeshassociation/polymesh-sdk/types'
import StepOne from './StepOne.vue' // src\views\token-studio\dividends\StepOne.vue
import StepTwo from './StepTwo.vue' // src\views\token-studio\dividends\StepOne.vue
import StepThree from './StepThree.vue' // src\views\token-studio\dividends\StepOne.vue
export default {
	components: { StepOne, StepTwo, StepThree },
	props: {
		ticker: {
			type: String,
			default: ''
		},
		isInterest: {
			type: String,
			default: ''
		},
		assets: {
			type: Object,
			default: () => ({})
		},
		currentPoint: {
			type: Object,
			default: () => ({})
		},
		holdList: {
			type: Array,
			default: () => ([])
		},
		dividendList: { // 股息列表
			type: Array,
			default: () => ([])
		},
		checkpointList: { // 快照列表
			type: Array,
			default: () => ([])
		}
	},
	data () {
		return {
			loading: false,
			progress: 0,
			stepOneResult: [],
			statisticsObj: {},
			getStepThree: {}
		}
	},
	watch: {
		isInterest(obj) {
			this.progress = 0
			this.stepOneResult.forEach(item => {
				item.taxWitholding = 0
			})
		}
	},
	mounted(){
		console.log('---=-..........')
	},
	methods: {
		commonFun(step, title, e) {
			if (step === 1) {
				this.$notification.warn({
					key: '1',
					message: '请求中...',
					description: `${title}`,
					duration: 0
				})
			} else if (step === 2) {
				this.$notification.success({
					key: '1',
					message: '成功！',
					description: `${title}`,
					duration: 0
				})
			} else {
				this.$notification.error({
					key: '1',
					message: `${title}失败`,
					description: e.toString(),
					duration: 0
				})
			}
		},
		editStepOneResult({ value, key, record }) {
			const { did } = record
			this.stepOneResult.forEach(item => {
				if (item.did === did) {
					item.taxWitholding = value
				}
			})
			let flag = 0
			this.stepOneResult.forEach(item => {
				if (item.taxWitholding) {
					flag++
				}
			})

			this.$set(this.statisticsObj, 'taxesWithheld', flag)
		},
		async configureDividendDistributionFun() {
			this.loading = true
			this.commonFun(1, '创建股息分配')
			let checkpoint = ''
			this.checkpointList.forEach(item => {
				if (this.currentPoint.checkpoint.id.toString() === item.checkpoint.id.toString()) {
					checkpoint = item.checkpoint
				}
			})
			const identity = await this.api.getSigningIdentity()
			// const originPortfolio = await identity.portfolios.getPortfolio({ portfolioId: new BigNumber(1) })
			const originPortfolios = await identity.portfolios.getPortfolios()
			console.log('getPortfolio查询投资组合', originPortfolios)
			const distributions = this.assets.corporateActions.distributions
			const identities = this.stepOneResult.map(item => item.did)
			console.log('oneResult:', this.stepOneResult)
			const taxWithholdings = this.stepOneResult.map(item => ({
				identity: item.did,
				percentage: new BigNumber(item.taxWitholding)
			}))

			const obj = {
				checkpoint: checkpoint, // 检查点
				// checkpoint: new Date(Date.now() + 1000 * 60 * 2), // 检查点
				originPortfolio: originPortfolios[this.getStepThree.portfolioId], // optional, defaults to the CAA's default portfolio
				currency: this.getStepThree.currency,
				perShare: new BigNumber(this.getStepThree.perShare),
				maxAmount: new BigNumber(this.getStepThree.payOutAmount),
				paymentDate: this.getStepThree.paymentDate, // 支付时间
				expiryDate: this.getStepThree.expiryDate, // 过期时间 means the distribution doesn't expire
				declarationDate: this.getStepThree.declarationDate,
				description: this.getStepThree.description,
				targets: {
					identities,
					treatment: TargetTreatment.Include
				},
				taxWithholdings
			}
			console.log('发送前准备：', obj, checkpoint)
			try {
				window.configureDividendDistribution = distributions.configureDividendDistribution
				const aa = await distributions.configureDividendDistribution.checkAuthorization()
				console.log('权限查询：', aa)
				const dividendActionQueue = await distributions.configureDividendDistribution(obj)
				const dividendAction = await dividendActionQueue.run()
				const dividendActionId = dividendAction.id.toString(10)
				console.log('成功：dividendActionId:', dividendActionId)
				this.loading = false
				this.$emit('refrush')
				this.commonFun(2, '创建股息分配')
			} catch (e) {
				this.commonFun(3, '创建股息分配', e)
				this.loading = false
			}
		},
		nextStep({ bool, selectArr, statisticsObj, getStepThree }) {
			if (bool) {
				this.progress++
				if (this.progress > 2) {
					this.progress = 3
				}
			} else {
				this.progress--
				if (this.progress < 0) {
					this.$emit('stop-interest', 'main')
				}
			}
			if (this.progress === 1 && selectArr) {
				this.stepOneResult = this.holdList.filter((item, index) => {
					return selectArr.indexOf(index) === -1
				})

				let elligibleTokens = 0
				this.stepOneResult.forEach(item => {
					elligibleTokens += parseFloat(item.balance.toString())
				})

				if (statisticsObj) {
					this.statisticsObj = { elligibleTokens, ...statisticsObj }
					console.log('拿到合计：', this.statisticsObj)
				}
			}
			if (getStepThree && this.progress === 3) {
				this.getStepThree = getStepThree
				if (bool) {
					this.configureDividendDistributionFun()
				}
			}
		}
	}
}
</script>
