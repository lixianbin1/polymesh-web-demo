<template>
	<a-modal
		v-model="drawerTrue"
		:centered="true"
		title="解冻辅助账户"
		cancelText="取消"
		okText="解冻"
		@ok="saveModal"
		@cancel="closeModal"
	>
		<p>是否确认解冻该账户下所有的辅助账户？</p>
	</a-modal>
</template>

<script>
const key = 'updatable'
export default {
	name: 'UnFreezeSecondary',
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
			this.unfreezeSecondary()
		},
		async unfreezeSecondary(){
			console.log(2222)
			this.closeModal()
			try {
				console.log(this.api)
				const freeze = await this.api.accountManagement.unfreezeSecondaryAccounts()
				this.$notification.warn({
					key,
					message: '执行中',
					description: '解冻所有辅助账户',
					duration: 0
				})
				await freeze.run()
				this.$notification.success({
					key,
					message: '执行成功',
					description: '已解冻所有辅助账户'
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
