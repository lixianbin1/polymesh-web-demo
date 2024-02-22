<template>
	<div>
		<div class="box-shadow mb-24">
			<div class="font-20 mb-16">资产管理</div>
			<div class="secondary-color">更新您的资产信息、转移资产所有权或切换您的资产转移能力。一旦您的资产已分发给投资者，某些操作可能是永久性的。</div>
		</div>
		<div class="box-shadow section mb-24">
			<a-row type="flex" justify="space-between" align="middle" class="header">
				<div>资产详情</div>
				<a-button type="primary" @click="editVisible = true">编辑资产</a-button>
			</a-row>
			<div class="content border-top p-24">
				<a-space size="middle" direction="vertical" class="token-name p-16 mb-24 primary-color">
					<div>股票代码</div>
					<div class="font-36 weight-600">{{ assets.ticker }}</div>
				</a-space>
				<div class="mb-32">
					<a-space direction="vertical">
						<div class="secondary-color">总供应量</div>
						<a-space align="baseline">
							<span class="font-32 weight-500">{{ assets.details?.totalSupply?.toNumber() }}</span>
							<span class="secondary-color">{{ assets.ticker }}</span>
						</a-space>
					</a-space>
				</div>
				<a-descriptions size="middle" :column="1" bordered>
					<a-descriptions-item label="资产名称">{{ assets.details.name }}</a-descriptions-item>
					<a-descriptions-item label="资产类型">{{ assets.details.assetType }}</a-descriptions-item>
					<a-descriptions-item label="资金轮次">{{ assets.fundingRound }}</a-descriptions-item>
					<a-descriptions-item label="投资者唯一性要求">{{ assets.details.requiresInvestorUniqueness ? '需要' : '不需要' }}</a-descriptions-item>
					<a-descriptions-item label="是否可分割">{{ assets.details.isDivisible ? '是' : '否' }}</a-descriptions-item>
				</a-descriptions>
			</div>
		</div>
		<div class="box-shadow section">
			<a-collapse activeKey="1" :bordered="false">
				<template #expandIcon="props">
					<a-icon type="down-circle" class="collapse-icon" :rotate="props.isActive ? 180 : 0" />
				</template>
				<a-collapse-panel key="1" header="资产高级设置">
					<div class="p-24">
						<div>新资产所有者的Polymesh账户</div>
						<a-input v-model="transferAccount" class="mt-16" placeholder="请输入Polymesh账户" style="width: 540px;height:32px;" />
						<div><a-button type="primary" class="mt-24" @click="onTransferOwnership">转移资产所有权</a-button></div>
						<div class="mt-24 pt-24 border-top">
							<div>资产转移管理</div>
							<div class="mt-24">
								<a-button v-if="!assets.isFrozen" type="primary" @click="onFreeze">禁止转移</a-button>
								<a-button v-if="assets.isFrozen" type="primary" @click="onUnfreeze">允许转移</a-button>
							</div>
						</div>
					</div>
				</a-collapse-panel>
			</a-collapse>
		</div>
		<editToken :editVisible="editVisible" :assets="assets" :fundingRoundList="fundingRoundList" @modal-handler="modalHanler"></editToken>
	</div>
</template>

<script>
import editToken from './editToken.vue'
export default {
	name: 'TokenDashboard',
	components: { editToken },
	data(){
		return {
			assets: {
				details: {}
			},
			transferAccount: '',
			editVisible: false,
			fundingRoundList: [
				{ label: '选择一个轮次', value: '' },
				{ label: '天使轮 Angel', value: 'Angel' },
				{ label: 'Pre种子轮 Pre-Seed', value: 'Pre-Seed' },
				{ label: '种子轮 Seed', value: 'Seed' },
				{ label: '创投 Venture - Series Unknown', value: 'Venture' },
				{ label: 'A轮 Series A', value: 'Series A' },
				{ label: 'B轮 Series B', value: 'Series B' },
				{ label: 'C轮 Series C', value: 'Series C' },
				{ label: '股权众筹 Equity Crowdfunding', value: 'Equity Crowdfunding' },
				{ label: '私募基金 Private Equity', value: 'Private Equity' },
				{ label: '可转债 Convertible Note', value: 'Convertible Note' },
				{ label: '债务融资 Debt Financing', value: 'Debt Financing' },
				{ label: '其他 Other', value: 'Other' }
			]
		}
	},
	mounted(){
		this.getAsset(this.$route.params.ticker)
	},
	methods: {
		async onModify({ name, fundingRound, fundingRoundOther, isDivisible }){
			// name: '', 资产名称
			// fundingRound: '', 融资轮次
			// isDivisible: '', 是否可分割
			// fundingRoundOther: '' 融资轮次
			try {
				const data = {}
				const fundIndex = this.fundingRoundList.findIndex(item => item.value === this.assets.fundingRound)
				if (fundIndex === -1){
					fundingRoundOther !== this.assets.fundingRound && (data.fundingRound = fundingRoundOther)
				} else {
					fundingRound !== this.assets.fundingRound && (data.fundingRound = fundingRound)
				}
				this.assets.details.name !== name && (data.name = name)
				this.assets.details.isDivisible !== isDivisible && (data.makeDivisible = isDivisible)

				this.$notification.warn({
					key: '1',
					message: '执行中',
					description: '修改资产信息中...',
					duration: 0
					// icon: h => h('a-icon', { attrs: { type: 'clock-circle', style: 'color: #faad14' }})
				})
				const runQ = await this.assets.modify({
					ticker: this.assets.ticker,
					...data
				})
				await runQ.run()
				this.$notification.success({
					key: '1',
					message: '执行成功',
					description: '修改资产信息成功'
					// duration: 0
				})
				await this.getAsset(this.$route.params.ticker)
				this.editVisible = false
			} catch (e){
				this.$notification.destroy()
				this.$message.error(e.message)
			}
		},
		modalHanler(params){
			console.log('弹框操作：', params)
			if (params === 'cancel'){
				this.editVisible = false
			} else {
				this.onModify(params)
			}
		},
		async getAsset (ticker) { // 获取资产信息
			const assets = await this.api.assets.getAsset({ ticker })
			assets.getOperationHistory().then(res => {
				this.historyData = res[0].history.map(item => {
					item.blockNumber = item.blockNumber.toNumber()
					item.eventIndex = item.eventIndex.toNumber()
					item.blockDate = item.blockDate.toLocaleDateString()
					return item
				})
			})
			assets.details = await assets.details()
			assets.fundingRound = await assets.currentFundingRound()
			assets.isFrozen = await assets.isFrozen()
			this.assets = assets
			// this.setEditForm()
			this.assetDetailList = [
				{ title: '资产名称', value: assets.details.name },
				{ title: '资产类型', value: assets.details.assetType },
				{ title: '资产身份', value: '' },
				{ title: '资金轮次', value: assets.fundingRound },
				{ title: '投资者唯一性要求', value: assets.details.requiresInvestorUniqueness ? '需要' : '不需要' },
				{ title: '是否可分割', value: assets.details.isDivisible ? '是' : '否' }
			]
		},
		async onTransferOwnership(){ // 转移资产
			if (!this.transferAccount){
				return this.$message.error('请填写 Polymesh 账户')
			}
			try {
				this.$notification.warn({
					key: '2',
					message: '执行中',
					description: '正在转移资产...',
					duration: 0
				})
				const runQ = await this.assets.transferOwnership({
					target: this.transferAccount
				})
				await runQ.run()
				this.$notification.success({
					key: '2',
					message: '执行成功',
					description: '转移资产成功，等待对方确认'
				})
			} catch (e){
				this.$notification.destroy()
				this.$message.error(e.message)
			}
		},
		async onFreeze(){ // 冻结
			try {
				this.$notification.warn({
					key: '3',
					message: '执行中',
					description: '正在冻结资产...',
					duration: 0
				})
				const runQ = await this.assets.freeze()
				await runQ.run()
				this.assets.isFrozen = true
				this.$notification.success({
					key: '3',
					message: '执行成功',
					description: '冻结资产成功'
				})
			} catch (e){
				this.$notification.destroy()
				this.$message.error(e.message)
			}
		},
		async onUnfreeze(){ // 解冻
			try {
				this.$notification.warn({
					key: '4',
					message: '执行中',
					description: '正在解冻资产...',
					duration: 0
				})
				const runQ = await this.assets.unfreeze()
				await runQ.run()
				this.assets.isFrozen = false
				this.$notification.success({
					key: '4',
					message: '执行成功',
					description: '解冻资产成功'
				})
			} catch (e){
				this.$notification.destroy()
				this.$message.error(e.message)
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.section {
	padding: 0;
	.header {
		padding: 16px 24px;
		font-size: $font-16;
	}
	.content {
		.token-name {
			width: 540px;
			background: #E6F7FF;
			border: 1px solid #91D5FF;
			border-radius: 4px;
		}
	}
}
.border-top {
	border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.ant-descriptions-item-label {
	width: 300px;
}

.ant-collapse {
	background-color: #fff;
}
.ant-collapse-borderless > .ant-collapse-item > .ant-collapse-content {
	background: #fff;
}
::v-deep .ant-collapse > .ant-collapse-item > .ant-collapse-header {
	font-size: $font-16;
	padding: 24px;
	border-bottom: 1px solid rgba(0,0,0, 0.06)
}
::v-deep .ant-collapse-content > .ant-collapse-content-box {
	padding: 0;
}
::v-deep .ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow {
	right: 24px;
	left: auto;
	font-size: $font-28;
	color: $primary-color;
}
</style>
