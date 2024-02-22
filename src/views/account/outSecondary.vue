<template>
	<a-modal
		v-model="drawerTrue"
		class="SecondaryModal"
		:centered="true"
		title="退出辅助账户身份"
		cancelText="取消"
		okText="退出"
		@ok="saveModal"
		@cancel="closeModal"
	>
		<p>是否确认从该身份账户下退出辅助账户身份？</p>
	</a-modal>
</template>

<script>
import store from '@/store'
const key = 'updatable'
export default {
	name: 'SignOutSecondary',
	props: {
		visible: Boolean
	},
	data(){
		return {

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

	},
	methods: {
		closeModal(){
			this.drawerTrue = false
		},
		saveModal(){
			this.leaveIdentity()
		},
		async leaveIdentity(){
			try {
				const freeze = await this.api.accountManagement.leaveIdentity()
				this.$notification.warn({
					key,
					message: '执行中',
					description: '退出辅助账户身份中...',
					duration: 0
				})
				this.closeModal()
				await freeze.run()
				this.$notification.success({
					key,
					message: '执行成功',
					description: '已退出辅助账户'
				})
				this.$emit('update')
				store.dispatch('Account/update')
			} catch (err){
				this.$notification.error({
					key,
					message: 'error',
					description: err.toString()
				})
				return false
			}
		}
	}
}
</script>
<style scoped>

</style>
