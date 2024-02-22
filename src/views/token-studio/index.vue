<template>
	<div>
		<a-row :gutter="[24,24]">
			<a-col v-if="receivedList.length > 0" :span="24">
				<div class="box-shadow">
					<div class="font-16 mb-16">待处理的资产转移</div>
					<a-row type="flex" class="pt-24">
						<a-col v-for="item of receivedList" :key="item.uuid" flex="266px" :span="5" class="border-right">
							<div class="py-16 px-20 text-center">
								<div class="primary-color mb-8">{{ item.data.value }}</div>
								<div class="font-24 weight-500">{{ item.data.name }}</div>
								<div class="mt-24 p-8" style="background: #FAFAFA;">
									<a-space>
										<a-icon class="user-icon" type="user-delete" />
										<span>来自</span>
										<span class="primary-color">{{ item.issuer.did.substr(0,9)+'...'+item.issuer.did.substr(-8) }}</span>
									</a-space>
								</div>
							</div>
							<a-row type="flex" justify="center" class="p-16">
								<a-button @click="onRejectAssets(item)">拒绝</a-button>
								<a-button type="primary" class="ml-24" @click="onAcceptAssets(item)">接收</a-button>
							</a-row>
						</a-col>
					</a-row>
				</div>
			</a-col>
			<a-col v-if="reservationList.length > 0" :span="24">
				<div class="box-shadow">
					<div class="font-16 mb-16">您保留的股票代码</div>
					<a-row type="flex" class="pt-24">
						<a-col v-for="item of reservationList" :key="item.ticker" flex="166px" :span="3" class="text-center border-right">
							<div class="py-16 px-24">
								<a-space direction="vertical">
									<div class="primary-color font-24 weight-500">{{ item.ticker }}</div>
									<div class="reverse-time font-12">{{ item.formatExpiryDate.days + '天' + item.formatExpiryDate.hours + '小时' }}后过期</div>
								</a-space>
							</div>
							<div class="py-16">
								<a-button type="primary" :ghost="true" @click="onConfigAsset(item.ticker)">资产配置</a-button>
							</div>
						</a-col>
					</a-row>
				</div>
			</a-col>
			<a-col :span="24">
				<div class="box-shadow">
					<a-row type="flex" justify="space-between">
						<div class="font-16 mb-16">您的股票资产</div>
						<a-button type="primary" @click="onNewToken">新增资产</a-button>
					</a-row>
					<a-row type="flex" class="pt-24">
						<a-col v-for="item of assetsList" :key="item.ticker" flex="266px" :span="4" class="text-center px-32 mb-24 border-right">
							<div class="py-16">
								<a-space direction="vertical" class="w-100">
									<div class="primary-color">{{ item.ticker }}</div>
									<div class="font-24 mb-24 weight-500 text-ellipsis">
										<a-tooltip>
											<template slot="title">
												{{ item.details.name }}
											</template>
											{{ item.details.name }}
										</a-tooltip>
									</div>
								</a-space>
								<div>
									<a-tag color="green">{{ item.details.assetType }}</a-tag>
									<a-tag color="blue">{{ item.fundingRound }}</a-tag>
								</div>
							</div>
							<div class="py-16 border-top">
								<a-button type="primary" :ghost="true" @click="onManageAsset(item.ticker)">管理资产</a-button>
							</div>
						</a-col>
						<a-col :span="24">
							<a-empty v-if="assetsList.length === 0" />
						</a-col>
					</a-row>
				</div>
			</a-col>
			<a-col v-if="agentAssetsList.length > 0" :span="24">
				<div class="box-shadow">
					<div class="font-16 mb-16">您代理的资产</div>
					<a-row type="flex" class="pt-24">
						<a-col v-for="item of agentAssetsList" :key="item.ticker" flex="266px" :span="4" class="text-center px-32 mb-24 border-right">
							<div class="py-16">
								<a-space direction="vertical" class="w-100">
									<div class="primary-color">{{ item.ticker }}</div>
									<div class="font-24 mb-24 weight-500 text-ellipsis">
										<a-tooltip>
											<template slot="title">
												{{ item.details.name }}
											</template>
											{{ item.details.name }}
										</a-tooltip>
									</div>
								</a-space>
								<div>
									<a-tag color="green">{{ item.details.assetType }}</a-tag>
									<a-tag color="blue">{{ item.fundingRound }}</a-tag>
								</div>
							</div>
							<div class="py-16 border-top">
								<a-button type="primary" :ghost="true" @click="onManageAsset(item.ticker)">管理资产</a-button>
							</div>
						</a-col>
					</a-row>
				</div>
			</a-col>
			<a-col v-if="trustingAssetsList.length > 0" :span="24">
				<div class="box-shadow">
					<div class="font-16 mb-16">您的信托资产</div>
					<a-row type="flex" class="pt-24">
						<a-col v-for="item of trustingAssetsList" :key="item.ticker" flex="266px" :span="4" class="text-center px-32 mb-24 border-right">
							<div class="py-16">
								<a-space direction="vertical" class="w-100">
									<div class="primary-color">{{ item.ticker }}</div>
									<div class="font-24 mb-24 weight-500 text-ellipsis">
										<a-tooltip>
											<template slot="title">
												{{ item.details.name }}
											</template>
											{{ item.details.name }}
										</a-tooltip>
									</div>
								</a-space>
								<div>
									<a-tag color="green">{{ item.details.assetType }}</a-tag>
									<a-tag color="blue">{{ item.fundingRound }}</a-tag>
								</div>
							</div>
							<div class="py-16 border-top">
								<a-button type="primary" :ghost="true" @click="onManageAsset(item.ticker)">管理资产</a-button>
							</div>
						</a-col>
					</a-row>
				</div>
			</a-col>
		</a-row>
	</div>
</template>

<script>
import { getExpiry } from '@/lib/common'
export default {
	name: 'TokenStudio',
	data(){
		return {
			identity: null,
			receivedList: [],
			reservationList: [],
			assetsList: [],
			agentAssetsList: [],
			trustingAssetsList: []
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler() {
				this.init()
			}
		}
	},
	mounted(){
		this.init()
	},
	methods: {
		async init(){
			this.identity = await this.api.getSigningIdentity()
			this.getReceivedAssets()
			this.getTickerReservation()
			this.getMyAssets()
			this.getTrustingAssets()
		},
		async getReceivedAssets(){ // 获取接收的资产（需要确认）
			const receivedAuth = await this.identity.authorizations.getReceived({ type: 'TransferAssetOwnership' })
			this.receivedList = await Promise.all(receivedAuth.map(async item => {
				const assets = await this.api.assets.getAsset({
					ticker: item.data.value
				})
				const assetsDetails = await assets.details()
				item.data = { ...item.data, ...assetsDetails }
				return item
			}))
		},
		async getTickerReservation () { // 获取保留股票代码
			const reservations = await this.api.assets.getTickerReservations()
			this.reservationList = await Promise.all(reservations.map(async item => {
				item.details = await item.details()
				item.formatExpiryDate = getExpiry(item.details.expiryDate)
				return item
			}))
		},
		async getMyAssets () { // 获取我的资产列表
			const accPermissionsData = await this.$account.getPermissions()
			let accPermissions = null
			const permisType = accPermissionsData.assets?.type
			const permisValue = accPermissionsData.assets?.values.map(item => item.ticker)
			if (permisType){
				accPermissions = {}
				accPermissions[permisType] = permisValue.map(item => item.ticker)
			}
			const ownedAssetsData = await this.api.assets.getAssets()
			const accessAssetsData = await this.identity.assetPermissions.get() // 包含agents

			const assetsListRes = accPermissions === null ? ownedAssetsData : ownedAssetsData.filter(item => {
				return permisType === 'Include' ? permisValue.includes(item.ticker) : !permisValue.includes(item.ticker)
			})
			this.assetsList = await Promise.all(assetsListRes.map(async item => {
				item.details = await item.details()
				item.fundingRound = await item.currentFundingRound()
				return item
			}))

			const ownedAssetsTickers = ownedAssetsData.map(item => item.ticker)
			const agentListRes1 = accessAssetsData.map(item => item.asset).filter(item => {
				return !ownedAssetsTickers.includes(item.ticker)
			})
			const agentListRes2 = accPermissions === null ? agentListRes1 : agentListRes1.filter(item => {
				return permisType === 'Include' ? permisValue.includes(item.ticker) : !permisValue.includes(item.ticker)
			})
			this.agentAssetsList = await Promise.all(agentListRes2.map(async item => {
				item.details = await item.details()
				item.fundingRound = await item.currentFundingRound()
				return item
			}))
		},
		async getTrustingAssets () { // 获取信托资产
			const lists = await this.identity.getTrustingAssets()
			this.trustingAssetsList = []
			await Promise.all(lists.map(async item => {
				item.details = await item.details()
				if (item.details.owner.did !== this.identity.did) {
					item.fundingRound = await item.currentFundingRound()
					this.trustingAssetsList.push(item)
				}
			}))
		},
		onManageAsset (ticker) {
			this.$router.push(`/token/${ticker}/dashboard`)
		},
		onNewToken(){
			this.$router.push('/token/newToken')
		},
		onConfigAsset(ticker){
			this.$router.push({ path: '/token/newToken', query: { ticker }})
		},
		async onAcceptAssets(item){ // 接收资产
			try {
				this.$notification.warn({
					key: '1',
					message: '接收资产'
				})
				const runQ = await item.accept()
				await runQ.run()
				this.$notification.success({
					key: '1',
					message: '接收资产成功'
				})
				this.getReceivedAssets()
				this.getMyAssets()
			} catch (e){
				this.$notification.destroy()
				this.$message.error(e.message)
			}
		},
		async onRejectAssets(item) { // 拒绝资产
			try {
				this.$notification.warn({
					key: '2',
					message: '拒绝接收资产'
				})
				const runQ = await item.remove()
				await runQ.run()
				this.$notification.success({
					key: '2',
					message: '拒绝资产成功',
					duration: null
				})
				this.getReceivedAssets()
			} catch (e){
				this.$notification.destroy()
				this.$message.error(e.message)
			}
		}

	}
}
</script>

<style lang="scss" scoped>
.user-icon {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background-color: #E9E9E9;
}
.reverse-time {
	background-color: #F2F4F5;
	padding: 4px;
}
.border-top {
	border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.border-right {
	border-right: 1px solid rgba(0, 0, 0, 0.06);
}

.ant-tag {
	font-size: $font-14;
	line-height: 24px;
	padding: 4px 8px;
	border-radius: 2px;
	border: none;
}
</style>
