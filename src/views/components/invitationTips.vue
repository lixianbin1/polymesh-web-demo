<template>
	<div v-show="!loading">
		<a-collapse v-if="received.length>1" class="box" :bordered="false" expandIconPosition="right">
			<template #expandIcon="props">
				<a-icon type="double-right" class="primary-color font-24" :rotate="props.isActive ? 90 : -90" />
			</template>
			<a-collapse-panel key="1" style="border:0" class="panel-header">
				<template #header>
					<div class="font-16 flex-center">
						<a-icon class="intvite-icon font-24" type="info-circle" />
						授权请求
						<span class="number">{{ received.length }}</span>
					</div>
				</template>
				<ReceivedBox @update="init" />
			</a-collapse-panel>
		</a-collapse>
		<ReceivedBox v-if="received.length==1" @update="init" />
	</div>
</template>

<script>
import ReceivedBox from '@/views/components/receivedBox.vue'
const key = 'updatable'
export default {
	name: 'InvitationTips',
	components: {
		ReceivedBox
	},
	data(){
		return {
			received: [],
			loading: true
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler(address) {
				this.init()
			}
		}
	},
	mounted(){
		this.init()
	},
	methods: {
		async init(){
			const identity = await this.$account.getIdentity()
			const received1 = await this.$account.authorizations.getReceived({
				includeExpired: false
			})
			var received2 = []
			if (identity){
				received2 = await identity.authorizations.getReceived({
					includeExpired: false
				})
			}
			console.log(received1, received2)
			const received = [...received1, ...received2]
			this.received = received
			this.loading = false
		},
		// 拒绝邀请
		async closeReceived(data){
			try {
				const accpet = await data.remove()
				this.$notification.warn({
					key,
					message: '执行中',
					description: '拒绝授权该操作...',
					duration: 0
				})
				await accpet.run()
				this.$notification.success({
					key,
					message: '执行成功',
					description: '已拒绝'
				})
			} catch (err){
				this.$notification.error({
					key,
					message: 'error',
					description: err.toString()
				})
				return false
			}
			this.init()
		},
		// 同意邀请
		async saveReceived(data){
			try {
				const accpet = await data.accept()
				this.$notification.warn({
					key,
					message: '执行中',
					description: '同意授权该操作...',
					duration: 0
				})
				await accpet.run()
				this.$notification.success({
					key,
					message: '执行成功',
					description: '已授权'
				})
			} catch (err){
				this.$notification.error({
					key,
					message: 'error',
					description: err.toString()
				})
				return false
			}
			this.init()
			this.$emit('reset')
		},
		close(i){
			const array = this.received
			const newArr = array.filter((val, k) => {
				return k !== i
			})
			this.received = newArr
		}
	}
}
</script>
<style scoped>
.intvite-icon{
	color:#1890ff;
	margin-right: 12px;
}
.number{
	background: #FF4D4F;
  color: #fff;
  border-radius: 50%;
  text-align: center;
  padding: 0px 7px;
  height: 24px;
  line-height: 24px;
  min-width: 24px;
  margin-left: 10px;
}
.box{
	background: #f0f2f5;
}
/deep/.panel-header .ant-collapse-header{
	margin-bottom: 24px;
	background: #fff;
}
</style>
