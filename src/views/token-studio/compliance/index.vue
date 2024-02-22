<template>
	<div class="compliance">
		<div class="mb-24 box-shadow">
			<a-space direction="vertical" size="middle">
				<span class="font-20">合规性</span>
				<span class="font-14 secondary-color">在这里为您的资产建立传输规则，只有经过批准的认证提供者所做的认证才会被检查资产传输。</span>
			</a-space>
		</div>
		<div class="mb-24 box-shadow">
			<a-space class="mb-24" style="justify-content: space-between;width:100%;">
				<span class="font-16">批准的认证提供者</span>
				<a-button type="primary" @click="handelProvider(null)">添加提供者</a-button>
			</a-space>
			<a-table class="tab-wrap" :rowKey="(record, index) => { return index }" :columns="columns" :data-source="providersData" :pagination="false">
				<template #did="text">
					<span class="primary-color">{{ text.substr(0, 5) }}...{{ text.substr(-5) }}</span>
				</template>
				<template #customTitle>
					提供者名称
					<a-tooltip>
						<template #title>这些名称只存储在您的浏览器上，在任何其他浏览器上都不可见，或者在删除本地存储时也不可见</template>
						<a-icon type="info-circle" class="font-16" />
					</a-tooltip>
				</template>
				<template v-for="item in attestationEnum" :slot="item.label" slot-scope="text,record">
					<a-icon v-if="record.trustedFor.includes(item.value)" :key="item.value" type="check-circle" theme="filled" class="font-20 primary-color" />
					<a-icon v-else :key="item.label" type="minus-circle" theme="filled" :style="{ fontSize:'22px', color:'#b5b5b5' }" />
				</template>
				<template #action="record">
					<a-space size="large">
						<a-button class="error-color p-0" type="link" @click="delProvider(record)">删除</a-button>
						<a-button class="p-0" type="link" @click="handelProvider(record)">编辑</a-button>
					</a-space>
				</template>
			</a-table>
		</div>
		<div class="box-shadow">
			<a-space direction="vertical" size="middle" class="mb-24">
				<span class="font-20">交易规则</span>
				<span class="font-14 secondary-color">在下方为您的资产设置转账规则。此规则可以有多个条件，必须满足这些条件才能使传输成功。该规则将适用于两种主要发行；以及二次转移。请注意，此规则可以随时更改以用于将来的传输。</span>
			</a-space>
			<div>
				<a-space size="middle">
					<a-space align="center" class="font-14">
						<a-switch v-model="isExternalAgent" />免除合规规则的主要发行
					</a-space>
					<div>
						<a-button v-if="arePaused" type="primary" @click="handleRule('unpause')">
							<a-icon type="play-circle" theme="filled" />启用规则
						</a-button>
						<a-button v-else type="primary" @click="handleRule('pause')">
							<a-icon type="pause-circle" theme="filled" />暂停规则
						</a-button>
					</div>
				</a-space>
			</div>
			<a-divider style="margin-bottom:0;" />
			<div class="flex">
				<div class="templates mt-24">
					<div class="font-16">规则模板</div>
					<RuleTemplate :ruleScope="{ type: 'Ticker', value: ticker }" @selectRule="selectRule"></RuleTemplate>
				</div>
				<a-divider class="ml-24 mr-24" type="vertical" style="height:auto; margin-bottom: -24px" />
				<div class="configuration mt-24">
					<div class="font-16">规则配置</div>
					<a-space size="large" class="mt-20 mb-32">
						<a-checkbox v-model="isBuyLockup">强制购买锁定</a-checkbox>
						<a-checkbox v-model="isSellLockup">强制卖出锁定</a-checkbox>
					</a-space>
					<div>
						<div class="font-16 mb-16">规则条件</div>
						<a-form-model ref="form" :model="formData">
							<a-row
								v-for="(item, index) in formData.data"
								:key="index"
								:gutter="16"
								:class="'flex flexItem pb-24 mb-24 item'+index"
							>
								<a-col :span="3" class="index font-14">条件 {{ index + 1 }}</a-col>
								<a-col :span="4" class="target">
									<a-form-model-item :prop="'data[' + index + '].target'" :rules="{ required: true, message: '必填项'}">
										<a-select v-model="item.target" placeholder="目标">
											<a-select-option v-for="option in targetEnum" :key="option.value">
												{{ option.label }}
											</a-select-option>
										</a-select>
									</a-form-model-item>
								</a-col>
								<a-col :span="4" class="conditionType">
									<a-form-model-item
										:prop="'data[' + index + '].type'"
										:validate-status="item.type ? ['IsAnyOf', 'IsNoneOf'].includes(item.type) && item.claims.length < 2 ? 'error' : 'success' : 'error'"
										:help="item.type ? ['IsAnyOf', 'IsNoneOf'].includes(item.type) && item.claims.length < 2 ? '必须至少有两个条件' : '' : '必填项'"
									>
										<a-select v-model="item.type" placeholder="选择条件" @change="changeCondition($event, index)">
											<a-select-option v-for="option in conditionEnum" :key="option.value">
												{{ option.label }}
											</a-select-option>
										</a-select>
									</a-form-model-item>
								</a-col>
								<a-col :span="12" class="attestationGroup">
									<a-row
										v-if="['IsPresent', 'IsAbsent'].includes(item.type)"
										class="flex claim"
										:gutter="16"
									>
										<a-col :span="9" class="attestation">
											<a-form-model-item :prop="'data[' + index + '].claim.type'" :rules="{ required: true, message: '必填项'}">
												<a-select v-model="item.claim.type" placeholder="证明书">
													<a-select-option v-for="option in attestationEnum" :key="option.value">
														{{ option.label }}
													</a-select-option>
												</a-select>
											</a-form-model-item>
										</a-col>
										<a-col :span="9" class="code">
											<a-form-model-item
												v-if="item.claim.type === 'Jurisdiction'"
												:prop="'data[' + index + '].claim.code'"
												:rules="{ required: true, message: '必填项'}"
											>
												<a-select v-model="item.claim.code" placeholder="管辖范围">
													<a-select-option v-for="option in codeEnum" :key="option.value">
														{{ option.label }}
													</a-select-option>
												</a-select>
											</a-form-model-item>
										</a-col>
									</a-row>
									<div v-if="['IsAnyOf', 'IsNoneOf'].includes(item.type)" class="claims">
										<a-row
											v-for="(claim, cIndex) in item.claims"
											:key="cIndex"
											class="flex"
											:gutter="16"
										>
											<a-col :span="9" class="attestation">
												<a-form-model-item
													v-if="claim.type !== 'Jurisdiction' || (claim.type === 'Jurisdiction' && item.claims[cIndex - 1]?.type !== 'Jurisdiction')"
													:prop="'data[' + index + '].claims['+ cIndex +'].type'"
													:rules="{ required: true, message: '必填项'}"
												>
													<a-select v-model="claim.type" placeholder="证明书" @change="getAttestationVal">
														<template v-for="option in attestationEnum">
															<a-select-option
																v-if="!attestationVal[index].includes(option.value) || claim.type === option.value"
																:key="option.value"
															>
																{{ option.label }}
															</a-select-option>
														</template>
													</a-select>
												</a-form-model-item>
											</a-col>

											<a-col v-if="claim.type === 'Jurisdiction'" :span="9">
												<a-form-model-item :prop="'data[' + index + '].claims['+ cIndex +'].code'" :rules="{ required: true, message: '必填项'}">
													<a-select v-model="claim.code" placeholder="管辖范围">
														<a-select-option v-for="option in codeEnum" :key="option.value">
															{{ option.label }}
														</a-select-option>
													</a-select>
												</a-form-model-item>
											</a-col>

											<a-col v-if="claim.type === 'Jurisdiction' && item.claims[cIndex - 1]?.type === 'Jurisdiction'" :span="2" style="text-align: center;margin-top:8px;">
												<span class="icon jurIcon">
													<a-icon
														style="color:rgba(0, 0, 0, 0.45);"
														type="close"
														:style="{ fontSize: '20px' }"
														@click="delJurisdiction(index, cIndex)"
													/>
												</span>
											</a-col>
											<a-col v-if="cIndex !== 0 && (claim.type !== 'Jurisdiction' || (claim.type === 'Jurisdiction' && item.claims[cIndex - 1]?.type !== 'Jurisdiction'))" :span="2" class="icon" style="margin-top:8px;padding-left:17px;">
												<a-icon
													style="color:rgba(0, 0, 0, 0.45);"
													type="close-circle"
													class="font-20"
													@click="delAttestation(index, cIndex)"
												/>
											</a-col>
											<a-col v-if="claim.type === 'Jurisdiction' && item.claims[cIndex + 1]?.type !== 'Jurisdiction'" :offset="9" :span="11">
												<a-button
													type="link"
													class="linkBtn"
													size="small"
													@click="addJurisdiction(index, cIndex)"
												>
													<a-icon type="plus" />添加管辖范围
												</a-button>
											</a-col>
										</a-row>
										<a-button type="link" class="linkBtn" size="small" @click="addAttestation(index)">
											<a-icon type="plus" />添加证明书
										</a-button>
									</div>
								</a-col>
								<a-col :span="1" class="operation">
									<a-icon type="delete" class="font-20" style="color:#FF4D4F;" @click="delCondition(index)" />
								</a-col>
							</a-row>
						</a-form-model>
						<a-button type="link p-0" @click="addCondition"><a-icon type="plus" />添加条件</a-button>
					</div>
					<div class="mt-16">
						<a-button type="primary" @click="submitChanges">提交修改</a-button>
						<a-button type="danger" style="margin-left:16px;" @click="handleRule('reset')">清空规则</a-button>
					</div>
				</div>
			</div>
		</div>
		<ProviderDrawer
			v-if="visible"
			:attestationEnum="attestationEnum"
			:providers="providerProp"
			:trustedClaimIssuers="trustedClaimIssuers"
			@close="close"
		/>
	</div>
</template>

<script>
import ProviderDrawer from './component/addProviders'
import RuleTemplate from './component/ruleTemplates'

const columns = [
	{
		dataIndex: 'name',
		slots: { title: 'customTitle' },
		key: 'name'
	},
	{
		title: 'Polymesh账户',
		dataIndex: 'did',
		key: 'did',
		scopedSlots: { customRender: 'did' }
	},
	{
		title: 'Buy Lockup',
		dataIndex: 'BuyLockup',
		key: 'BuyLockup',
		scopedSlots: { customRender: 'BuyLockup' }
	},
	{
		title: 'Sell Lockup',
		dataIndex: 'SellLockup',
		key: 'SellLockup',
		scopedSlots: { customRender: 'SellLockup' }
	},
	{
		title: 'KYC',
		dataIndex: 'KYC',
		key: 'KYC',
		scopedSlots: { customRender: 'KYC' }
	},
	{
		title: 'Jurisdiction',
		dataIndex: 'Jurisdiction',
		key: 'Jurisdiction',
		scopedSlots: { customRender: 'Jurisdiction' }
	},
	{
		title: 'Accredited',
		dataIndex: 'Accredited',
		key: 'Accredited',
		scopedSlots: { customRender: 'Accredited' }
	},
	{
		title: 'Affiliate',
		dataIndex: 'Affiliate',
		key: 'Affiliate',
		scopedSlots: { customRender: 'Affiliate' }
	},
	{
		title: 'Exempted',
		dataIndex: 'Exempted',
		key: 'Exempted',
		scopedSlots: { customRender: 'Exempted' }
	},
	{
		title: 'Blocked',
		key: 'Blocked',
		dataIndex: 'Blocked',
		scopedSlots: { customRender: 'Blocked' }
	},
	{
		title: '操作',
		key: 'action',
		scopedSlots: { customRender: 'action' }
	}
]
const targetEnum = [
	{
		value: 'Receiver',
		label: '接收方'
	}, {
		value: 'Sender',
		label: '发送方'
	}, {
		value: 'Both',
		label: '双方'
	}
]
const conditionEnum = [
	{
		value: 'IsPresent',
		label: '必须'
	}, {
		value: 'IsAbsent',
		label: '不能'
	}, {
		value: 'IsAnyOf',
		label: '是否有'
	}, {
		value: 'IsNoneOf',
		label: '都不是'
	}
]
const attestationEnum = [
	{
		value: 'Accredited',
		label: 'Accredited'
	}, {
		value: 'Affiliate',
		label: 'Affiliate'
	}, {
		value: 'Blocked',
		label: 'Blocked'
	}, {
		value: 'BuyLockup',
		label: 'BuyLockup'
	}, {
		value: 'Exempted',
		label: 'Exempted'
	}, {
		value: 'Jurisdiction',
		label: 'Jurisdiction'
	}, {
		value: 'KnowYourCustomer',
		label: 'KYC'
	}, {
		value: 'SellLockup',
		label: 'SellLockup'
	}
]
const codeEnum = [
	{
		value: 'Af',
		label: 'Afghanistan'
	}, {
		value: 'Ax',
		label: 'Åland Islands'
	}, {
		value: 'Al',
		label: 'Albania'
	}, {
		value: 'Ba',
		label: 'Bahamas'
	}, {
		value: 'Cn',
		label: 'China'
	}
]
export default {
	name: 'CompliancePage',
	components: {
		ProviderDrawer,
		RuleTemplate
	},
	data() {
		return {
			columns,
			providersData: [],
			arePaused: '',
			targetEnum,
			conditionEnum,
			attestationEnum,
			codeEnum,
			did: '',
			trustedClaimIssuers: null,
			isExternalAgent: false,
			isBuyLockup: false,
			isSellLockup: false,
			rules: [],
			requirementData: [],
			attestationVal: [],
			visible: false,
			providerProp: null,
			formData: {
				data: null
			}
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler() {
				this.$router.replace('/tokenStudio')
			}
		}
	},
	created() {
		this.initPageInfo()
	},
	mounted() {},
	methods: {
		async initPageInfo() {
			this.ticker = this.$route.params.ticker
			this.asset = await this.api.assets.getAsset({
				ticker: this.ticker
			})
			this.$scope = {
				type: 'Ticker', // 枚举参数 'Custom' 'Identity' 'Ticker'
				value: this.ticker
			}
			this.requirements = this.asset.compliance.requirements
			this.trustedClaimIssuers = this.asset.compliance.trustedClaimIssuers
			this.getRules()
			this.getProviders()
			this.arePausedRule()
		},

		async getRules() {
			this.rules = await this.requirements.get()
			this.formatRules()
		},

		formatRules() {
			const requirementData = this.rules.requirements.map((item) => {
				return [...item.conditions]
			})
			this.requirementData = requirementData.flat(2)
			this.requirementData = this.requirementData.filter(item => {
				if (item.type === 'IsExternalAgent' && item.target === 'Sender') {
					this.isExternalAgent = true
				} else if (item.type === 'IsAbsent' && item.target === 'Receiver' && item.claim?.type === 'BuyLockup') {
					this.isBuyLockup = true
				} else if (item.type === 'IsAbsent' && item.target === 'Sender' && item.claim?.type === 'SellLockup') {
					this.isSellLockup = true
				} else {
					return item
				}
			})
			this.$set(this.formData, 'data', this.requirementData)
			this.getAttestationVal()
		},

		async getProviders() {
			this.providers = await this.trustedClaimIssuers.get()
			this.formatProviders()
		},

		formatProviders() {
			let curTokens = []
			const local = localStorage.getItem('attestationProviderDetails')
			if (local) {
				const details = JSON.parse(local)
				curTokens = details.filter(item => item.tokenSymbol === this.ticker)
			}
			this.providersData = this.providers.map(item => {
				const did = item.identity.did
				const cur = curTokens.filter(i => i.did === did)
				return {
					date: cur[0]?.date,
					name: cur[0]?.name,
					did,
					trustedFor: item.trustedFor
				}
			})
		},

		async delProvider(row){
			try {
				const remove = await this.trustedClaimIssuers.remove({
					claimIssuers: [row.did]
				})
				this.$notification.warn({
					key: 'delProvider',
					message: '执行中',
					description: `删除供应商...`,
					duration: 0
				})
				await remove.run()
				const local = localStorage.getItem('attestationProviderDetails')
				if (local) {
					const details = JSON.parse(local)
					const index = details.findIndex(item => item.tokenSymbol === this.ticker && item.did === row.did)
					if (index > -1) {
						details.splice(index, 1)
						localStorage.setItem('attestationProviderDetails', JSON.stringify(details))
					}
				}
				this.$notification.success({
					key: 'delProvider',
					message: '执行成功',
					description: `删除供应商...`,
					duration: 0
				})
				this.getProviders()
			} catch (error) {
				this.$notification.destroy()
				this.$message.error(error.message)
			}
		},

		handelProvider(data){
			this.visible = true
			this.providerProp = data ? { ...data } : null
		},

		close(e){
			this.visible = false
			if (e === 'success') {
				this.getProviders()
			}
		},

		/** 控制option是否显示  */
		getAttestationVal() {
			this.attestationVal = this.requirementData.map((item) => {
				if (item.claims) {
					return item.claims.map((c) => {
						return c.type
					})
				} else {
					return [item.claim?.type]
				}
			})
		},

		/** 检查资产合规规则是否暂停 */
		async arePausedRule() {
			this.arePaused = await this.requirements.arePaused()
		},

		/** 暂停 or 启用 or 清空规则 */
		async handleRule(action){
			try {
				const description = {
					unpause: '启用规则...',
					pause: '暂停规则...',
					reset: '清空规则...'
				}
				this.$notification.warn({
					key: action,
					message: '执行中',
					description: description[action],
					duration: 0
				})
				const ruleRun = await this.requirements[action]()
				await ruleRun.run()
				this.$notification.success({
					key: action,
					message: '执行成功',
					description: description[action],
					duration: 0
				})
				this.arePaused = !this.arePaused
			} catch (error) {
				this.$notification.destroy()
				this.$message.error(error.message)
			}
		},

		addJurisdiction(index, cIndex) {
			this.requirementData[index].claims.splice(cIndex + 1, 0, {
				code: undefined,
				scope: this.$scope,
				type: 'Jurisdiction'
			})
		},

		addAttestation(index) {
			this.requirementData[index].claims.push({
				scope: this.$scope,
				type: undefined
			})
		},

		addCondition() {
			this.requirementData.push({
				claim: {
					scope: this.$scope,
					type: undefined
				},
				target: 'Receiver',
				type: undefined
			})
			this.getAttestationVal()
		},

		delJurisdiction(index, cIndex) {
			this.requirementData[index].claims.splice(cIndex, 1)
		},

		delAttestation(index, cIndex) {
			if (this.requirementData[index].claims[cIndex].type === 'Jurisdiction') {
				const data = this.requirementData[index].claims.filter(
					(item) => item.type !== 'Jurisdiction'
				)
				this.$set(this.requirementData[index], 'claims', data)
			} else {
				this.requirementData[index].claims.splice(cIndex, 1)
			}
			this.getAttestationVal()
		},

		delCondition(i) {
			this.requirementData.splice(i, 1)
			this.getAttestationVal()
		},

		changeCondition(val, index){
			if (['IsAnyOf', 'IsNoneOf'].includes(val)) {
				delete this.requirementData[index].claim
				this.$set(this.requirementData[index], 'claims', [{
					scope: this.$scope,
					type: undefined
				}, {
					scope: this.$scope,
					type: undefined
				}])
			} else {
				delete this.requirementData[index].claims
				this.$set(this.requirementData[index], 'claim', {
					scope: this.$scope,
					type: undefined
				})
			}
			this.getAttestationVal()
		},

		async submitChanges(){
			this.$refs['form'].validate(async(valid, datas) => {
				if (!valid || document.querySelectorAll('.configuration .has-error').length > 0) {
					console.log('error submit!!')
					return false
				}
				try {
					const submitData = JSON.parse(JSON.stringify(this.requirementData))
					const requirements = [submitData]
					if (this.isExternalAgent) {
						const isEobj = [{
							type: 'IsExternalAgent',
							target: 'Sender'
						}]
						requirements.unshift(isEobj)
					}
					if (this.isBuyLockup) {
						const isBobj = {
							type: 'IsAbsent',
							claim: {
								type: 'BuyLockup',
								scope: this.$scope
							},
							target: 'Receiver'
						}
						submitData.unshift(isBobj)
					}
					if (this.isSellLockup) {
						const isSobj = {
							type: 'IsAbsent',
							claim: {
								type: 'SellLockup',
								scope: this.$scope
							},
							target: 'Sender'
						}
						submitData.unshift(isSobj)
					}
					const setRule = await this.requirements.set({
						requirements
					})
					this.$notification.warn({
						key: 'update',
						message: '执行中',
						description: '修改规则...',
						duration: 0
					})
					await setRule.run()
					this.$notification.success({
						key: 'update',
						message: '执行成功',
						description: '修改规则...',
						duration: 0
					})
				} catch (error) {
					this.$notification.destroy()
					this.$message.error(error.message)
				}
			})
		},

		selectRule(rule){
			this.isExternalAgent = false
			this.isBuyLockup = false
			this.isSellLockup = false
			this.requirementData = rule
			this.$set(this.formData, 'data', this.requirementData)
			this.getAttestationVal()
		}
	}
}
</script>

<style lang="scss" scoped>
.compliance{
	min-width: 1000px;
	.flex{
		display: flex;
    flex-flow: row wrap;
	}
	.tab-wrap{
		::v-deep .ant-table-thead > tr > th, ::v-deep .ant-table-tbody > tr > td{
			padding: 10px 6px;
		}
	}
	.templates{
		width: 183px;
	}
	.configuration{
		flex:1;
		overflow: hidden;
		::v-deep .ant-form-item{
			margin-bottom: 0;
		}
	}
	.flexItem{
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
		.index{
			line-height: 36px;
		}
		.flex.code{
			::v-deep .ant-space-item{
				&:first-child{
					flex:1;
					min-width: 120px;
				}
				&:last-child{
					width: 20px;
				}
			}
		}
		.operation{
			// position: absolute;
			// right: 10px;
			// top: 50%;
			margin-top: 10px;
		}
	}
  .attestation{
    // text-align: right;
    margin-left:6px;
  }
}
</style>
