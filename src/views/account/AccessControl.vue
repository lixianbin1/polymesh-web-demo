<template>
	<div class="accessControl">
		<a-row :gutter="[24, 24]">
			<a-col :span="24">
				<div class="box-shadow h-100">
					<div class="pb-16 mb-24 acc-back pl-24">
						<a-icon type="arrow-left" style="color: #1890ff;" />
						<a-button class="back-btn" type="link" @click="$router.go(-1)">返回</a-button>
					</div>
					<div>
						<div class="font-16 pb-16">权限控制</div>
						<div class="secondary-color pb-16">
							控制对安全令牌的管理访问，包括哪个辅助用户可以管理遵从性、令牌分发等。
						</div>
					</div>
					<a-tips title="注意">密钥对令牌的访问可以在任何时候关闭或打开。</a-tips>
				</div></a-col>
		</a-row>
		<a-row :gutter="[24, 24]">
			<a-col :span="24">
				<div class="box-shadow">
					<div class="font-16 pb-24 mt-24">权限列表</div>
					<a-row type="flex" class="box-shadow p-0">
						<a-col flex="200px">
							<a-menu
								style="width: 200px"
								class="mr-24 h-100"
								:default-selected-keys="[0]"
								mode="vertical"
								@click="handleClick"
							>
								<a-menu-item v-for="(item, index) in dataSource" :key="index">
									<span> {{ item?.account.address }}</span>
								</a-menu-item>
							</a-menu>
						</a-col>
						<a-col class="flex-auto">
							<div class="mb-24">
								<div class="mx-24 py-24">
									<!-- :defaultValue="activeAssets" v-if="showAssets" -->
									<a-checkbox-group
										v-model="selectAssets"
										:options="tickerArr"
										class="assets-checkbox"
										@change="onChange"
									>
										<span
											slot="label"
											slot-scope="{ value }"
											style="color: red"
										>{{ value }}</span>
									</a-checkbox-group>
								</div>
							</div>
							<div class="mb-24">
								<a-spin :spinning="spinning">
									<!-- :bordered="true" :scroll="{ x: '100%' }" -->
									<a-table
										:dataSource="currentAccount"
										:columns="columns"
										:pagination="false"
									>
									</a-table>
									<a-row type="flex" justify="center">
										<a-button class="mt-80" type="primary" :disabled="!currentAccount[0]?.accessToken" @click="submit(currentAccount[0])">提交</a-button>
									</a-row>
								</a-spin>
							</div>
						</a-col>
					</a-row>
				</div>
			</a-col>
		</a-row>
	</div>
</template>
<script>
import ATips from '@/views/components/aTips'
import { TxGroup } from '@polymeshassociation/polymesh-sdk/types'
export default {
	components: { ATips },
	data() {
		return {
			spinning: false,
			menuIndex: 0,
			assets: {},
			defaultPortfolio: {},
			dataSource: [],
			columns: [
				{
					title: '开启权限', // Access to token
					width: 100,
					align: 'center',
					dataIndex: 'accessToken',
					customRender: (text, record) => (
						<a-switch
							v-model={record.accessToken}
							onChange={() => {
								record.isChange = true
							}}
						></a-switch>
					)
				},
				{
					title: '资产管理', // Token management
					dataIndex: 'AssetManagement',
					align: 'center',
					key: 'AssetManagement',
					customRender: (text, record) => {
						return (
							<a-checkbox
								v-model={record.AssetManagement}
								disabled={!record.accessToken}
								onChange={() => {
									record.isChange = true
								}}
							></a-checkbox>
						)
					}
				},
				{
					title: '高级资产配置', // Advanced token configuration
					width: 120,
					align: 'center',
					dataIndex: 'AdvancedAssetManagement',
					customRender: (text, record) => (
						<a-checkbox
							v-model={record.AdvancedAssetManagement}
							disabled={!record.accessToken}
							onChange={() => {
								record.isChange = true
							}}
						></a-checkbox>
					)
				},
				{
					title: '批准的认证列表', // Manage list of approved attestation providers
					width: 140,
					align: 'center',
					dataIndex: 'TrustedClaimIssuersManagement',
					customRender: (text, record) => (
						<a-checkbox
							v-model={record.TrustedClaimIssuersManagement}
							disabled={!record.accessToken}
							onChange={() => {
								record.isChange = true
							}}
						></a-checkbox>
					)
				},
				{
					title: '资产规则', // Manage token rules
					align: 'center',
					dataIndex: 'ComplianceRequirementsManagement',
					customRender: (text, record) => (
						<a-checkbox
							v-model={record.ComplianceRequirementsManagement}
							disabled={!record.accessToken}
							onChange={() => {
								record.isChange = true
							}}
						></a-checkbox>
					)
				},
				{
					title: '资产认证', // Manage token attestations
					align: 'center',
					dataIndex: 'ClaimsManagement',
					customRender: (text, record) => (
						<a-checkbox
							v-model={record.ClaimsManagement}
							disabled={!record.accessToken}
							onChange={() => {
								record.isChange = true
							}}
						></a-checkbox>
					)
				},
				{
					title: '发行', // Minting
					dataIndex: 'Issuance',
					align: 'center',
					customRender: (text, record) => (
						<a-checkbox
							v-model={record.Issuance}
							disabled={!record.accessToken}
							onChange={() => {
								record.isChange = true
							}}
						></a-checkbox>
					)
				},
				{
					title: '分发', // Distribution
					dataIndex: 'Distribution',
					align: 'center',
					customRender: (text, record) => (
						<a-checkbox
							v-model={record.Distribution}
							disabled={!record.accessToken}
							onChange={() => {
								record.isChange = true
							}}
						></a-checkbox>
					)
				},
				{
					title: '公司行为', //	Corporate Actions
					dataIndex: 'CorporateActionsManagement',
					align: 'center',
					customRender: (text, record) => (
						<a-checkbox
							v-model={record.CorporateActionsManagement}
							disabled={!record.accessToken}
							onChange={() => {
								record.isChange = true
							}}
						></a-checkbox>
					)
				},
				{
					title: 'STOs', // STOs
					dataIndex: 'StoManagement',
					align: 'center',
					customRender: (text, record) => (
						<a-checkbox
							v-model={record.StoManagement}
							disabled={!record.accessToken}
							onChange={() => {
								record.isChange = true
							}}
						></a-checkbox>
					)
				}
			],
			txGroups: Object.values(TxGroup),
			// [
			// 	'PortfolioManagement',
			// 	'AssetManagement',
			// 	'AdvancedAssetManagement',
			// 	'TrustedClaimIssuersManagement',
			// 	'ComplianceRequirementsManagement',
			// 	'ClaimsManagement',
			// 	'Issuance',
			// 	'Distribution',
			// 	'CorporateActionsManagement',
			// 	'StoManagement'
			// ],
			allAssets: [],
			tickerArr: [],
			currentAccount: [],
			selectAssets: []
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler() {
				this.getAllAssets()
			}
		}
	},
	mounted() {
		this.getPortfolios()
		this.getAllAssets()
	},
	methods: {
		handleClick(e) {
			this.menuIndex = e.key
			this.currentAccount = [this.dataSource[e.key]]
			console.log(this.currentAccount)

			if (this.currentAccount[0].permissions.assets === null) {
				// 对所有的资产都具有权限
				this.selectAssets = this.tickerArr
			} else {
				this.selectAssets = this.currentAccount[0].permissions.assets.values.map((item) => {
					return item.ticker
				})
			}
			console.log(this.selectAssets)
			// 对当前辅助账户进行数据处理
			this.currentAccount.forEach((item) => {
				this.$set(item, 'key', item.account.address)
				this.$set(item, 'accessToken', true)
				this.$set(item, 'isChange', false)
				this.$set(item, 'key', item.account.address)
				// item.key = item.account.address
				// item.accessToken = true
				// item.isChange = false
				// 资产为null 表示所有资产都有该权限
				if (item.permissions.assets === null) {
					this.setGroup(item)
				} else {
					if (item.permissions.assets?.type === 'Include') {
						this.setGroup(item)
					} else if (item.permissions.assets?.type === 'Exclude') {
						this.setGroup(item)
					}
				}
			})
		},
		onChange() {
			console.log(this.selectAssets)
		},
		async getPortfolios() {
			try {
				const signing = await this.api.accountManagement.getSigningAccount()
				const identity = await signing.getIdentity()
				// console.log(identity)
				const [defaultPortfolio] = await identity.portfolios.getPortfolios()
				this.defaultPortfolio = defaultPortfolio
				// console.log(defaultPortfolio)
				// console.log(numberedPortfolio) ...numberedPortfolio
			} catch (error) {
				console.log(error)
			}
		},
		async getAllAssets() {
			try {
				// 获取所有资产
				const signing = await this.api.accountManagement.getSigningAccount()
				const identity = await signing.getIdentity()
				// {
				// 	owner: identity
				// }
				// console.log(accessAssetsData)
				// this.allAssets = await this.api.assets.getAssets()
				this.allAssets = await identity.assetPermissions.get()
				this.tickerArr = this.allAssets.map((item) => {
					return item.asset.ticker
				})
				console.log(this.allAssets)
				this.getSecondaryAccounts()
			} catch (error) {
				console.log(error)
			}
		},
		goAccount() {
			this.$router.push('/account')
		},
		async submit(record) {
			// console.log(record)
			// 修改权限 注意入参格式
			this.spinning = true
			const secondaryAccounts = [
				{
					account: record.account,
					permissions: {
						assets: record.permissions.assets,
						portfolios: record.permissions.portfolios,
						transactionGroups: []
					}
				}
			]
			if (record.accessToken) {
				// 不能选择的话就直接传空
				// // 这里没有配置 PortfolioManagement，如果之前有设置 还是要带回去
				for (const key in record) {
					// 先判断是否是属于权限组的key 如果是，且值为true,则key 添加进权限组
					if (this.txGroups.includes(key) && record[key]) {
						secondaryAccounts[0].permissions.transactionGroups.push(key)
					}
				}
				// 增加一个判断条件 如果assets 为null 修改为不具备全部的资产
				if (secondaryAccounts[0].permissions.assets === null && this.selectAssets.length < this.allAssets.length) {
					secondaryAccounts[0].permissions.assets = {
						type: 'Include',
						values: []
					}
					this.allAssets.forEach((item) => {
						if (this.selectAssets.includes(item.asset.ticker)) { secondaryAccounts[0].permissions.assets.values.push(item.asset) }
					})
				}
				// 如果有勾选权限 并且 assets 不是为null ,即没有全部权限，需要判断assets 权限里面有没有 当前的资产，如果没有，需要手动加上该资产
				if (
					secondaryAccounts[0].permissions.transactionGroups.length > 0 && secondaryAccounts[0].permissions.assets
				) {
					// 包含
					if (secondaryAccounts[0].permissions.assets.type === 'Include') {
						// 如果当前资产没有在资产列表里面 则加入当前资产
						// 如果全选 就赋值 null
						if (this.selectAssets.length === this.allAssets.length) {
							secondaryAccounts[0].permissions.assets = null
						} else {
							secondaryAccounts[0].permissions.assets.values = []
							this.allAssets.forEach((item) => {
								if (this.selectAssets.includes(item.asset.ticker)) { secondaryAccounts[0].permissions.assets.values.push(item.asset) }
							})
						}
					} else if (
						secondaryAccounts[0].permissions.assets.type === 'Exclude'
					) {
						// 排除
						secondaryAccounts[0].permissions.assets.values = []
						this.allAssets.forEach((item) => {
							if (!this.selectAssets.includes(item.asset.ticker)) { secondaryAccounts[0].permissions.assets.values.push(item.asset) }
						})
					}
				}

				// 如果有勾选权限 并且 portfolios 不是为null ,即没有全部权限，需要判断portfolios 权限里面有没有 当前的投资组合，如果没有，需要手动加上该投资组合
				if (
					secondaryAccounts[0].permissions.transactionGroups.length > 0 && secondaryAccounts[0].permissions.portfolios
				) {
					// 默认的投资组合没有id
					if (secondaryAccounts[0].permissions.portfolios.type === 'Include') {
						// 包含
						let a = -1
						secondaryAccounts[0].permissions.portfolios.values.forEach(
							(item) => {
								if (!item.id) {
									// 说明权限里面有默认投资组合 不需要处理
									a = 1
								}
							}
						)
						if (a === -1) {
							secondaryAccounts[0].permissions.portfolios.values.push(
								this.defaultPortfolio
							)
						}
					} else if (
						secondaryAccounts[0].permissions.portfolios.type === 'Exclude'
					) {
						// 排除
						let a = -1
						secondaryAccounts[0].permissions.portfolios.values.forEach(
							(item, index) => {
								if (!item.id) {
									// 说明权限里面有默认投资组合 需要删除
									a = index
								}
							}
						)
						if (a > -1) {
							secondaryAccounts[0].permissions.portfolios.values.splice(a, 1)
						}
					}
				}
			}
			this.$notification.warn({
				message: '修改辅助账户权限',
				key: 'access',
				description: '请求中。。。',
				icon: <a-icon type='loading' style='color: #108ee9' />,
				duration: null
			})
			// 修改权限SDK
			console.log(secondaryAccounts)
			try {
				const permissionsQ = await this.api.accountManagement.modifyPermissions(
					{
						secondaryAccounts: secondaryAccounts
					}
				)
				console.log(permissionsQ)
				const res = await permissionsQ.run()
				console.log(res)
				// this.$message.success('权限修改成功！')
				this.$notification.close('access')
				this.$notification.success({
					message: '修改辅助账户权限',
					description: '权限修改成功！',
					icon: <a-icon type='check-circle' style='color: #40a9ff' />
				})
			} catch (err) {
				console.log(err)
				this.$notification.close('access')
				this.$notification.error({
					message: '修改辅助账户权限',
					description: err.toString(),
					icon: <a-icon type='close-circle' style='color: #ff4d4f' />
				})
			}
			this.getSecondaryAccounts()
		},
		async getSecondaryAccounts() {
			// 获取所有辅助账户列表
			this.spinning = true
			try {
				const signing = await this.api.accountManagement.getSigningAccount()
				this.signing = signing
				const identity = await signing.getIdentity()
				const accounts = await identity.getSecondaryAccounts()
				this.dataSource = accounts.data
				console.log(accounts.data, '没有辅助账户')
				if (this.dataSource && this.dataSource.length > 0) {
					this.handleClick({ key: this.menuIndex })
				}
			} catch (error) {
				console.log(error)
			}
			this.spinning = false
		},
		setGroup(item) {
			// 这里没有配置 PortfolioManagement，如果之前有设置 还是要带回去
			this.txGroups.forEach((li) => {
				// 如果 资产的权限组包含某一个权限，则该权限为true 否则为false
				if (item.permissions.transactionGroups.includes(li)) {
					this.$set(item, li, true)
					// item[li] = true
				} else {
					// item[li] = false
					this.$set(item, li, false)
				}
			})
		}
	}
}
</script>
<style lang="scss" scoped>
.accessControl {
.acc-back{
	border-bottom: 1px solid rgb(240,240,240);
	margin-left: -24px;
	margin-right: -24px;
}
  .p-0{
	padding: 0 ;
  }
  .flex-auto {
    width: calc(100% - 224px);
	flex: 0 0 auto;
  }
}
::v-deep .ant-menu-vertical .ant-menu-item{
	margin-top: 0;
}
::v-deep .ant-checkbox-group {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
}
::v-deep .assets-checkbox .ant-checkbox-wrapper {
   width: 180px;
   flex: 0 0 auto;
   margin-bottom: 24px;
}
</style>
