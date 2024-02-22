<template>
	<a-table
		:columns="columns" :data-source="toData" :pagination="{
			total:toData.length,
			pageSize:5,
		}"
		:loading="loading"
	>
		<div slot="Token" slot-scope="text,record" class="token">
			<span class="bold mr-8">{{ record.Token }}</span>
			<span class="small">{{ record.name }}</span>
		</div>
		<span slot="sender" slot-scope="sender">{{ sender.slice(0,10)+'...'+sender.slice(55) }}</span>
		<span slot="receive" slot-scope="receive">{{ receive.slice(0,10)+'...'+receive.slice(55) }}</span>
		<span slot="Amount" slot-scope="text,record">{{ record.Amount + " " + record.Token }}</span>
		<span slot="action" slot-scope="text,record" class="actionSpan">
			<a-button class="reject" type="link" size="small" style="padding:0;color:red;margin-right:10px" @click="reject(record)">拒绝</a-button>
			<a-tooltip>
				<template v-if="record.title" #title>{{ record.title }}</template>
				<a-button class="accept" type="link" size="small" style="padding:0;" :disabled="!record.check.result" @click="accept(record)">同意</a-button>
			</a-tooltip>
		</span>
		<span slot="action2" slot-scope="text,record" class="actionSpan">
			<a-tooltip>
				<template v-if="record.title" #title>{{ record.title }}</template>
				<a-button class="claim" type="primary" :disabled="!record.result" @click="claim(record)">领取</a-button>
			</a-tooltip>
		</span>
		<span slot="action3" slot-scope="text,record" class="actionSpan">
			<a-button class="reject" type="link" size="small" style="padding:0;color:red;margin-right:10px" @click="reject(record)">撤销</a-button>
			<a-button v-if="record.status === 'Failed'" class="reschedule" type="link" size="small" style="padding:0;color:red;margin-right:10px" @click="reschedule(record)">重试</a-button>
			<!-- <a-button v-if="record.status === 'Pending' && record.affirmations.length" class="withdraw" type="link" size="small" style="padding:0;color:red;margin-right:10px" @click="withdraw(record)">撤销</a-button>
			<a-tooltip v-if="!record.affirmations.length">
				<template v-if="record.title" #title>{{ record.title }}</template>
				<a-button class="accept" type="link" size="small" style="padding:0;" :disabled="!record.check.result" @click="accept(record)">同意</a-button>
			</a-tooltip> -->
		</span>
		<div slot="asset" slot-scope="text,record">
			<span class="bold">{{ record.asset.ticker }}</span>
			<span class="small">{{ record.name }}</span>
		</div>
		<span slot="venueId" slot-scope="text,record">{{ record.venue.id.toNumber() }}</span>
		<span slot="declarationDate" slot-scope="text,record">{{ record.declarationDate }}</span>
		<span slot="expiryDate" slot-scope="text,record">{{ record.expiryDate }}</span>
		<div v-if="record.mount" slot="mount" slot-scope="text,record">{{ record.mount+" "+record.currency }}</div>
		<span slot="description" slot-scope="text,record">{{ record.description }}</span>
		<span v-if="!record.declarationDate" slot="createdAt" slot-scope="text,record">{{ record.createdAt.toLocaleString() }}</span>
	</a-table>
</template>

<script>
const key = 'updatable'
export default {
	name: 'SettlementsTable',
	props: {
		toData: {
			type: Array,
			default: () => []
		},
		columns: {
			type: Array,
			default: () => []
		},
		loading: {
			type: Boolean,
			default: true
		}
	},
	methods: {
		async reject(data){
			try {
				const reject = await data.Instruction.reject()
				this.$notification.warn({
					key,
					message: '执行中',
					description: '拒绝授权中...',
					duration: 0
				})
				await reject.run()
				this.$notification.success({
					key,
					message: '执行成功',
					description: '拒绝成功'
				})
				this.$emit('refresh')
			} catch (err){
				this.$notification.error({
					key,
					message: 'error',
					description: err.toString()
				})
				return false
			}
		},
		async accept(data){
			try {
				const accept = await data.Instruction.affirm()
				this.$notification.warn({
					key,
					message: '执行中',
					description: '同意授权中...',
					duration: 0
				})
				await accept.run()
				this.$notification.success({
					key,
					message: '执行成功',
					description: '授权成功'
				})
				this.$emit('refresh')
			} catch (err){
				this.$notification.error({
					key,
					message: 'error',
					description: err.toString()
				})
				return false
			}
		},
		async claim(data){
			try {
				const accept = await data.distribution.claim()
				this.$notification.warn({
					key,
					message: '执行中',
					description: '领取股息中...',
					duration: 0
				})
				await accept.run()
				this.$notification.success({
					key,
					message: '执行成功',
					description: '领取成功'
				})
				this.$emit('refresh')
			} catch (err){
				this.$notification.error({
					key,
					message: 'error',
					description: err.toString()
				})
				return false
			}
		},
		async reschedule(data) {
			console.log('reschedule@@@', data)
			try {
				const accept = await data.Instruction.reschedule()
				this.$notification.warn({
					key,
					message: '执行中',
					description: '同意授权中...',
					duration: 0
				})
				await accept.run()
				this.$notification.success({
					key,
					message: '执行成功',
					description: '授权成功'
				})
				this.$emit('refresh')
			} catch (err){
				this.$notification.error({
					key,
					message: 'error',
					description: err.toString()
				})
				return false
			}
		},
		async withdraw(data) {
			try {
				const accept = await data.Instruction.withdraw()
				this.$notification.warn({
					key,
					message: '执行中',
					description: '同意授权中...',
					duration: 0
				})
				await accept.run()
				this.$notification.success({
					key,
					message: '执行成功',
					description: '授权成功'
				})
				this.$emit('refresh')
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
