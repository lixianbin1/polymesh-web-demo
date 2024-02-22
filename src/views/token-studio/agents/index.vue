<template>
	<div class="box-shadow h-100">
		<a-row
			type="flex"
			align="middle"
			class="mb-24"
			justify="space-between"
		>
			<a-col> <div class="font-16">代理人列表</div></a-col>
			<a-col>
				<a-button type="primary" @click="inviteAgentFun">邀请代理人</a-button>
			</a-col>
		</a-row>
		<a-skeleton :active="true" :loading="assetsLoading"></a-skeleton>
		<a-table
			v-if="!assetsLoading"
			:dataSource="dataSource"
			:columns="columns"
			:bordered="true"
			:pagination="false"
		>
			<template #permissions="text">
				<a>{{ text }}dcsdcsd</a>
			</template>
			<template #operation="_, record">
				<a-button type="link" @click="removeAgent(record)">移除代理</a-button>
			</template>
		</a-table>
		<agentsModal
			v-if="visible"
			:visible="visible"
			@visibleFun="visibleFun"
		></agentsModal>
	</div>
</template>

<script>
import agentsModal from './agentsModal.vue'
export default {
	components: {
		agentsModal
	},
	data() {
		return {
			myTicker: this.$route.params.ticker,
			asset: null,
			assetsLoading: false,
			visible: false,
			columns: [
				{
					title: 'DID',
					width: 600,
					dataIndex: 'ticker',
					customRender: (text, record) => {
						return record.agent.did
					}
				},
				{
					title: '权限组',
					// width: 120,
					dataIndex: 'permissions',
					customRender: (text, record) => {
						return record.group?.type ? record.group?.type + '权限组' : '自定义权限组' + record.group.id.toFormat()
					}
				},
				{
					title: '操作',
					width: 200,
					dataIndex: 'operation',
					scopedSlots: { customRender: 'operation' }
				}
			],
			dataSource: []
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler() {
				this.getAgents()
			}
		}
	},
	mounted() {
		this.getAgents()
		// this.getReceived()
	},
	methods: {
		visibleFun(e) {
			this.visible = e
			// this.getAgents()
		},
		async removeAgent(record) {
			const setkey = 'setkey'
			try {
				this.$notification.warn({
					key: setkey,
					message: '执行中',
					description: '移除代理人...',
					// icon: <a-icon type='loading' style='color: #108ee9' />,
					duration: null
				})
				const removeQ = await this.asset.permissions.removeAgent({
					target: record.agent.did
				})
				await removeQ.run()
				this.$notification.success({
					key: setkey,
					message: '执行成功',
					description: '移除代理人'
				})
				this.getAgents()
			} catch (err) {
				this.$notification.error({
					key: setkey,
					message: 'error',
					description: err.toString()
				})
			}
		},
		async getReceived() {
			const signing = await this.api.accountManagement.getSigningAccount()
			const identity = await signing.getIdentity()
			const auth = await identity.authorizations.getReceived({
				type: 'BecomeAgent'
			})
			console.log(auth)
			const a = await auth[0].accept()
			const b = await a.run()
			console.log(b)
		},
		async getAgents() {
			this.asset = await this.api.assets.getAsset({
				ticker: this.myTicker
			})
			this.dataSource = await this.asset.permissions.getAgents()
			this.dataSource.forEach((item) => {
				item.key = item.group.uuid
			})
			console.log(this.dataSource)
		},
		inviteAgentFun() {
			this.visible = true
		}
	}
}
</script>

<style>
</style>
