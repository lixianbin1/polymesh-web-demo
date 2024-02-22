<template>
	<a-modal
		:visible="visible"
		:title="modifyClaimObj?.did?'编辑证书':'添加新证书'"
		centered
		:closable="false"
		:maskClosable="false"
		:destroyOnClose="true"
		width="800px"
	>
		<a-row type="flex" :gutter="[24, 24]">
			<a-col :span="24">
				<div>向任何 Polymesh 帐户添加一个或多个证明。当资产持有者发送或接收您的资产时，只会检查由批准的证明提供者编写的证明。</div>
				<!-- <a-tips title="信息">证书提供者是一个可信的Polymesh账户，可以为您的令牌向其他PolymeshAccount添加证书。</a-tips> -->
				<!-- <div class="weight-500 mt-16">我想附上的证书</div> -->
				<div class="mt-16">Polymesh账户</div>
				<div class="mt-8">
					<a-input v-model.trim="did" :disabled="!!modifyClaimObj" />
					<div v-show="isDidExistence" style="color:red;">此Polymesh账户已添加。请编辑ID上的证书。</div>
				</div>
				<h4 class="mt-16">附上证明</h4>
				<a-row type="flex" align="middle" class="h32 h50">
					<a-col :span="8"><a-switch v-model="cliaimObj.BuyLockup.value" /> &nbsp;Buy Lockup</a-col>
					<a-col v-if="cliaimObj.BuyLockup.value" :span="16" style="text-align:right;">
						<a-checkbox v-model="cliaimObj.BuyLockup.expiryBool" @change="onChangeBuyLockup">
							无限期
						</a-checkbox>
						<span v-if="!cliaimObj.BuyLockup.expiryBool === true">&nbsp;到期&nbsp;</span>
						<a-date-picker v-show="!cliaimObj.BuyLockup.expiryBool === true" v-model="cliaimObj.BuyLockup.expiry" />
					</a-col>
				</a-row>
				<hr style="border-color:rgba(0, 0, 0, 0.04);" />
				<a-row type="flex" align="middle" class="h32 h50">
					<a-col :span="8"><a-switch v-model="cliaimObj.SellLockup.value" /> &nbsp;Sell Lockup</a-col>
					<a-col v-if="cliaimObj.SellLockup.value" :span="16" style="text-align:right;">
						<a-checkbox v-model="cliaimObj.SellLockup.expiryBool" @change="onChangeSellLockup">
							无限期
						</a-checkbox>
						<span v-show="!cliaimObj.SellLockup.expiryBool === true">&nbsp;到期&nbsp;</span>
						<a-date-picker v-if="!cliaimObj.SellLockup.expiryBool === true" v-model="cliaimObj.SellLockup.expiry" />
					</a-col>
				</a-row>
				<hr style="border-color:rgba(0, 0, 0, 0.04);" />
				<a-row type="flex" align="middle" class="h32 h50">
					<a-col :span="8"><a-switch v-model="cliaimObj.KnowYourCustomer.value" /> &nbsp;KYC</a-col>
					<a-col v-if="cliaimObj.KnowYourCustomer.value" :span="16" style="text-align:right;">
						<a-checkbox v-model="cliaimObj.KnowYourCustomer.expiryBool" @change="onChangeKnowYourCustomer">
							无限期
						</a-checkbox>
						<span v-show="!cliaimObj.KnowYourCustomer.expiryBool === true">&nbsp;到期&nbsp; </span>
						<a-date-picker
							v-if="!cliaimObj.KnowYourCustomer.expiryBool === true"
							v-model="cliaimObj.KnowYourCustomer.expiry"
						/>
					</a-col>
				</a-row>
				<hr style="border-color:rgba(0, 0, 0, 0.04);" />
				<a-row type="flex" align="middle" class="h32 h50">
					<a-col :span="8"><a-switch v-model="cliaimObj.Jurisdiction.value" /> &nbsp;Jurisdiction</a-col>
					<a-col v-if="cliaimObj.Jurisdiction.value" :span="16" style="text-align:right;">
						<a-select
							v-show="cliaimObj.Jurisdiction.value" v-model="cliaimObj.Jurisdiction.code" default-value="China"
							style="width: 120px"
						>
							<a-select-option value="Cn">China</a-select-option>
						</a-select>
					</a-col>
				</a-row>
				<hr style="border-color:rgba(0, 0, 0, 0.04);" />
				<a-row type="flex" align="middle" class="h32 h50">
					<a-col :span="8"><a-switch v-model="cliaimObj.Accredited.value" /> &nbsp;Accredited</a-col>
				</a-row>
				<hr style="border-color:rgba(0, 0, 0, 0.04);" />
				<a-row type="flex" align="middle" class="h32 h50">
					<a-col :span="8">	<a-switch v-model="cliaimObj.Affiliate.value" /> &nbsp;Affiliate</a-col>
				</a-row>
				<hr style="border-color:rgba(0, 0, 0, 0.04);" />
				<a-row type="flex" align="middle" class="h32 h50">
					<a-col :span="8"><a-switch v-model="cliaimObj.Exempted.value" /> &nbsp;Exempted</a-col>
				</a-row>
				<hr style="border-color:rgba(0, 0, 0, 0.04);" />
				<a-row type="flex" align="middle" class="h32 h50">
					<a-switch v-model="cliaimObj.Blocked.value" /> &nbsp;&nbsp;Blocked
				</a-row>
				<hr style="border-color:rgba(0, 0, 0, 0.04);" />
			</a-col>
		</a-row>
		<template slot="footer">
			<a-button @click="cancel">
				取消
			</a-button>
			<a-button
				type="primary" :loading="loading" :disabled="!isModify || !did || isDidExistence || isSave"
				@click="addProvider"
			>
				保存
			</a-button>
		</template>
	</a-modal>
</template>
<script>
// import ATips from '@/views/components/aTips'
import moment from 'moment'
window.moment = moment
import {
// ClaimData,
// ClaimType,
// ScopeType
} from '@polymeshassociation/polymesh-sdk/types'
import _ from 'lodash'

const getCliaimObj = () => {
	return {
		BuyLockup: { // cliaimObj.BuyLockup
			value: false,
			expiryBool: false,
			expiry: null
		},
		SellLockup: {
			value: false,
			expiryBool: false,
			expiry: null
		},
		KnowYourCustomer: {
			value: false,
			expiryBool: false,
			// date: null,
			expiry: null
		},
		Jurisdiction: {
			value: false,
			expiry: null,
			code: 'Cn'
		},
		Accredited: {
			value: false,
			expiry: null
		},
		Affiliate: {
			value: false,
			expiry: null
		},
		Exempted: {
			value: false,
			expiry: null
		},
		Blocked: {
			value: false,
			expiry: null
		}
	}
}

const defaultCheckedList = ['BuyLockup', 'SellLockup', 'KnowYourCustomer', 'Jurisdiction', 'Accredited', 'Affiliate', 'Exempted', 'Blocked']
const hasDateArr = ['BuyLockup', 'SellLockup', 'KnowYourCustomer']
export default {
	components: {
		// 'a-tips': ATips
	},
	props: {
		loading: {
			type: Boolean,
			default: false
		},
		isModify: {
			type: Boolean,
			default: false
		},
		ticker: {
			type: String,
			default: ''
		},
		visible: {
			type: Boolean,
			default: false
		},
		claimsDidList: {
			type: Array,
			default: () => ([])
		},
		modifyClaimObj: {
			type: Object,
			default: () => ({})
		},
		handleType: {
			type: String,
			default: 'add'
		}
	},
	data() {
		return {
			cliaimObj: getCliaimObj(),
			value: '',
			placement: 'left',
			did: '',
			checkedList: defaultCheckedList,
			// handleType: 'add',
			copyClaimObj: null
		}
	},
	computed: {
		isDidExistence() {
			return !this.modifyClaimObj?.did && this.claimsDidList.indexOf(this.did) > -1
		},
		isSave() {
			let flag = false
			for (const key in this.cliaimObj) {
				if (this.cliaimObj[key].value) {
					if (hasDateArr.indexOf(key) > -1) {
						if (!this.cliaimObj[key].expiryBool && this.cliaimObj[key].expiry === null) {
							flag = true
						}
					}
					if (key === 'Jurisdiction') {
						if (!this.cliaimObj[key].code) {
							flag = true
						}
					}
				}
			}
			return flag
		}

	},
	watch: {
		visible(val) {
			if (val) {
				this.cliaimObj = getCliaimObj()
				this.did = ''
			}
		},
		modifyClaimObj: {
			deep: true,
			handler(obj) {
				if (obj === null) {
					return
				}
				const originData = _.cloneDeep(obj)
				const { did, params } = originData
				this.did = did
				this.cliaimObj = params
				this.copyClaimObj = _.cloneDeep(params)
			}
		}
	},
	methods: {
		moment,
		cancel() {
			this.$emit('modify-visible', false)
		},
		async addProvider() {
			if (this.handleType === 'add') {
				this.$emit('add', {
					handleType: this.handleType,
					params: {
						target: this.did,
						claim: this.cliaimObj
					}
				})
			} else {
				// this.modifyClaims()
				this.$emit('edit', {
					handleType: this.handleType,
					params: {
						target: this.did,
						claim: this.cliaimObj
					}
				})
			}
		},

		onChangeBuyLockup(val) {
			if (val.target.checked) {
				this.cliaimObj.BuyLockup.expiry = null
			}
		},
		onChangeSellLockup(val) {
			if (val.target.checked) {
				this.cliaimObj.SellLockup.expiry = null
			}
		},
		onChangeKnowYourCustomer(val) {
			if (val.target.checked) {
				this.cliaimObj.KnowYourCustomer.expiry = null
			}
		}
		// showDrawer() {
		// 	this.$emit('modify-visible', true)
		// },
		// onClose() {
		// 	this.$emit('modify-visible', false)
		// }
	}
}
</script>
<style scoped>
.h32{
  height:32px;
}
</style>
