<template>
	<a-spin
		:spinning="load"
		size="large"
	>
		<a-row
			type="flex"
			:gutter="[24, 24]"
		>
			<a-col :span="24">
				<a-row
					class="box-shadow"
					type="flex"
				>
					<a-col :span="24">
						<div class="font-16">证书</div>
						<div class="secondary-color mt-16">证明是可以附加到 Polymesh 帐户的特征。您或您批准的证明提供者可以将证明附加到您的潜在资产持有人的 Polymesh 帐户，以便他们可以在满足您的资产合规性规则的情况下发送和接收您的资产。证明可以随时更改。</div>
					</a-col>
				</a-row>
			</a-col>
			<a-col
				v-if="!isProviderFlag"
				:span="24"
			>
				<a-row
					v-show="isShow"
					class="box-shadow"
					type="flex"
					style="color:rgb(219, 44, 62);min-height: 300px;"
				>
					<div>
						<a-icon
							type="exclamation-circle"
							theme="filled"
							class="font-30"
							color=""
						/>
					</div>
					<div class="ml-20">
						您不是此令牌的批准证书提供商。<br />
						请在<span
							class="ml-8"
							style="color: rgb(19, 72, 228);cursor: pointer;"
							@click="toCompliance"
						>&nbsp;合规性&nbsp;</span>选项卡中将您的Polymesh账户添加为经批准的认证提供商。
					</div>
				</a-row>
			</a-col>
			<a-col
				v-else
				:span="24"
			>
				<a-row
					class="box-shadow"
					type="flex"
					justify="end"
				>
					<a-col
						:span="24"
						style="text-align:right;"
					>
						<a-button
							v-show="selectedRowKeys.length > 0"
							class="mr-8"
							type="danger" ghost
							:loading="delLoading"
							@click="delMutiple"
						>删除 {{ selectedRowKeys.length }} 项目</a-button>

						<a-button
							type="primary"
							@click="addProvider"
						>添加新证书</a-button>
						<!-- <a-button type="primary" size="large" style="margin-right:10px;" @click="addNewP">添加新标识</a-button> -->
					</a-col>
					<a-col
						:span="24"
						class="mt-16 attestations-table"
					>
						<a-table
							:columns="columns"
							:data-source="claimsList"
							:rowKey="(record) => { return record.i }"
							:pagination="isPagination"
							:row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange, getCheckboxProps: getCheckboxProps }"
						>
							<span
								slot="did"
								slot-scope="text,scope,index"
								class="primary-color"
								style="cursor:pointer;"
								@click="modifyProvider(scope, index)"
							><span v-show="text">{{ text.slice(0, 5) }}...{{ text.slice(-5) }}</span></span>
							<span
								slot="provider"
								slot-scope="text"
							>
								<span v-if="text === did">我</span>
								<span v-else>{{ text.slice(0, 5) }}...{{ text.slice(-5) }}</span>
							</span>

							<span
								slot="BuyLockup"
								slot-scope="text"
							>
								<span v-if="text">{{ text.expiry ? text.expiry.toLocaleDateString() : 'No expiry' }}</span>
								<a-icon
									v-else
									type="minus-circle"
									theme="filled"
									:style="{ fontSize: '26px', color: 'grey' }"
								/>
							</span>
							<span
								slot="SellLockup"
								slot-scope="text"
							>
								<span v-if="text">{{ text.expiry ? text.expiry.toLocaleDateString() : 'No expiry' }}</span>
								<a-icon
									v-else
									type="minus-circle"
									theme="filled"
									:style="{ fontSize: '26px', color: 'grey' }"
								/>
							</span>
							<span
								slot="KnowYourCustomer"
								slot-scope="text"
							>
								<span v-if="text">{{ text.expiry ? text.expiry.toLocaleDateString() : 'No expiry' }}</span>
								<a-icon
									v-else
									type="minus-circle"
									theme="filled"
									:style="{ fontSize: '26px', color: 'grey' }"
								/>
							</span>
							<span
								slot="Jurisdiction"
								slot-scope="text"
							>
								<span v-if="text">{{ text.claim.code }}</span>
								<a-icon
									v-else
									type="minus-circle"
									theme="filled"
									:style="{ fontSize: '26px', color: 'grey' }"
								/>
							</span>
							<span
								slot="Accredited"
								slot-scope="text"
							>
								<a-icon
									v-if="text"
									type="check-circle"
									theme="filled"
									:style="{ fontSize: '26px', color: 'rgb(0, 170, 94)' }"
								/>
								<a-icon
									v-else
									type="minus-circle"
									theme="filled"
									:style="{ fontSize: '26px', color: 'grey' }"
								/>
							</span>
							<span
								slot="Affiliate"
								slot-scope="text"
							>
								<a-icon
									v-if="text"
									type="check-circle"
									theme="filled"
									:style="{ fontSize: '26px', color: 'rgb(0, 170, 94)' }"
								/>
								<a-icon
									v-else
									type="minus-circle"
									theme="filled"
									:style="{ fontSize: '26px', color: 'grey' }"
								/>
							</span>
							<span
								slot="Exempted"
								slot-scope="text"
							>
								<a-icon
									v-if="text"
									type="check-circle"
									theme="filled"
									:style="{ fontSize: '26px', color: 'rgb(0, 170, 94)' }"
								/>
								<a-icon
									v-else
									type="minus-circle"
									theme="filled"
									:style="{ fontSize: '26px', color: 'grey' }"
								/>
							</span>
							<span
								slot="Blocked"
								slot-scope="text"
							>
								<a-icon
									v-if="text"
									type="check-circle"
									theme="filled"
									:style="{ fontSize: '26px', color: 'rgb(0, 170, 94)' }"
								/>
								<a-icon
									v-else
									type="minus-circle"
									theme="filled"
									:style="{ fontSize: '26px', color: 'grey' }"
								/>
							</span>
							<span
								slot="action"
								slot-scope="text,scope,index"
								class="table-handle"
							>
								<a-icon
									v-if="scope.provider === did"
									type="delete"
									:style="{ fontSize: '20px',color:'#FF4D4F' }"
									@click="delProvider(index)"
								/>
							</span>
						</a-table>
					</a-col>
				</a-row>
			</a-col>
		</a-row>
		<AddNewProvider
			:visible="visible"
			:modifyClaimObj="modifyClaimObj"
			:assets="assets"
			:typeArr="typeArr"
			:loading="loading"
			:isModify="isModify"
			:claimsDidList="claimsDidList"
			:ticker="ticker"
			:handleType="handleType"
			@modify-visible="modifyVisible"
			@add="handleClaims"
			@add-sucess="qryCompilance"
			@refrush="qryCompilance"
			@edit="edit"
		></AddNewProvider>
	</a-spin>
</template>

<script>
import AddNewProvider from './AddNewProvider.vue'
import {
	ClaimType,
	ScopeType
} from '@polymeshassociation/polymesh-sdk/types'
import moment from 'moment'

const columns = [
	{
		title: 'Target Identity',
		dataIndex: 'did',
		width: 240,
		key: 'did',
		align: 'center',
		scopedSlots: { customRender: 'did' }
	},
	{
		title: 'Provider',
		dataIndex: 'provider',
		key: 'provider',
		align: 'center',
		width: 160,
		scopedSlots: { customRender: 'provider' }
	},
	{
		title: 'Buy Lockup',
		dataIndex: 'BuyLockup',
		width: 150,
		key: 'BuyLockup',
		align: 'center',
		scopedSlots: { customRender: 'BuyLockup' }
	},
	{
		title: 'Sell Lockup',
		width: 150,
		dataIndex: 'SellLockup',
		key: 'SellLockup',
		align: 'center',
		scopedSlots: { customRender: 'SellLockup' }
	},
	{
		title: 'KYC',
		dataIndex: 'KnowYourCustomer',
		width: 150,
		key: 'KnowYourCustomer',
		align: 'center',
		scopedSlots: { customRender: 'KnowYourCustomer' }
	},
	{
		title: 'Jurisdiction',
		width: 100,
		dataIndex: 'Jurisdiction',
		key: 'Jurisdiction',
		align: 'center',
		scopedSlots: { customRender: 'Jurisdiction' }
	},
	{
		title: 'Accredited',
		dataIndex: 'Accredited',
		key: 'Accredited',
		width: '12%',
		align: 'center',
		scopedSlots: { customRender: 'Accredited' }
	},
	{
		title: 'Affiliate',
		dataIndex: 'Affiliate',
		key: 'Affiliate',
		align: 'center',
		width: '12%',
		scopedSlots: { customRender: 'Affiliate' }
	},
	{
		title: 'Exempted',
		dataIndex: 'Exempted',
		width: '10%',
		key: 'Exempted',
		align: 'center',
		scopedSlots: { customRender: 'Exempted' }
	},
	{
		title: 'Blocked',
		dataIndex: 'Blocked',
		width: '10%',
		key: 'Blocked',
		align: 'center',
		scopedSlots: { customRender: 'Blocked' }
	},
	{
		title: 'Action',
		dataIndex: 'action',
		width: 80,
		align: 'center',
		key: 'action',
		scopedSlots: { customRender: 'action' }
	}
]
const typeArr = ['BuyLockup', 'SellLockup', 'KnowYourCustomer', 'Jurisdiction', 'Accredited', 'Affiliate', 'Exempted', 'Blocked']
export default {
	components: { AddNewProvider },
	data () {
		return {
			isModify: true,
			typeArr,
			columns,
			claimsList: [],
			ticker: this.$route.params.ticker,
			assets: null,
			visible: false,
			modifyClaimObj: {},
			isPagination: false,
			handleIndex: '',
			claimIssuers: [], // 查询到的受信任列表
			selectedRowKeys: [],
			claimsDidList: [],
			isProviderFlag: false,
			isShow: false,
			did: null,
			load: false,
			loading: false, // 按钮加载
			delLoading: false,
			modifyIndex: '',
			delObjNoRun: null,
			handleType: 'add'
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler () {
				this.$router.replace('/tokenStudio')
			}
		}
	},
	async mounted () {
		await this.getAssets()
		await this.getProviders()
	},
	methods: {
		reset(){
			this.isModify = true
			this.claimsList = []
			this.ticker = this.$route.params.ticker
			this.visible = false
			this.isPagination = false
			this.handleIndex = ''
			this.claimIssuers = [] // 查询到的受信任列表
			this.selectedRowKeys = []
			this.claimsDidList = []
			this.isProviderFlag = false
			this.isShow = false
			this.did = null
			this.load = false
			this.loading = false // 按钮加载
			this.delLoading = false
			this.modifyIndex = ''
			this.delObjNoRun = null
			this.handleType = 'add'
		},
		commonFun (step, title, e) {
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
					message: `${title}失败`,
					description: e.toString(),
					duration: 0
				})
			}
		},
		async edit (obj) {
			await this.delProvider(this.modifyIndex, 'edit')
			await this.handleClaims(obj, 'edit')
		},
		async delMutiple () { // 批量删除
			const delMulti = async() => {
				this.delLoading = true
				this.commonFun(1, '批量删除证书')
				const claims = []
				this.selectedRowKeys.forEach((item, index) => {
					const obj = this.claimsList[index]
					for (const key in obj) {
						if ((key !== 'did' && key !== 'provider') && obj[key]) {
							const { target, claim } = obj[key]
							const did = target.did
							claims.push({
								target: did, claim
							})
						}
					}
				})
				try {
					const revokeQ = await this.api.claims.revokeClaims({ claims })
					revokeQ.onStatusChange(listener => {
						console.log('监听批量删除状态改变：', listener)
					})
					await revokeQ.run()
					console.log('批量删除成功', revokeQ)
					this.commonFun(2, '批量删除证书')
					this.selectedRowKeys = []
					this.load = true
					setTimeout(() => { this.getProviders() }, 5000)
				} catch (e) {
					this.commonFun(3, '批量删除证书', e)
				} finally {
					this.delLoading = false
				}
			}
			this.$confirm({
				title: '是否批量删除选中的证书？',
				content: '删除 Polymesh 账户证书后，您将无法再将资产发送到该 Polymesh 账户。他们可以继续持有您的资产并转移到另一个有效的Polymesh账户。',
				okText: '删除',
				okType: 'primary',
				cancelText: '取消',
				onOk() {
					delMulti()
				},
				onCancel() {}
			})
		},
		onSelectChange (selectedRowKeys) {
			this.selectedRowKeys = selectedRowKeys
		},
		getCheckboxProps (record) {
			return {
				props: {
					disabled: record.provider !== this.did // Column configuration not to be checked
				}
			}
		},
		async qryCompilance (issuedClaims) {
			const count = issuedClaims.count.toString()
			const arr = []
			const claimsList = []
			for (let i = 0; i < count; i++) {
				claimsList.push([])
			}
			const newArr = issuedClaims.data
			for (let index = 0; index < newArr.length; index++) {
				const item = newArr[index]
				if (item.claim.scope.value !== this.ticker) {
					continue
				}
				if (index === 0) {
					arr.push(item.target.did)
					claimsList[0].push(item)
				} else {
					const n = arr.indexOf(item.target.did)
					if (n > -1) {
						claimsList[n].push(item)
					} else {
						claimsList[arr.length].push(item)
						arr.push(item.target.did)
					}
				}
			}
			for (let i = claimsList.length - 1; i >= 0; i--) {
				if (claimsList[i].length === 0) {
					claimsList.pop()
				}
			}

			return claimsList.map(item => {
				const obj = {
					did: '',
					provider: 'Me',
					BuyLockup: false,
					SellLockup: false,
					KnowYourCustomer: false,
					Jurisdiction: false,
					Accredited: false,
					Affiliate: false,
					Exempted: false,
					Blocked: false
				}
				item.forEach(it => {
					obj.did = it.target.did
					obj.provider = it.issuer.did
					const { claim, expiry, issuedAt, issuer, target } = it
					obj[it.claim.type] = {
						claim, expiry, issuedAt, issuer: { did: issuer.did }, target: { did: target.did }
					}
				})
				return obj
			})
		},
		async handleClaims ({ handleType, params }, str) {
			this.loading = true
			const { target, claim } = params
			const claims = []
			for (const key in claim) {
				if (claim[key].value) {
					const obj = {
						target,
						expiry: claim[key].expiry === null ? null : claim[key].expiry.toDate(),
						claim: {
							type: ClaimType[key],
							scope: {
								type: ScopeType.Ticker,
								value: this.ticker
							}
						}
					}
					if (key === 'Jurisdiction') {
						obj.claim.code = claim[key].code
					}
					claims.push(obj)
				}
			}
			const name = str ? '编辑证书' : '添加证书'
			try {
				this.commonFun(1, name)
				console.log('编辑/添加证书入参：', claims)
				const addQ = await this.api.claims.addClaims({ claims })
				let aa
				if (!str){
					aa = await addQ.run()
				} else {
					console.log('编辑证书签名 入参：', addQ, this.delObjNoRun)
					addQ.onStatusChange(listener1 => {
						console.log('监听新增状态改变：', listener1)
					})
					this.delObjNoRun.onStatusChange(listener2 => {
						console.log('监听删除状态改变：', listener2)
					})
					const batchTx = await this.api.createTransactionBatch({
						transactions: [addQ, this.delObjNoRun]
					})
					aa = await batchTx.run()
				}

				console.log('批量签名成功', aa)
				this.load = true
				setTimeout(() => {
					this.getProviders()
				}, 5000)
				this.commonFun(2, name)
			} catch (e) {
				this.commonFun(3, name, e)
			} finally {
				this.loading = false
				this.visible = false
			}
		},
		async delProvider (index, str) {
			if (!str){
				this.$confirm({
					title: '是否删除此证书？',
					content: '删除 Polymesh 账户证书后，您将无法再将资产发送到该 Polymesh 账户。他们可以继续持有您的资产并转移到另一个有效的Polymesh账户。',
					okText: '删除',
					okType: 'primary',
					cancelText: '取消',
					onOk: () => {
						this.delete(index, str)
					},
					onCancel() {}
				})
			} else {
				await this.delete(index, str)
			}
		},
		async delete(index, str){
			const claims = []
			const obj = this.claimsList[index]
			for (const key in obj) {
				if ((key !== 'did' && key !== 'provider') && typeof (obj[key]) === 'object' && !Array.isArray(obj[key])) {
					const { target, claim } = obj[key]
					const did = target.did
					claims.push({
						target: did, claim
					})
				}
			}
			const name = str ? '编辑证书' : '删除证书'
			try {
				this.commonFun(1, name)
				console.log('编辑/删除证书入参：', claims)
				const revokeQ = await this.api.claims.revokeClaims({ claims })
				if (!str) {
					const aa = await revokeQ.run()
					console.log('删除成功', aa)
					this.commonFun(2, name)
					this.load = true
					setTimeout(() => { this.getProviders() }, 5000)
				} else {
					this.delObjNoRun = revokeQ
				}
			} catch (e) {
				this.commonFun(3, name, e)
			}
		},
		modifyProvider (scope, index) {
			this.handleType = 'edit'
			this.modifyIndex = index
			if (scope.provider === this.did) {
				this.isModify = true
			} else {
				this.isModify = false
			}
			const defaultCheckedList = ['BuyLockup', 'SellLockup', 'KnowYourCustomer', 'Jurisdiction', 'Accredited', 'Affiliate', 'Exempted', 'Blocked']
			const hasDateArr = ['BuyLockup', 'SellLockup', 'KnowYourCustomer']
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
			const originData = getCliaimObj()
			let did = ''
			for (const key in scope) {
				if (key === 'did') {
					did = scope[key]
				} else {
					if (defaultCheckedList.indexOf(key) > -1 && scope[key]) {
						originData[key].value = true
						originData[key].expiry = scope[key].expiry === null ? null : moment(scope[key].expiry)
						if (key === 'Jurisdiction' && scope[key]) {
							originData[key].code = scope[key].claim.code
						} else if (hasDateArr.indexOf(key) > -1 && scope[key].expiry === null) {
							originData[key].expiryBool = true
						} else {
							originData[key].expiryBool = false
						}
					}
				}
			}

			this.modifyClaimObj = {
				did,
				params: originData
			}
			this.visible = true
		},
		addProvider () {
			this.modifyClaimObj = null
			this.visible = true
			this.handleType = 'add'
		},
		modifyVisible (bool) {
			this.visible = bool
		},
		async getAssets () {
			this.assets = await this.api.assets.getAsset({
				ticker: this.ticker
			})
		},
		async getProviders () {
			this.reset()
			console.log('调用查询功能：')
			this.load = true
			try {
				const identity = await this.api.getSigningIdentity()
				const did = identity.did
				const providers = await this.assets.compliance.trustedClaimIssuers.get()
				window.providers = providers

				let flag = false
				providers.forEach(item => {
					if (item.identity.did === did) {
						flag = true
					}
				})
				this.did = did
				this.isProviderFlag = flag
				if (flag) {
					const allClaims = await Promise.all(providers.map(async (item) => {
						const arr = await this.api.claims.getIssuedClaims({ target: item.identity.did })
						return this.qryCompilance(arr)
					}))
					const arr = []
					const claimsDidList = []
					console.log(allClaims)
					allClaims.forEach(item => {
						claimsDidList.push(item.did)
						arr.push(...item)
					})
					this.claimsDidList = claimsDidList

					const newArrClaims = []
					const newArrDid = []
					let i = 1
					arr.forEach(item => {
						const index = newArrDid.indexOf(item.did)
						if (index > -1){
							item.did = ''
							newArrClaims[index].children = [{ i, ...item }]
							i++
						} else {
							newArrDid.push(item.did)
							newArrClaims.push({ i, ...item })
							i++
						}
					})

					// this.claimsList = arr
					this.claimsList = newArrClaims
					console.log(newArrClaims, newArrDid)
					this.load = false
				} else {
					this.isShow = true
					this.claimsDidList = []
					this.claimsList = []
					this.load = false
				}
			} catch (e) {
				console.log(e)
				this.load = false
			}
		},
		toCompliance () {
			this.$router.push(`/token/${this.ticker}/compliance`)
		}
	}
}
</script>
<style lang="scss">
  .attestations-table {

    .ant-table-thead > tr > th, .ant-table-tbody > tr > td{
      padding:8px;
    }

  }
</style>

