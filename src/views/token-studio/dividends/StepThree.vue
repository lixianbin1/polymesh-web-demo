<template>
	<div>
		<a-row>
			<a-col
				:span="24"
				class="mt-24 mb-16"
			>
				<div>配置股息支付</div>
			</a-col>
			<a-col :span="6">
				<div class="secondary-color">资产持有者</div>
				<p class="mt-8">{{ statisticsObj.tokenholders }}</p>
			</a-col>
			<a-col :span="6">
				<div class="secondary-color">选择分红的持有者</div>
				<p class="mt-8">{{ statisticsObj.tokenholders - statisticsObj.excludedTokenholders }}</p>
			</a-col>
			<a-col>
				<div class="secondary-color">代扣税款的持有者</div>
				<p class="mt-8">{{ statisticsObj.taxesWithheld }}</p>
			</a-col>
			<!-- <a-col v-show="progress===2" :span="6">
				<div class="secondary-color">收到股息的代币持有人</div>
				<p class="mt-8">{{ statisticsObj.tokenholders }}</p>
			</a-col> -->
		</a-row>
		<a-form-model
			ref="ruleForm"
			:model="form"
			:rules="rules"
			:label-col="labelCol"
			:wrapper-col="wrapperCol"
		>
			<a-form-model-item ref="description" label="股息支付名称" prop="description">
				<a-input
					v-model="form.description"
					style="width: 400px;"
					@blur="
						() => {
							$refs.description.onFieldBlur();
						}
					"
				/>
			</a-form-model-item>
			<a-form-model-item label="申报时间" prop="declarationDate">
				<a-date-picker
					v-model="form.declarationDate"
					style="width: 400px;"
					show-time
					:disabled-date="disabledDate"
					:disabled-time="disabledDateTime"
					type="date"
					placeholder="选择申报时间"
				/>
				<span style="margin-left:10px;color:red;">快照时间：{{ currentPoint?.createdAt.toLocaleString() }}</span>
			</a-form-model-item>
			<a-form-model-item label="付款时间" required prop="paymentDate">
				<a-date-picker
					v-model="form.paymentDate" show-time
					type="date"
					:disabled-date="disabledDate_pay"
					:disabled-time="disabledDateTime_pay"
					placeholder="选择付款时间"
					style="width: 400px;"
					@change="change_disabledDate_pay"
				/>
			</a-form-model-item>
			<a-form-model-item label="支付/认领截止时间" prop="expiryDate">
				<a-date-picker
					v-model="form.expiryDate"
					show-time
					:disabled-date="disabledDate_expiry"
					:disabled-time="disabledDateTime_expiry"
					type="date"
					placeholder="选择支付/认领截止时间"
					style="width: 400px;"
				/>
			</a-form-model-item>
			<a-form-model-item label="支付投资组合" prop="portfolioId">
				<a-select
					v-model="form.portfolioId" default-value="lucy" style="width: 120px;width:400px;"
					@change="handleChangePro"
				>
					<a-select-option v-for="(item, index) in getPortList" :key="index" :value="index">
						投资组合{{ index === 0 ? '【默认】' : `【${index}】` }}
					</a-select-option>
				</a-select>
			</a-form-model-item>
			<a-form-model-item label="支付资产" prop="currencyId">
				<a-select v-model="form.currencyId" style="width: 120px;width:400px;" @change="handleChange">
					<a-select-option v-for="(item, index) in getTickerList" :key="item.asset.ticker" :value="index">
						{{ item.asset.ticker }}（ 可自由支配token：{{ item.free.toString() }}）
					</a-select-option>
				</a-select>
			</a-form-model-item>
			<a-form-model-item label="支付资产比例" prop="perShare">
				<a-input v-model="form.perShare" style="width: 400px;" />
			</a-form-model-item>

			<a-form-model-item label="待付股息资产" class="cor-action-gray">
				<div style="width:400px;text-align:right;color: rgba(0, 0, 0, 0.85);">
					<span>{{ statisticsObj.elligibleTokens }}</span>&nbsp;&nbsp;<span class="secondary-color">{{ ticker }}</span>
				</div>
			</a-form-model-item>
			<a-form-model-item label="可支付资产" class="cor-action-gray">
				<div style="width:400px;text-align:right;color: rgba(0, 0, 0, 0.85);">
					<span>{{ form.maxAmount }}</span>&nbsp;&nbsp;<span class="secondary-color">{{ form.currency }}</span>
				</div>
			</a-form-model-item>
			<a-form-model-item label="预计支付资产" class="cor-action-gray">
				<div style="width:400px;text-align:right;color: rgba(0, 0, 0, 0.85);">
					<span>{{ calculationPayOutAmount() }}</span>&nbsp;&nbsp;<span>{{ form.currency }}</span>
				</div>
			</a-form-model-item>
			<a-form-model-item :wrapper-col="{ span: 14, offset: 1 }">
				<a-space class="mt-16">
					<a-button @click="continueFun(false)">返回</a-button>
					<!-- <a-button type="primary" @click="continueFun(true)">下一步</a-button> -->
					<a-button type="primary" :loading="loading" @click="onSubmit(true)">确认配置</a-button>
				</a-space>
			</a-form-model-item>
		</a-form-model>
	</div>
</template>
<script>
import moment from 'moment'
// import { BigNumber } from '@polymeshassociation/polymesh-sdk'
export default {
	props: {
		ticker: {
			type: String,
			default: ''
		},
		assets: {
			type: Object,
			default: () => ({})
		},
		statisticsObj: {
			type: Object,
			default: () => ({})
		},
		currentPoint: {
			type: Object,
			default: () => ({})
		},
		loading: {
			type: Boolean,
			default: false
		},
		isInterest: {
			type: String,
			default: ''
		},
		progress: {
			type: Number,
			default: 0
		}
	},
	data() {
		const validateDeclarationDate = (rule, value, callback) => {
			console.log(rule, value, callback, this.currentPoint?.createdAt)
			if (value.valueOf() > moment(this.currentPoint?.createdAt).valueOf()){
				callback(new Error('申报时间不能大于快照时间'))
			} else {
				callback()
			}
		}
		const validatePaymentDate = (rule, value, callback) => {
			console.log(value.format('YYYY-MM-DD HH:mm:ss'))
			if (value.valueOf() < moment().valueOf()){
				callback(new Error('支付时间不能小于当前时间'))
			} else {
				callback()
			}
		}
		const validateExpiryDate = (rule, value, callback) => {
			console.log(value.format('YYYY-MM-DD HH:mm:ss'))
			if (this.form.paymentDate){
				if (value.valueOf() < this.form.paymentDate.valueOf()){
					callback(new Error('过期时间不能小于支付时间'))
				} else {
					callback()
				}
			} else {
				if (value.valueOf() < moment().valueOf()){
					callback(new Error('过期时间不能小于当前时间'))
				} else {
					callback()
				}
			}
		}
		return {
			moment,
			// form: this.$form.createForm(this, { name: 'coordinated' }),
			expandedRowKeys: [],
			isPagination: false,
			tickerList: [],
			form: {
				description: '',
				declarationDate: null,
				paymentDate: null,
				expiryDate: null,
				currency: '',
				perShare: '',
				maxAmount: 0,
				payOutAmount: 0,
				getStepThree: 1,
				currencyId: ''
			},
			portfolioList: [],
			// currencyId: '',

			labelCol: { span: 4 },
			wrapperCol: { span: 14 },
			other: '',
			// form: {
			// 	name: '',
			// 	region: undefined,
			// 	date1: undefined,
			// 	delivery: false,
			// 	type: [],
			// 	resource: '',
			// 	desc: ''
			// },
			rules: {
				description: [
					{ required: true, message: '请输入股息支付名称', trigger: 'blur' }
					// { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' }
				],
				// region: [{ required: true, message: 'Please select Activity zone', trigger: 'change' }],
				declarationDate: [
					{ required: true, message: '请选择申报时间', trigger: 'change' },
					{ validator: validateDeclarationDate, trigger: 'change' }],
				paymentDate: [
					{ required: true, message: '请选择支付时间', trigger: 'change' },
					{ validator: validatePaymentDate, trigger: 'change' }],
				expiryDate: [
					{ required: true, message: '请选择过期时间', trigger: 'change' },
					{ validator: validateExpiryDate, trigger: 'change' }
				],
				// type: [
				// 	{
				// 		type: 'array',
				// 		required: true,
				// 		message: 'Please select at least one activity type',
				// 		trigger: 'change'
				// 	}
				// ],
				portfolioId: [
					{ required: true, message: '请选择投资组合', trigger: 'change' }
				],
				currencyId: [
					{ required: true, message: '请选择支付货币', trigger: 'change' }
				],
				// resource: [
				// 	{ required: true, message: 'Please select activity resource', trigger: 'change' }
				// ],
				// desc: [{ required: true, message: 'Please input activity form', trigger: 'blur' }],
				perShare: [{ required: true, message: '请输入每个代币的支付金额', trigger: 'blur' }]
			}
		}
	},
	computed: {
		getPortList() {
			if (this.portfolioList) {
				return this.portfolioList.filter(item => {
					if (item.length > 0){
						return true
					} else {
						return false
					}
				})
			}
			return []
		},
		getTickerList() {
			if (this.portfolioList) {
				const arr = this.portfolioList[this.form.portfolioId]
				if (Array.isArray(arr) && arr.length > 0){
					return arr.filter(item => item.asset.ticker !== this.ticker)
				}
				return []
			}
			return []
		}

	},
	watch: {
		isInterest() {
			this.form = {
				description: '',
				declarationDate: null,
				paymentDate: null,
				expiryDate: null,
				currency: '',
				perShare: '',
				maxAmount: 0,
				payOutAmount: 0,
				getStepThree: 1,
				currencyId: ''
			}
			// this.currencyId = ''
		}
	},
	mounted() {
		this.getAssets()
		this.getPortfolioList()
	},
	methods: {
		change_disabledDate_pay(){
			this.form.expiryDate = null
		},
		range(start, end) {
			const result = []
			for (let i = start; i < end; i++) {
				result.push(i)
			}
			return result
		},
		disabledDate(current) {
			return current && current >= moment(this.currentPoint?.createdAt).endOf('day')
		},
		disabledDateTime() {
			const m = moment(this.currentPoint?.createdAt)
			const h = m.get('hours')
			const mi = m.minutes()
			const se = m.seconds()
			return {
				disabledHours: () => this.range(h + 1, 24),
				disabledMinutes: () => this.range(mi + 1, 60),
				disabledSeconds: () => this.range(se, 60)
			}
		},
		disabledDate_pay(current){
			return current && current < moment().startOf('day')
		},
		disabledDateTime_pay(){
			const m = moment()
			const h = m.get('hours')
			const mi = m.minutes()
			const se = m.seconds()
			return {
				disabledHours: () => this.range(0, h),
				disabledMinutes: () => this.range(0, mi),
				disabledSeconds: () => this.range(0, se)
			}
		},
		disabledDate_expiry(current){
			if (this.form.paymentDate){
				return current && current < moment(this.form.paymentDate).startOf('day')
			}
			return current && current < moment().startOf('day')
		},
		disabledDateTime_expiry(){
			const m = moment(this.form.paymentDate)
			const h = m.get('hours')
			const mi = m.minutes()
			const se = m.seconds()
			return {
				disabledHours: () => this.range(0, h),
				disabledMinutes: () => this.range(0, mi),
				disabledSeconds: () => this.range(0, se)
			}
		},
		onSubmit() {
			console.log('111')
			this.$refs.ruleForm.validate(valid => {
				if (valid) {
					// alert('submit!')
					this.continueFun(true)
				} else {
					// console.log('error submit!!')
					return false
				}
			})
		},
		resetForm() {
			this.$refs.ruleForm.resetFields()
		},
		async getPortfolioList() {
			const signIden = await this.api.getSigningIdentity()
			const getPortfolioList = await signIden.portfolios.getPortfolios()
			const arr = await Promise.all(getPortfolioList.map(async item => {
				return await item.getAssetBalances()
			}))
			this.portfolioList = arr
			this.handleChange()
		},
		calculationPayOutAmount() {
			this.form.payOutAmount = (parseFloat(this.form.perShare || 0) * parseFloat(this.statisticsObj.elligibleTokens || 0)).toFixed(2)
			return this.form.payOutAmount
		},
		async getAssets() {
			const iden = await this.api.getSigningIdentity()
			const tickerlist = await iden.getHeldAssets()
			this.tickerList = tickerlist.data.filter(item => item.ticker !== this.ticker)
		},
		handleChangePro() {
			this.form.currencyId = ''
			this.handleChange()
		},
		handleChange() {
			if (this.getTickerList?.length > 0) {
				this.form.currency = this.getTickerList[this.form.currencyId]?.asset?.ticker
				this.form.maxAmount = this.getTickerList[this.form.currencyId]?.free.toString()
			}
		},
		continueFun(bool) {
			if (!bool) {
				this.$emit('to-next', { bool, getStepThree: this.form })
				return
			}
			// if (!this.form.description) {
			// 	this.$message.warning('股息支付名称必输')
			// 	return
			// }
			// if (!this.form.declarationDate) {
			// 	this.$message.warning('申报时间必输')
			// 	return
			// }
			// if (!this.form.paymentDate) {
			// 	this.$message.warning('付款时间必输')
			// 	return
			// }
			// if (!this.form.expiryDate) {
			// 	this.$message.warning('到期日必输')
			// 	return
			// }
			// if (!this.form.currency) {
			// 	this.$message.warning('支付货币必选')
			// 	return
			// }
			// if (!this.form.perShare) {
			// 	this.$message.warning('每个代币的支付金额必输')
			// 	return
			// }
			// const createdAt = this.currentPoint.createdAt
			// const shotTime = createdAt.getTime()
			// const declarationDate = this.form.declarationDate.valueOf()
			// const paymentDate = this.form.paymentDate.valueOf()
			// const expiryDate = this.form.expiryDate.valueOf()
			// const now = Date.now()
			// if (declarationDate > shotTime) {
			// 	this.$message.warning('申报时间必须小于快照时间' + createdAt.toLocaleString())
			// 	return
			// }

			// if (expiryDate <= now) {
			// 	this.$message.warning('到期日必须大于当前时间')
			// 	return
			// }

			// if (paymentDate >= expiryDate) {
			// 	this.$message.warning('到期日必须大于付款时间')
			// 	return
			// }
			if (parseFloat(this.form.maxAmount) < this.form.payOutAmount) {
				this.$message.warning('可支付的代币不足以支付本次股息')
				return
			}

			this.$emit('to-next', {
				bool, getStepThree: Object.assign({ ...this.form }, {
					declarationDate: this.form.declarationDate.toDate(),
					paymentDate: this.form.paymentDate.toDate(),
					expiryDate: this.form.expiryDate.toDate()
				})
			})
		}
	}
}
</script>
<style lang="scss">
.cor-action-gray{
  label{
    color:rgba(0, 0, 0, 0.45);
  }
}

</style>
