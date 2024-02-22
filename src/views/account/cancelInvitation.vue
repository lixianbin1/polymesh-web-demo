<template>
	<a-modal
		v-model="drawerTrue"
		class="SecondaryModal"
		:centered="true"
		title="取消邀请"
		cancelText="取消"
		okText="确定"
		@ok="saveModal"
		@cancel="closeModal"
	>
		<p>是否确认中止此辅助账户的邀请？</p>
	</a-modal>
</template>

<script>
const key = 'updatable'
export default {
	name: 'SignOutSecondary',
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
				const freeze = await this.apiAlice.remove()
				this.$notification.warn({
					key,
					message: '执行中',
					description: '取消邀请中...',
					duration: 0
				})
				this.closeModal()
				await freeze.run()
				this.$notification.success({
					key,
					message: '执行成功',
					description: '已取消邀请'
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
