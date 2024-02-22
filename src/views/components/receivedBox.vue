<template>
	<div v-if="!loading">
		<div v-for="(item,i) in received" :key="i" style="position: relative;" :class="received.length==1?'margin1 invite-bg box-shadow mb-24':'margin2 invite-bg box-shadow mb-24'">
			<a-row type="flex" justify="space-between" class="mb-16">
				<div class="font-16 flex-center"><a-icon class="intvite-icon font-24" type="info-circle" />授权请求</div>
				<a-space size="middle">
					<a-button size="small" class="closeReceived" @click="closeReceived(item)">拒绝</a-button>
					<a-button size="small" class="botton" type="primary" @click="saveReceived(item)">同意</a-button>
				</a-space>
			</a-row>
			<a-space v-if="item.data.type=='JoinIdentity'" class="ml-36"> {{ item.issuer.did.slice(0,10) }}...{{ item.issuer.did.slice(-10) }} 请求您成为他的辅助账户，是否接受?</a-space>
			<a-space v-if="item.data.type=='AddRelayerPayingKey'" class="ml-36"> {{ item.issuer.did.slice(0,10) }}...{{ item.issuer.did.slice(-10) }} 请求添加到中继器支付密钥，是否接受?</a-space>
			<a-space v-if="item.data.type=='BecomeAgent'" class="ml-36"> {{ item.issuer.did.slice(0,10) }}...{{ item.issuer.did.slice(-10) }} 请求您成为 {{ item.data.value.asset.ticker }} 资产的代理人，是否接受?</a-space>
			<a-space v-if="item.data.type=='AttestPrimaryKeyRotation'" class="ml-36"> {{ item.issuer.did.slice(0,10) }}...{{ item.issuer.did.slice(-10) }} 请求您的密钥证明主密钥轮换，是否接受?</a-space>
			<a-space v-if="item.data.type=='RotatePrimaryKey'" class="ml-36"> {{ item.issuer.did.slice(0,10) }}...{{ item.issuer.did.slice(-10) }} 请求您的密钥轮换主密钥，是否接受?</a-space>
			<a-space v-if="item.data.type=='RotatePrimaryKeytoSecondary'" class="ml-36"> {{ item.issuer.did.slice(0,10) }}...{{ item.issuer.did.slice(-10) }} 请求您的密钥轮换主密钥到辅助密钥，是否接受?</a-space>
			<a-space v-if="item.data.type=='TransferTicker'" class="ml-36"> {{ item.issuer.did.slice(0,10) }}...{{ item.issuer.did.slice(-10) }} 请求转移给您资产，是否接受?</a-space>
			<a-space v-if="item.data.type=='AddMultiSigSigner'" class="ml-36"> {{ item.issuer.did.slice(0,10) }}...{{ item.issuer.did.slice(-10) }} 请求分配您的密钥到多重签名账号，是否接受?</a-space>
			<a-space v-if="item.data.type=='TransferAssetOwnership'" class="ml-36"> {{ item.issuer.did.slice(0,10) }}...{{ item.issuer.did.slice(-10) }} 请求转移给您资产 {{ item.data.value }} 所有权，是否接受?</a-space>
			<a-space v-if="item.data.type=='PortfolioCustody'" class="ml-36"> {{ item.issuer.did.slice(0,10) }}...{{ item.issuer.did.slice(-10) }} 请求托管投资组合，是否接受?</a-space>
		<!-- <a-icon class="intvite-close" type="close-circle" @click="close(i)" /> -->
		</div>
	</div>
</template>

<script>
import store from '@/store'
const key = 'updatable'
export default {
	name: 'ReceivedBox',
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
			this.loading = true
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
			this.$emit('update')
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
				store.dispatch('Account/update')
			} catch (err){
				this.$notification.error({
					key,
					message: 'error',
					description: err.toString()
				})
				return false
			}
			this.init()
			this.$emit('update')
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
.intvite-close{
	position: absolute;
	top:5px;
	right:5px;
  color: #666;
  cursor: pointer;
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
.margin1{
	margin:0 0 24px
}
.margin2{
	margin:0 -16px 24px
}
.box{
	background: #f0f2f5;
}
/deep/.panel-header .ant-collapse-header{
	margin-bottom: 24px;
	background: #fff;
}
</style>
