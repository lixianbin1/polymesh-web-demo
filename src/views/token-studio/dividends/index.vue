<template>
	<a-spin :spinning="load" size="large">
		<a-row
			type="flex"
			:gutter="[24, 24]"
		>
			<a-col v-show="isInterest==='main' || isInterest==='add'" :span="24">
				<a-row class="box-shadow">
					<a-col :span="24">
						<div class="font-16">股息分红</div>
						<div class="secondary-color mt-16">
							使您可以基于快照时的资产分配方式分配给资产持有者。
						</div>
						<div
							class="mt-16 p-16"
							style="background: #fafafa"
						>
							<a-tips title="提示">目前仅支持股息分配。</a-tips>
						</div></a-col>
				</a-row>
			</a-col>
			<a-col
				v-show="isInterest==='main'"
				:span="24"
			>
				<a-row
					class="box-shadow"
					style="border-bottom: 1px solid rgba(0, 0, 0, 0.06);padding:12px 24px;"
				>
					<a-col :span="20">
						<div class="filter-action">
							<a-radio-group
								name="radioGroup"
								:default-value="progressing"
								@change="filterFun"
							>
								<a-radio value="all"> 所有 </a-radio>
								<a-radio value="progress"> 正在进行中 </a-radio>
								<a-radio value="completed"> 完成 </a-radio>
							</a-radio-group>
							<a-select
								default-value="all"
								style="width: 200px"
								class="ml-16"
								@change="handleChange"
							>
								<a-select-option value="all">
									所有年份
								</a-select-option>
								<a-select-option :value="currentYear">
									{{ currentYear }}
								</a-select-option>
							</a-select>
						</div>
					</a-col>
					<a-col
						:span="4"
						style="text-align:right;"
					>
						<a-button
							type="primary"
							@click="()=>{show=true}"
						>创建快照</a-button>
					</a-col>
				</a-row>
				<a-row class="box-shadow action-modify" style="min-height: 300px;">
					<a-col :span="24">
						<a-timeline class="time-line ml-140">
							<a-timeline-item
								v-for="item in menuFilterData"
								v-show="item.isShow"
								:key="item.checkpoint.id.toString()"
								style="position:relative;"
							>
								<TimelineNode
									:shotList="item" :assets="assets" @add-interest-settlement="addInterestSettlement"
									@to-detail="toDetail"
								>
								</TimelineNode>
								<div
									class="left-tip"
									style="position:absolute;left:-155px;top:0;"
								>
									<div>{{ item.date }}&nbsp;{{ item.time }}</div>
									<p
										title="此功能暂未开放"
										class="text-right primary-color"
										style="cursor:pointer;"
										@click="()=>{$message.warning('此功能暂未开放')}"
									>导出快照</p>
								</div>
							</a-timeline-item>
						</a-timeline>
						<div v-show="menuFilterData.length===0" style="color:rgba(0, 0, 0, 0.45);text-align:center;">
							<div>
								<img src="@/assets/noData.svg" alt="">
							</div>

							尚未创建快照
						</div>
					</a-col>
				</a-row>
			</a-col>
			<a-col
				v-show="isInterest==='add'"
				:span="24"
			>
				<InterestSettlementing
					v-show="isInterest === 'add'" :currentPoint="currentPoint" :assets="assets"
					:dividendList="dividendList" :checkpointList="checkpointList" :isInterest="isInterest" :holdList="holdList"
					:ticker="ticker" @stop-interest="stopInterest" @refrush="getShot"
				></InterestSettlementing>
			</a-col>
			<a-col v-show="isInterest==='detail'" :span="24">
				<Detail
					:toDetailData="toDetailData" :holdList="holdList" :isInterest="isInterest"
					:dividendList="dividendList" :checkpointList="checkpointList" @to-previous-page="stopInterest"
					@unlock-funds="getShot"
				></Detail>
			</a-col>
		</a-row>
		<CreateShot
			:show="show" :nextLoading="nextLoading"
			@create-shot="modalHandle"
		></CreateShot>
	</a-spin>
</template>

<script>
import ATips from '@/views/components/aTips'
import TimelineNode from './TimelineNode.vue'
import InterestSettlementing from './InterestSettlementing.vue'
import CreateShot from './CreateShot.vue'
import Detail from './ActionDetail.vue'
export default {
	components: {
		'a-tips': ATips,
		TimelineNode,
		InterestSettlementing,
		CreateShot,
		Detail
	},
	data () {
		return {
			nextLoading: false,
			// progressing: 'all',
			// year: 'all',
			// ticker: 'TY001',
			show: false,
			// isInterest: 'main', // main,add,detail

			load: false,
			// shotVisible: false,
			assets: null,
			ticker: this.$route.params.ticker,
			checkpointQueueList: [],
			isInterest: 'main', // main add detail
			currentPoint: null,
			progressing: 'all',
			year: 'all',
			toDetailData: {},
			holdList: [],
			dividendList: [], // 已发的股息列表
			checkpointList: [],
			currentYear: new Date().getFullYear()
		}
	},
	computed: {
		menuFilterData () {
			console.log(11)
			this.checkpointQueueList.forEach(item => {
				const y = item.createdAt.getFullYear()
				if (this.year === 'all') {
					item.isShow = true
				} else {
					if (y === this.year) {
						item.isShow = true
					} else {
						item.isShow = false
					}
				}
				if (item.isShow) {
					item.pointList.forEach(it => {
						if (this.progressing === 'all') {
							it.isShow = true
						} else {
							if (it.type.code === this.progressing) {
								it.isShow = true
							} else {
								it.isShow = false
							}
						}
					})
				}
			})
			return this.checkpointQueueList
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler () {
				this.$router.replace('/tokenStudio')
			}
		}
	},
	mounted () {
		this.getAssets()
	},
	methods: {
		filterFun(val){
			console.log(val)
			this.progressing = val.target.value
		},
		async getAssets () { // 获取资产信息
			this.load = true
			this.assets = await this.api.assets.getAsset({ ticker: this.ticker })
			this.getShot()
		},
		async getShot () {
			if (this.isInterest) {
				this.isInterest = 'main'
			}
			this.progressing = 'all'
			this.year = 'all'
			const checkpointQueue = await this.assets.checkpoints.get()
			this.checkpointList = checkpointQueue.data
			console.log('checkpointList:', checkpointQueue.data)
			let checkpointQueueList = checkpointQueue.data.map(item => {
				const { createdAt } = item
				const timeNo = createdAt.getTime()
				const fullDate = createdAt.toLocaleString()
				const [date, time] = fullDate.split(' ')
				// totalSupply  createdAt checkpoint

				const obj = {
					timeNo,
					fullDate,
					date,
					time,
					pointList: [],
					isShow: true,
					totalSupply: item.totalSupply,
					createdAt: item.createdAt,
					checkpoint: {
						id: item.checkpoint.id,
						uuid: item.checkpoint.uuid
					}
				}
				return obj
			})
			checkpointQueueList = checkpointQueueList.sort((obj1, obj2) => {
				return obj2.timeNo - obj1.timeNo
			})

			const distributions = this.assets.corporateActions.distributions
			let corpActionList = await distributions.get()

			corpActionList = corpActionList.sort((obj1, obj2) => {
				return obj1.distribution.declarationDate.getTime() - obj2.distribution.declarationDate.getTime()
			})
			// 查询股息分配数据：
			const dividendList = await Promise.all(corpActionList.map(async item => {
				const { id: pointId, uuid: pointUuid } = await item.distribution.checkpoint()
				// const { fundsReclaimed: detailFundsReclaimed, remainingFunds: detailRemainingFunds } = await item.distribution.details()
				// item.fundingRound = await item.currentFundingRound()
				return { pointId, pointUuid, ...item }
			}))
			dividendList.forEach(item => {
				checkpointQueueList.forEach(obj => {
					if (obj.checkpoint.id.toString() === item.pointId.toString()) {
						const { details, distribution, pointId, pointUuid } = item
						obj.pointList.push({
							isShow: true, details, pointId, pointUuid,
							type: this.currentType(details, distribution),
							distribution: {
								// checkpoint: , // 检查点
								// originPortfolio, // optional, defaults to the CAA's default portfolio
								currency: distribution.currency,
								declarationDate: distribution.declarationDate,
								defaultTaxWithholding: distribution.defaultTaxWithholding,
								description: distribution.description,
								expiryDate: distribution.expiryDate,
								id: distribution.id,
								kind: distribution.kind,
								maxAmount: distribution.maxAmount,
								paymentDate: distribution.paymentDate,
								perShare: distribution.perShare,
								targets: {
									identities: distribution.targets.identities.map(it => ({ did: it.did })),
									treatment: distribution.targets.treatment
								},
								taxWithholdings: distribution.taxWithholdings.map((it) => {
									const { identity, percentage } = it
									return {
										identity: { did: identity.did },
										percentage
									}
								})
							}
						})
					}
				})
			})
			this.dividendList = dividendList
			this.checkpointQueueList = checkpointQueueList
			console.log('dividendList:', dividendList, checkpointQueueList)
			this.load = false
		},
		currentType (details, distribution) {
			const fundsReclaimed = details?.fundsReclaimed
			const remainingFunds = parseFloat(details?.remainingFunds.toString())
			const maxAmount = parseFloat(distribution?.maxAmount.toString())
			const expiryDate = distribution?.expiryDate?.getTime()
			const currentTime = Date.now()
			if (fundsReclaimed || maxAmount - remainingFunds === maxAmount) {
				return { code: 'completed', name: '已完成', color: 'rgb(0, 170, 94)', background: 'rgb(212, 247, 231)' }
			} else if (!expiryDate || currentTime < expiryDate) {
				return { code: 'progress', name: '进行中...', color: 'rgb(19, 72, 228)', background: 'rgb(220, 239, 254)' }
			} else {
				return { code: 'expired', name: '已过期', color: 'rgb(227, 163, 12)', background: 'rgb(251, 243, 208)' }
			}
		},
		commonFun(step, title, e) {
			if (step === 1) {
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
			} else {
				this.$notification.error({
					key: '1',
					message: `${title}失败`,
					description: e.toString(),
					duration: 0
				})
			}
		},
		async modalHandle (str) {
			if (str === 'cancel') {
				this.show = false
			} else {
				this.nextLoading = true
				console.log('创建检查点：', this.assets)
				this.commonFun(1, '创建快照')
				try {
					const checkpointQueue = await this.assets.checkpoints.create()
					const checkpoint = await checkpointQueue.run()
					console.log('创建检查点成功', checkpoint)
					this.commonFun(2, '创建快照')
					this.show = false
					this.nextLoading = false
					this.getShot()
				} catch (e) {
					this.commonFun(3, '创建快照', e)
					this.nextLoading = false
				}
			}
		},
		handleChange (val) {
			console.log(val)
			this.year = val
		},
		toDetail (obj) {
			this.holdList = []
			this.getTokenHolder(obj.pointId)
			this.toDetailData = obj
			this.isInterest = 'detail'
		},
		setMenu (str, value) {
			this[str] = value
		},
		stopInterest (val) {
			this.isInterest = val
		},
		addInterestSettlement (data) { // 结息
			this.holdList = []
			this.isInterest = 'add'
			this.currentPoint = data
			this.getTokenHolder(data.checkpoint.id)
		},
		// modifyVisible([str, bool]) {
		// 	this[str] = bool
		// },
		// createShotDrawer() {
		// this.shotVisible = true
		// },
		// async createShot() {
		// 	console.log('创建检查点：')
		// 	this.commonFun(1, '创建快照')
		// 	try {
		// 		const checkpointQueue = await this.assets.checkpoints.create()
		// 		const checkpoint = await checkpointQueue.run()
		// 		console.log('创建检查点成功', checkpoint)
		// 		this.getShot()
		// 		this.commonFun(2, '创建快照')
		// 	} catch (e) {
		// 		this.commonFun(3, '创建快照', e)
		// 	}
		// },
		async getTokenHolder (id) {
			const assets = await this.api.assets.getAsset({ ticker: this.ticker })
			const agentArr = await assets.corporateActions.getAgents()
			let agentDid
			if (agentArr.length > 0){
				agentDid = agentArr[0].did
			}

			const did = (await this.api.getSigningIdentity()).did
			const currentPoint = this.checkpointList.filter(item => id.toString() === item.checkpoint.id.toString())[0]
			console.log('当前快照：', currentPoint)
			const obj = await currentPoint.checkpoint.allBalances()
			const holdList = obj.data.filter(item => {
				const balance = parseFloat(item.balance.toString())
				return balance > 0
			})
			const holdListArr = holdList.map((item, index) => {
				const itemDid = item.identity.did
				return ({ key: index, did: itemDid, taxWitholding: 0, balance: item.balance, isSign: did === itemDid, isAgent: agentArr.length > 0 && agentDid === itemDid || agentArr.length === 0 && did === itemDid })
			})
			const newArr = []
			holdListArr.forEach(item => {
				if (item.isAgent || item.isSign){
					newArr.push(item)
				} else {
					newArr.unshift(item)
				}
			})
			this.holdList = newArr
			console.log('创建快照时，持有该资产的身份列表：', did, this.holdList)
		}
	}
}
</script>

<style></style>
