<template>
	<a-modal
		v-model="visibleModal"
		:width="1156"
		centered
		:title="type == 10?'新建权限组':'修改权限组'"
		@cancel="cancel"
		@ok="handleOk"
	>
		<div v-for="(item, index) in myTxTags" :key="index" class="module-outer">
			<div class="module-name font-16 p-16" :span="1">{{ item[0] }}</div>
			<div class="module-value" :span="23">
				<span v-for="(li, lia) in item[1]" :key="lia" class="module-item1 m-16 font-16"><a-checkbox v-model="li.checked"> <a-tooltip placement="topLeft" :title="li.key"> <span class="checkbox-label">{{ li.key }}</span></a-tooltip> </a-checkbox>
				</span>
			</div>
		</div>
		<!-- <permissons-list :myTxTags="myTxTags"></permissons-list> -->
		<template slot="footer">
			<a-button key="back" @click="cancel">
				取消
			</a-button>
			<a-button key="submit" type="primary" :loading="loading" @click="handleOk">
				{{ type == 10?'创建':'保存' }}
			</a-button>
		</template>
	</a-modal>
</template>
<script>
import {
	TxTags,
	PermissionType
} from '@polymeshassociation/polymesh-sdk/types'
// import permissonsList from '@/views/components/permissonsList'
export default {
	name: 'PermissionsModal',
	// components: {
	// 	permissonsList
	// },
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		type: { // 10 新增 20 修改
			type: Number,
			default: 10
		},
		myPermiss: {
			type: Object,
			default: () => {
				return {}
			}
		},
		pTxTags: {
			type: Array,
			default: () => {
				return []
			}
		}
	},
	data() {
		return {
			visibleModal: false,
			myTicker: this.$route.params.ticker,
			myTxTags: Object.entries(JSON.parse(JSON.stringify(TxTags))),
			selectArr: [],
			loading: false
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
		// 新增
		if (this.type === 10) {
			this.myTxTags.forEach((item) => {
				for (const key in item[1]) {
					let values = JSON.parse(JSON.stringify(item[1][key]))
					let temp = {
						checked: false,
						value: values,
						key: key
					}
					item[1][key] = temp
					values = {}
					temp = {}
				}
			})
		} else {
			this.myTxTags = JSON.parse(JSON.stringify(this.pTxTags))
		}
	},
	methods: {
		handleOk() {
			this.createGroup()
		},
		cancel() {
			this.visibleModal = false
			this.$emit('visibleFun', this.visibleModal)
		},
		async createGroup() {
			const setkey = 'setkey'
			this.loading = true
			try {
				this.selectArr = []
				this.myTxTags.forEach((item) => {
					for (const key in item[1]) {
						if (item[1][key].checked) {
							this.selectArr.push(item[1][key].value)
						}
					}
				})
				if (this.selectArr.length > 0) {
					const asset = await this.api.assets.getAsset({
						ticker: this.myTicker
					})
					if (this.type === 10) {
						this.$notification.warn({
							key: setkey,
							message: '执行中',
							description: '正在新增权限组...',
							// icon: <a-icon type='loading' style='color: #108ee9' />,
							duration: null
						})
						const createGroupQ = await asset.permissions.createGroup({
							permissions: {
								transactions: {
									values: this.selectArr,
									type: PermissionType.Include
									// exceptions: [AssetTx.Freeze]
								}
							}
						})
						const newGroup = await createGroupQ.run()
						console.log(newGroup)
						this.$notification.success({
							key: setkey,
							message: '执行成功',
							description: '新增权限成功'
						})
					} else {
						this.$notification.warn({
							key: setkey,
							message: '执行中',
							description: '正在修改权限组权限...',
							// icon: <a-icon type='loading' style='color: #108ee9' />,
							duration: null
						})
						const setPermQ = await	this.myPermiss.setPermissions({
							permissions: {
								transactions: {
									values: this.selectArr,
									type: PermissionType.Include
									// exceptions: [AssetTx.Freeze]
								}
							}
						})
						const Qres = await setPermQ.run()
						console.log(Qres)
						this.$notification.success({
							key: setkey,
							message: '执行成功',
							description: '修改权限组权限成功'
						})
					}

					// this.cancel()
					this.visibleModal = false
					this.$emit('visibleFun', true)
				} else {
					this.$notification.error({ message: '请先选择权限' })
				}
			} catch (err) {
				console.log(JSON.stringify(err))
				// this.$message.error(error.data.message)
				this.$notification.error({
					key: setkey,
					message: 'error',
					description: err.toString()
				})
			}
			this.loading = false
		}
	}
}
</script>
<style lang="scss" scoped>
::v-deep .ant-modal-body {
  height: 50vh;
  overflow-y: scroll;
}
.module-item1 {
  padding-left: 15px;
  width: calc( ( 100% / 3 ) - 32px );
  flex: 0 0 auto;
  overflow:hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
}
.checkbox-label{
	width: calc(100% - 32px);
	position: absolute;
	overflow:hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
</style>
