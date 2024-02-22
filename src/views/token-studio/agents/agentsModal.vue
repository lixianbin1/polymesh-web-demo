<template>
	<a-modal
		v-model="visibleModal"
		:width="1156"
		centered
		title="邀请代理人"
		@cancel="cancel"
		@ok="handleOk"
	>
		<!-- <a-spin :spinning="spinning2"></a-spin> -->
		<a-form
			class="pt-8"
			:form="formState"
			name="formState"
			layout="vertical"
			:wrapper-col="{ span: 14 }"
			autocomplete="off"
		>
			<a-form-item label="代理人">
				<!-- v-model="formState.target" -->
				<a-input
					v-decorator="[
						'target',
						{
							rules: [
								{ required: true, message: '请选择代理人', trigger: 'change' },
							],
						},
					]"
				>
				</a-input>
			</a-form-item>
			<a-form-item label="权限组">
				<!-- v-model="formState.permissions" -->
				<a-select
					ref="select"
					v-decorator="[
						'permissions',
						{
							rules: [
								{ required: true, message: '请选择权限组', trigger: 'change' },
							],
						},
					]"
					placeholder="请选择"
					@change="changeHandler"
				>
					<template v-for="(item, key) in permissionsArr">
						<a-select-option
							v-if="item.show"
							:key="key"
							:value="key+''"
						>
							<span v-if="item?.type">{{ item?.type }}权限组</span>
							<span v-else>自定义权限组{{ item.id.toFormat() }}</span>
						</a-select-option>
					</template>
				</a-select>
			</a-form-item>
		</a-form>
		<div v-if="selectIndex > -1" class="perm-outer">
			<permissons-list :myTxTags="myTxTags"></permissons-list>
		</div>
		<template slot="footer">
			<a-button key="back" @click="cancel">
				取消
			</a-button>
			<a-button key="submit" type="primary" :loading="loading" @click="handleOk">
				邀请
			</a-button>
		</template>
	</a-modal>
</template>
<script>
import { TxTags, PermissionType } from '@polymeshassociation/polymesh-sdk/types'
import { txGroupToTxTags } from '@polymeshassociation/polymesh-sdk/utils'
import permissonsList from '@/views/components/permissonsList'
export default {
	components: {
		permissonsList
	},
	props: {
		visible: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			loading: false,
			visibleModal: false,
			selectIndex: -1,
			myTicker: this.$route.params.ticker,
			myTxTags: Object.entries(JSON.parse(JSON.stringify(TxTags))),
			selectArr: [],
			permissionsArr: [],
			rules: {
				target: [
					{ required: true, message: '请选择代理人', trigger: 'change' }
				],
				permissions: [
					{ required: true, message: '请选择权限组', trigger: 'change' }
				]
			},
			formState: this.$form.createForm(this)
		}
	},
	watch: {
		visible: {
			handler(boo) {
				this.visibleModal = boo
			},
			immediate: true
		}
	},
	mounted() {
		this.getGroups()
	},
	methods: {
		changeHandler(e) {
			this.selectIndex = e
			this.getPermissions(e)
		},
		handleOk() {
			console.log(this.myTxTags)
			this.formState.validateFields(async(err, values) => {
				if (!err) {
					console.log('Received values of form: ', values)
					const setkey = 'setkey'
					this.loading = true
					try {
						this.$notification.warn({
							key: setkey,
							message: '执行中',
							description: '正在邀请代理人...',
							// icon: <a-icon type='loading' style='color: #108ee9' />,
							duration: null
						})
						const target = await this.api.identities.getIdentity({
							did: values.target
						})
						const invitingFullAgentTx = await this.asset.permissions.inviteAgent({
							target,
							permissions: this.permissionsArr[this.formState.getFieldsValue().permissions]
						})
						const authRequest = await invitingFullAgentTx.run()
						console.log(authRequest)
						this.$notification.success({
							key: setkey,
							message: '执行成功',
							description: '邀请代理人'
						})
						this.cancel()
					} catch (err) {
						this.$notification.error({
							key: setkey,
							message: '执行失败',
							description: err.toString()
						})
					}
				}
				this.loading = false
			})
		},
		cancel() {
			this.visibleModal = false
			this.$emit('visibleFun', this.visibleModal)
		},
		async getGroups() {
			this.asset = await this.api.assets.getAsset({
				ticker: this.myTicker
			})
			const groups = await this.asset.permissions.getGroups()
			this.permissionsArr = groups.known.concat(groups.custom)
			this.permissionsArr = await Promise.all(
				this.permissionsArr.map(async (item, index) => {
					const res = await item.getPermissions()
					// console.log(item, res)
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
		},
		async getPermissions(index) {
			const res = await this.permissionsArr[index].getPermissions()
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
		}
	}
}
</script>
<style lang="scss" scoped>
::v-deep .ant-modal-body{
	padding-bottom: 0;
}
.perm-outer{
	max-height:35vh;
	/* min-height:50vh; */
	overflow-y:auto;
}
</style>
