<template>
	<div>
		<div class="box-shadow h-100 w-100 flex">
			<a-menu
				style="width: 200px"
				class="mr-24"
				:default-selected-keys="[permissionsIndex]"
				:selected-keys="[permissionsIndex]"
				mode="vertical"
				@click="handleClick"
			>
				<template v-for="(item, index) in permissionsArr">
					<a-menu-item v-if="item.show" :key="index">
						<span v-if="item?.type"> {{ item?.type }}权限组</span>
						<span v-else>自定义权限组{{ item.id.toFormat() }}</span>
					</a-menu-item>
				</template>
				<!-- <a-menu-item :key="9999">
					<a-icon type="plus" /> 增加权限组
				</a-menu-item> -->
				<a-divider type="horizontal" />
				<a-button type="link" class="mt-16" @click.stop="addPermissions"><a-icon type="plus" />增加权限组</a-button>
			</a-menu>
			<a-row class="perm-list">
				<a-col :span="24">
					<a-row type="flex" justify="end" class="mb-24 mt-24">
						<a-button type="primary" class="mr-16" @click="editPermissions"> 编辑</a-button>
						<a-button type="danger" @click="deleteGroups"> 删除</a-button>
					</a-row>
					<a-row class="mb-24 w-100 perm-outer" style="">
						<a-col :span="24">
							<permissons-list :myTxTags="myTxTags"></permissons-list>
						</a-col>
					</a-row>
				</a-col>
			</a-row>
		</div>
		<permissionsModal
			v-if="visible"
			:visible="visible"
			:type="type"
			:myPermiss="myPermiss"
			:pTxTags="pTxTags"
			@visibleFun="visibleFun"
		></permissionsModal>
	</div>
</template>

<script>
import {
	TxTags,
	// TxGroup,
	// ModuleName,
	PermissionType
	// AssetTx
} from '@polymeshassociation/polymesh-sdk/types'
import { txGroupToTxTags } from '@polymeshassociation/polymesh-sdk/utils'
import permissionsModal from './permissionsModal'
import permissonsList from '@/views/components/permissonsList'
export default {
	components: {
		permissionsModal,
		permissonsList
	},
	data() {
		return {
			myTicker: this.$route.params.ticker,
			permissionsArr: [],
			permissionsIndex: 0,
			myTxTags: null,
			visible: false,
			asset: null,
			type: 10,
			myPermiss: {}
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler() {
				this.getGroups()
			}
		}
	},
	mounted() {
		this.getGroups()
	},
	methods: {
		addPermissions() {
			this.type = 10
			this.visible = true
		},
		editPermissions() {
			if (this.permissionsIndex > 3) {
				this.type = 20
				this.visible = true
			} else {
				// this.$message.info('系统配置的权限组无法修改')
				this.$notification.error({
					key: 'deleteGroups',
					message: 'error',
					description: '系统权限组无法修改'
				})
			}
		},
		visibleFun(e) {
			this.visible = false
			if (e) {
				if (this.type === 10) {
					this.permissionsIndex = 0
				}
				this.getGroups()
			}
		},
		handleClick(e) {
			console.log(e)
			console.log(e.type)
			if (!e?.type){
				this.permissionsIndex = e.key
				// if (e.key === 9999) {
				// 	this.myTxTags = {}
				// 	this.type = 10
				// 	this.visible = true
				// } else {
				this.myPermiss = this.permissionsArr[this.permissionsIndex]
				this.getPermissions(e.key)
				// }
			}
		},
		async deleteGroups(){
			const deletekey = 'deleteGroups'
			if (this.permissionsArr[this.permissionsIndex]?.type){
				this.$notification.error({
					key: deletekey,
					message: 'error',
					description: '系统权限组无法删除'
				})
				return false
			} else {
				try {
					this.$notification.warn({
						key: deletekey,
						message: '删除权限组权限',
						description: '请求中...',
						icon: <a-icon type='loading' style='color: #108ee9' />,
						duration: null
					})
					const setPermQ = await	this.permissionsArr[this.permissionsIndex].setPermissions({
						permissions: {
							transactions: {
								values: [],
								type: PermissionType.Include
								// exceptions: [AssetTx.Freeze]
							}
						}
					})
					const Qres = await setPermQ.run()
					console.log(Qres)
					this.$notification.success({
						key: deletekey,
						message: '删除权限组权限',
						description: '请求成功'
					})
					this.permissionsIndex = 0
					this.getGroups()
				} catch (err) {
					this.$notification.error({
						key: deletekey,
						message: 'error',
						description: err.toString()
					})
				}
			}
		},
		async getPermissions(index) {
			const res = await this.permissionsArr[index].getPermissions()
			console.log(res)
			this.myTxTags = Object.entries(JSON.parse(JSON.stringify(TxTags)))
			if (res.transactions == null) {
				this.myTxTags.forEach((item) => {
					for (const key in item[1]) {
						// 显示权限的时候是不需要权限的value的
						let values = JSON.parse(JSON.stringify(item[1][key]))
						let temp = {
							checked: true,
							value: values,
							key: key
						}
						item[1][key] = temp
						values = {}
						temp = {}
					}
					item.push(true)
				})
			} else {
				let groupPerm = []
				res.transactionGroups.forEach((item) => {
					// 把权限组解析成权限
					groupPerm = groupPerm.concat(txGroupToTxTags(item))
				})
				let txValues = res.transactions.values
				// 问题1 是类型为 Exclude 的时候是把组的权限转成不含的权限还是包含的权限？
				// 问题2 exceptions 的权限是怎么处理？
				txValues = txValues.concat(groupPerm)
				if (txValues.length > 0) {
					// 如果权限是 Include 包含类型
					if (res.transactions.type === PermissionType.Include) {
						this.myTxTags.forEach((item) => {
							const item0 = item[0]
							const item1 = item[1]
							// 判断权限组是否包含整个模块
							if (txValues.includes(item0)) {
								for (const key in item1) {
									let values = JSON.parse(JSON.stringify(item1[key]))
									let temp = {
										checked: true,
										value: values,
										key: key
									}
									item[1][key] = temp
									values = {}
									temp = {}
									item.push(true)
								}
							} else {
								let indexA = 0
								for (const key in item1) {
									let values = JSON.parse(JSON.stringify(item1[key]))
									let checked = false
									// 判断权限组里有没有包含该权限
									if (txValues.includes(item1[key])) {
										checked = true
										indexA++
									}
									let temp = {
										checked: checked,
										value: values,
										key: key
									}
									item[1][key] = temp
									values = {}
									temp = {}
								}
								// 如果这个模块包含一个权限，则显示模块否则不显示该模块
								if (indexA > 0) {
									item.push(true)
								} else {
									item.push(false)
								}
							}
						})
					} else {
						// Exclude 类型
						this.myTxTags.forEach((item) => {
							const item0 = item[0]
							const item1 = item[1]
							// 判断权限组是否包含整个模块
							if (txValues.includes(item0)) {
								for (const key in item1) {
									let values = JSON.parse(JSON.stringify(item1[key]))
									let temp = {
										checked: false,
										value: values,
										key: key
									}
									item[1][key] = temp
									values = {}
									temp = {}
									item.push(false)
								}
							} else {
								let indexA = 0
								for (const key in item1) {
									let checked = true
									let values = JSON.parse(JSON.stringify(item1[key]))
									// 判断权限组里有没有 不包含该权限
									if (txValues.includes(item1[key])) {
										checked = false
									} else {
										indexA++
									}
									let temp = {
										checked: checked,
										value: values,
										key: key
									}
									item[1][key] = temp
									values = {}
									temp = {}
								}
								// 如果这个模块包含一个权限，则显示模块否则不显示该模块
								if (indexA > 0) {
									item.push(true)
								} else {
									item.push(false)
								}
							}
						})
					}
				}
			}
			this.pTxTags = this.myTxTags
		},
		async getGroups() {
			this.asset = await this.api.assets.getAsset({
				ticker: this.myTicker
			})
			const groups = await this.asset.permissions.getGroups()
			console.log(groups)
			this.permissionsArr = groups.known.concat(groups.custom)
			this.permissionsArr = await Promise.all(
				this.permissionsArr.map(async (item, index) => {
					const res = await item.getPermissions()
					if (res?.transactions && res?.transactions?.type === PermissionType.Include && res?.transactions.values.length === 0
					) {
						this.$set(item, 'show', false)
					} else {
						this.$set(item, 'show', true)
					}
					return item
				})
			)
			console.log(this.permissionsArr)
			this.getPermissions(this.permissionsIndex)
		}
	}
}
</script>

<style lang="scss" scoped>
.flex {
  display: flex;
  padding-left: 0;
  padding-top: 0;
}
::v-deep .ant-menu-item:first-child {
	margin-top: 0;
}
::v-deep .ant-menu-item {
	line-height: 78px;
	height: 78px;
	margin: 0;
}
::v-deep .ant-divider-horizontal{
	margin: 0;
}
::v-deep .ant-menu-vertical .ant-menu-item:not(:last-child) {
	margin-bottom: 0;
}
.perm-outer{
	max-height:50vh;
	// min-height:50vh;
	overflow-y:auto;
}
.perm-list{
	flex: 0 0 auto;
	width: calc(100% - 224px);
}
</style>
