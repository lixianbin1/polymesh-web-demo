<template>
	<a-modal
		v-model="drawerTrue"
		class="SecondaryModal"
		:centered="true"
		title="冻结辅助账户账户"
		cancelText="取消"
		okText="冻结"
		@ok="saveModal"
		@cancel="closeModal"
	>
		<p>是否确认冻结该账户下所有的辅助账户？</p>
	</a-modal>
</template>

<script>
const key = 'updatable'
export default {
	name: 'FreezeSecondary',
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
			this.freezeSecondary()
		},
		async freezeSecondary(){
			this.closeModal()
			try {
				const freeze = await this.api.accountManagement.freezeSecondaryAccounts()
				this.$notification.warn({
					key,
					message: '执行中',
					description: '冻结所有辅助账户',
					duration: 0
				})
				await freeze.run()
				this.$notification.success({
					key,
					message: '执行成功',
					description: '已冻结所有辅助账户'
				})
				this.$emit('update')
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
