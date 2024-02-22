<template>
	<a-modal
		v-model="drawerTrue"
		class="SecondaryModal"
		:centered="true"
		title="删除辅助账户"
		cancelText="取消"
		okText="删除"
		width="580"
		@ok="saveModal"
		@cancel="closeModal"
	>
		<div>
			<div class="title-color">删除辅助密钥，将辅助账户移除出当前账户。</div>
			<a-tips>删除辅助密钥时，将从您的主账户中支付POLYX网络费用</a-tips>
		</div>
	</a-modal>
</template>

<script>
import ATips from '@/views/components/aTips'
const key = 'updatable'
export default {
	name: 'DeleteSecondary',
	components: { ATips },
	props: {
		visible: Boolean,
		apiAlice: {
			type: Object,
			default: function(){
				return {}
			}
		}
	},
	data(){
		return {
			iconLoading: false
		}
	},
	computed: {
		drawerTrue: {
			get(){
				return this.visible
			},
			set(){
				this.$emit('close')
			}
		}
	},
	mounted(){
		this.accountName = JSON.parse(localStorage.getItem('accountName'))
	},
	methods: {
		closeModal(){
			this.iconLoading = false
			this.drawerTrue = false
		},
		saveModal(){
			console.log(this.apiAlice)
			if (!this.apiAlice.address){
				this.$message.warning('密钥地址不存在！')
				return false
			}
			this.inviteAccount()
		},
		async inviteAccount(){
			this.iconLoading = true
			var account
			try {
				account = await this.api.accountManagement.getAccount({ address: this.apiAlice.address })
			} catch (err){
				this.$notification.error({
					message: 'error',
					description: err.toString()
				})
				this.iconLoading = false
				return false
			}
			try {
				const invite = await this.api.accountManagement.removeSecondaryAccounts({
					accounts: [account]
				})
				this.$notification.warn({
					key,
					message: '执行中',
					description: '删除辅助账户...',
					duration: 0
				})
				this.closeModal()
				await invite.run()
				this.$notification.success({
					key,
					message: '执行成功',
					description: '已删除辅助账户...'
				})
				this.$emit('update')
			} catch (err){
				this.$notification.error({
					key,
					message: 'error',
					description: err.toString(),
					duration: 0
				})
				this.iconLoading = false
				return false
			}
		}
	}
}
</script>
<style scoped>
</style>
