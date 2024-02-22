<template>
	<a-modal
		:visible="true"
		title="分发代币"
		centered
		:closable="false"
		:maskClosable="false"
		:destroyOnClose="true"
		cancelText="取消"
		okText="提交"
		:okButtonProps="{props: { loading: iconLoading } }"
		@cancel="closeModal"
		@ok="saveModal"
	>
		<div class="wrap">
			<div class="font-14 mb-8 title-color">
				输入您要向其分发此代币的持有者的 Polymesh 帐户。
			</div>
			<a-tips title="提示" :bgSize="66">分发您的代币可能会触发适用的证券监管机构或其他政府机构的注册或备案要求。 在分发您的代币之前，请咨询法律和财务顾问。</a-tips>
			<div class="flex font-14 secondary-color mt-24 mb-24">
				<a-space direction="vertical" class="item-w50">
					<div>分销代理余额</div>
					<a-space align="baseline">
						<span class="font-32 weight-500 title-color">{{ balance }}</span>
						{{ ticker }}
					</a-space>
				</a-space>
				<a-space direction="vertical" class="item-w50">
					<div>可分发</div>
					<a-space align="baseline">
						<span class="font-32 weight-500 primary-color">{{ balanceFree }}</span>
						{{ ticker }}
					</a-space>
				</a-space>
			</div>
			<div class="ruleForm">
				<a-form-model ref="ruleForm" :model="ruleForm">
					<a-form-model-item label="分布事件" prop="memo" :rules="{ required: true, message: '请选择'}" class="form-item">
						<a-select v-model="ruleForm.memo">
							<a-select-option v-for="venue in venues" :key="venue.value" :value="venue.value">
								{{ venue.label }}
							</a-select-option>
						</a-select>
					</a-form-model-item>
					<a-form-model-item v-if="ruleForm.memo==='add'" prop="venue" :rules="{ required: true, message: '请输入'}" class="form-item">
						<a-input v-model="ruleForm.venue"></a-input>
					</a-form-model-item>
					<a-form-model-item label="Polymesh账户" prop="account" :rules="{ required: true, message: '请输入'}" class="form-item">
						<a-input v-model="ruleForm.account" :disabled="account!==''" @blur="checkRules"></a-input>
						<div>
							<a-collapse v-if="errorInfo.length" :bordered="false">
								<a-collapse-panel header="该账户未满足令牌传输规则" style="background: #fae6e8;border: 0;">
									<ul style="padding-left: 44px;color:red;">
										<li v-for="(error, index) in errorInfo" :key="index" style="list-style: disc;">
											{{ error.condition.target }} doesn't have
											<template v-if="error.condition.claims">
												one of these attestations:
												<span v-for="(claim, index1) in error.condition.claims" :key="index1">
													{{ claim.type }}
													{{ claim.type==='Jurisdiction' ? `: ${claim.code}` : '' }}
													,
												</span>
											</template>
											<template v-else>
												valid
												{{ error.condition.claim.type }}
												{{ error.condition.claim.type==='Jurisdiction' ? `: ${error.condition.claim.code}` : '' }}
												attestation
											</template>
										</li>
									</ul>
								</a-collapse-panel>
							</a-collapse>
							<p v-if="errorMsg" style="color:red;">{{ errorMsg }}</p>
						</div>
					</a-form-model-item>
					<a-form-model-item label="分发数量" prop="amount" :rules="{ required: true, validator: validatorAmount }" class="form-item">
						<a-input v-model="ruleForm.amount" placeholder="0.00" :suffix="ticker"></a-input>
					</a-form-model-item>
				</a-form-model>
			</div>
		</div>
	</a-modal>
</template>

<script>
import ATips from '@/views/components/aTips'
import { BigNumber } from '@polymeshassociation/polymesh-sdk'
export default {
	name: 'Distributetokens',
	components: {
		ATips
	},
	props: {
		account: {
			type: String,
			default: () => {
				return ''
			}
		},
		balance: {
			type: String,
			default: () => {
				return ''
			}
		},
		balanceFree: {
			type: String,
			default: () => {
				return ''
			}
		}
	},
	data(){
		return {
			iconLoading: false,
			ruleForm: {
				amount: '',
				memo: '',
				account: '',
				venue: ''
			},
			ticker: '',
			venues: [],
			errorInfo: [],
			errorMsg: ''
		}
	},
	created(){
		this.run()
	},
	methods: {
		validatorAmount(rule, value, callback){
			if (!value) {
				callback(new Error('请输入'))
			}
			if (isNaN(value)) {
				callback(new Error('请输入数字'))
			}
			if (value * 1 > this.balanceFree.replaceAll(',', '') * 1) {
				callback(new Error('分发的令牌数量不能大于可分发的数量！'))
			}
			callback()
		},
		async run (){
			if (this.account) {
				this.ruleForm.account = this.account
			}
			this.ticker = this.$route.params.ticker
			const signing = await this.api.accountManagement.getSigningAccount()
			this.identity = await signing.getIdentity()
			const venues = await this.identity.getVenues()
			this.asset = await this.api.assets.getAsset({
				ticker: this.ticker
			})
			this.venues = [{
				label: '添加一个新的分布事件',
				value: 'add'
			}]
			venues.forEach(async (venue) => {
				const _venue = await venue.details()
				if (_venue.type === 'Distribution') {
					const id = await venue.toHuman()
					const obj = {
						label: _venue.description,
						value: id
					}
					this.venues.push(obj)
				}
			})
		},

		closeModal(){
			this.$emit('close')
		},

		async checkRules(){
			this.errorMsg = ''
			this.errorInfo = []
			if (!this.ruleForm.account) {
				return false
			}
			try {
				const res = await this.asset.settlements.canTransfer({
					to: this.ruleForm.account,
					amount: new BigNumber(0)
				})
				console.log(res)
				if (res.compliance?.complies === false) {
					if (res.compliance?.requirements?.length > 0) {
						this.formatErrorInfo(res)
					} else {
						this.errorMsg = `${this.ticker}必须至少有一个遵从性规则来分发令牌。`
					}
					return false
				} else {
					return true
				}
			} catch (error) {
				this.errorMsg = '请输入有效的账户'
				return false
			}
		},

		formatErrorInfo(res){
			const requirementData = res.compliance.requirements.map((item) => {
				return [...item.conditions]
			})
			this.errorInfo = requirementData.flat(2).filter(i => i.complies === false)
		},

		alertError(msg){
			this.$message.warning(msg)
			this.iconLoading = false
		},

		async saveModal(){
			this.$refs['ruleForm'].validate(async(valid, datas) => {
				if (!valid) {
					console.log('error submit!!')
					return false
				}
				if (this.errorInfo.length) {
					this.alertError('该账户未满足令牌传输规则！')
					return false
				}
				this.iconLoading = true
				if (!await this.checkRules()) {
					this.iconLoading = false
					return false
				}
				if (this.errorMsg) {
					this.iconLoading = false
					return false
				}
				try {
					let instructionQ = null
					if (this.ruleForm.memo === 'add') {
						this.$notification.warn({
							key: 'venue',
							message: '执行中',
							description: `创建场地...`,
							duration: 0
						})
						this.$notification.warn({
							key: 'update',
							message: '执行中',
							description: `分发令牌...`,
							duration: 0
						})
						const venueQ = await this.api.settlements.createVenue({
							description: this.ruleForm.venue,
							type: 'Distribution'
						})
						const newVenue = await venueQ.run()
						this.$notification.success({
							key: 'venue',
							message: '执行成功',
							description: `创建场地...`,
							duration: 0
						})
						instructionQ = await newVenue.addInstruction({
							legs: [
								{
									to: this.ruleForm.account,
									from: this.identity,
									amount: new BigNumber(this.ruleForm.amount),
									asset: this.ticker
								}
							]
						})
					} else {
						this.$notification.warn({
							key: 'update',
							message: '执行中',
							description: `分发令牌...`,
							duration: 0
						})
						instructionQ = await this.api.settlements.addInstruction({
							legs: [
								{
									to: this.ruleForm.account,
									from: this.identity,
									amount: new BigNumber(this.ruleForm.amount),
									asset: this.ticker
								}
							],
							venueId: new BigNumber(this.ruleForm.memo)
						})
					}
					await instructionQ.run()
					this.$notification.success({
						key: 'update',
						message: '执行成功',
						description: `分发令牌...`,
						duration: 0
					})
					this.$emit('close', 'distribute')
				} catch (error) {
					this.iconLoading = false
					this.$notification.destroy()
					this.$message.error(error.message)
				}
			})
		}
	}
}
</script>
<style lang="scss" scoped>
	.flex{
		display: flex;
		.item-w50{
			width: 50%;
		}
	}
	.ant-space-item,
	::v-deep .ant-form-item-control,
	::v-deep .ant-form-item-label{
		line-height: 1;
	}
	::v-deep .ant-form-item-label{
		margin-bottom: 8px;
	}
</style>
