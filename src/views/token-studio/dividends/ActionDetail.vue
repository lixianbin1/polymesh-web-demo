<template>
	<a-row class="box-shadow">
		<a-col>
			<p class="primary-color" style="cursor:pointer;" @click="toPreviousPage">
				<a-icon type="arrow-left" />返回股息分配
			</p>
		</a-col>
		<a-col :span="24" class="secondary-color mt-16">
			<span class="mr-24">快照时间：{{ detailData.createdAt?.toLocaleString() }}</span>
			<span class="mr-24">申报时间：{{ detailData.distribution?.declarationDate?.toLocaleString() }}</span>
			<span class="mr-24">过期时间：{{ detailData.distribution?.expiryDate?.toLocaleString() }}</span>
		</a-col>
		<a-col :span="24" class="mt-16">
			<span class="title-color font-20">{{ detailData.distribution?.description }}</span>
			<a-tag v-if="detailData.type?.code==='progress'" color="blue" class="ml-16">进行中</a-tag>
			<a-tag v-else-if="detailData.type?.code==='expired'" color="red" class="ml-16">已过期</a-tag>
			<a-tag v-else color="green" class="ml-16">已完成</a-tag>
		</a-col>
		<a-col :span="24" class="mt-16">
			<div class="secondary-color">分配的股息</div>
			<div class="mt-16">
				<span class="primary-color">{{ parseFloat(detailData.distribution?.maxAmount.toString()) -
					parseFloat(detailData.details?.remainingFunds?.toString())
				}}</span><span class="ml-8">{{
					detailData.distribution?.currency }}</span>
				<span class="ml-8 mr-8">/</span>
				<span class="secondary-color">{{ detailData.distribution?.maxAmount }} {{ detailData.distribution?.currency }}</span>
			</div>
		</a-col>
		<a-col :span="24" class="mt-16">
			<hr style="border-color:rgba(0, 0, 0, 0.04);">
		</a-col>
		<a-col :span="24" class="mt-16 mb-16">
			<div>代币持有人</div>
		</a-col>
		<a-col :span="6">
			<div class="mb-16 secondary-color">资产持有者</div>
			<div>{{ holdList.length }}</div>
		</a-col>
		<a-col :span="6">
			<div class="mb-16 secondary-color">选择分红的持有者</div>
			<div>{{ detailData.distribution?.targets.treatment==='Include'? detailData.distribution?.targets.identities.length: holdList.length-detailData.distribution?.targets.identities.length }}</div>
		</a-col>
		<a-col :span="6">
			<div class="mb-16 secondary-color">代扣税款的持有者</div>
			<div>{{ totalTaxNum(detailData.distribution?.taxWithholdings) }}</div>
		</a-col>
		<a-col :span="24" class="mt-16">
			<hr style="border-color:rgba(0, 0, 0, 0.04);">
		</a-col>
		<a-col :span="24" class="mt-16 mb-16">
			<div>代扣代缴税款的代币持有人</div>
		</a-col>
		<a-row>
			<a-col :span="6"><div class="mb-16 secondary-color">代扣税款接收人</div></a-col>
			<a-col :span="6"><div class="mb-16 secondary-color">代缴税款（%）</div></a-col>
		</a-row>
		<a-row v-for="item in detailData.distribution?.taxWithholdings" :key="item.identity.did">
			<a-col :span="6">
				<div :title="item?.identity.did">{{ item?.identity.did.slice(0, 7) }}...{{
					item?.identity.did.slice(-7)
				}}</div>
			</a-col>
			<a-col :span="6">
				<div>{{ item?.percentage.toString() }}</div>
			</a-col>
		</a-row>
		<a-col :span="24" class="mt-16">
			<a-space>
				<a-button
					type="primary" style="margin-top:4px;" :disabled="!(detailData.type?.code === 'expired')"
					:loading="unlockFundLoading" @click="unlockFunds"
				>解锁资金</a-button>
				<a-button type="primary" style="margin-top:4px;" :disabled="!(detailData.type?.code === 'progress' && isPay)" :loading="payLoading" @click="pay">支付</a-button>
			</a-space>
		</a-col>
		<a-col v-show="countDown" :span="24" class="mt-16">
			<span class="primary-color">{{ countDown }}</span>
		</a-col>

	</a-row>
</template>
<script>
export default {
	props: {
		isInterest: {
			type: String,
			default: 'main'
		},
		toDetailData: {
			type: Object,
			default: () => ({})
		},
		holdList: {
			type: Array,
			default: () => ([])
		},
		dividendList: { // 股息列表
			type: Array,
			default: () => ([])
		},
		checkpointList: { // 快照列表
			type: Array,
			default: () => ([])
		}
	},
	data() {
		return {
			payLoading: false,
			unlockFundLoading: false,
			detailData: {},
			distribution: {},
			id: null,
			countDown: '',
			isPay: false,
			lock: [false, false]
		}
	},
	computed: {},
	watch: {
		isInterest(val){
			this.lock[0] = true
			if (val === 'detail') {
				this.paymentDate()
			}
		},
		toDetailData: {
			deep: true,
			immediate: true,
			handler(obj) {
				this.lock[1] = true
				console.log('nodeDetails页面：', obj, this.dividendList, this.checkpointList)
				this.detailData = obj
				this.dividendList.forEach(item => {
					if (obj.distribution.id.toString() === item.distribution.id.toString()) {
						this.distribution = item.distribution
						Window.distribution = item.distribution
					}
				})
				this.paymentDate()
			}
		}
	},
	mounted() {
	},
	beforeDestroy() {
		clearInterval(this.id)
	},
	methods: {
		totalTaxNum(arr){
			let flag = 0
			if (!arr){
				return 0
			} else if (arr.length === 0){
				return 0
			}

			arr.forEach(item => {
				if (parseFloat(item.percentage.toString()) > 0){
					flag++
				}
			})
			return flag
		},
		commonFun(str, step, title, e) {
			if (step === 1) {
				this[str] = true
				this.$notification.warn({
					key: '1',
					message: '请求中...',
					description: `${title}`,
					duration: 0
				})
			} else if (step === 2) {
				this.$notification.success({
					key: '1',
					message: '成功！',
					description: `${title}`,
					duration: 0
				})
				this[str] = false
			} else {
				this.$notification.error({
					key: '1',
					message: `${title}失败`,
					description: e.toString(),
					duration: 0
				})
				this[str] = false
			}
		},
		paymentDate() {
			if (!this.lock[0] || !this.lock[1]){
				return
			}
			this.countDown = ''
			this.isPay = false
			if (this.id){
				clearInterval(this.id)
			}
			const payD = this.detailData.distribution?.paymentDate?.getTime()
			const expD = this.detailData.distribution?.expiryDate?.getTime()
			const curD = Date.now()
			if (curD < payD) {
				this.id = setInterval(() => {
					const n = payD - Date.now()
					if (n <= 0) {
						clearInterval(this.id)
						this.$nextTick(() => {
							this.countDown = ''
							this.isPay = true
						})
					}
					const day = Math.floor(n / (1000 * 60 * 60 * 24))
					let h = Math.floor((n / (1000 * 60 * 60)) % 60)
					let m = Math.floor((n / (1000 * 60)) % 60)
					let s = Math.floor((n / (1000)) % 60)
					h = h < 10 ? '0' + h : h
					m = m < 10 ? '0' + m : m
					s = s < 10 ? '0' + s : s
					this.countDown = `  支付时间倒计时： ${day} 天 ${h}:${m}:${s}`
					this.isPay = false
				}, 1000)
			} else if (curD >= payD && curD < expD) {
				this.isPay = true
				this.countDown = ''
			} else {
				this.isPay = false
				this.countDown = ''
			}
		},
		async pay() {
			this.commonFun('payLoading', 1, '股息支付')
			console.log('支付股息')
			// get all participants, their owed amount and whether they have been paid or not (this is SLOW)
			const participants = await this.distribution.getParticipants()
			const arr = participants.map(item => (item.identity.did))
			console.log('pay 入参：', participants, arr)
			if (arr.length === 0) {
				this.commonFun('payLoading', 3, '股息支付', '没有检索到有权在此分配中获得股息的所有身份，请确定是否创建分发检查点')
				return
			}
			try {
				const paymentQ = await this.distribution.pay({
					// targets: [participants[0].identity, participants[1].identity]
					targets: participants.map(item => (item.identity.did))
				})
				await paymentQ.run()
				this.commonFun('payLoading', 2, '股息支付')
				this.$emit('unlock-funds')
				console.log('支付股息成功')
			} catch (e) {
				this.commonFun('payLoading', 3, '股息支付', e)
			}
		},
		async unlockFunds() {
			this.commonFun('unlockFundLoading', 1, '解锁资金')
			try {
				const aa = await this.distribution.reclaimFunds()
				console.log('解锁资金...', aa)
				const bb = await aa.run()
				console.log('解锁资金成功！', bb)
				this.commonFun('unlockFundLoading', 2, '解锁资金')
				this.$emit('unlock-funds')
			} catch (e){
				this.commonFun('unlockFundLoading', 3, '解锁资金', e)
			}
		},
		toPreviousPage() {
			this.$emit('to-previous-page', 'main')
		}
	}
}

</script>
