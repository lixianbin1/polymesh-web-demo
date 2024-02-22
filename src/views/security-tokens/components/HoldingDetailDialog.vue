<template>
	<a-modal
		v-model="visible"
		class="holding-dialog"
		title="安全令牌详细信息"
		width="670px"
		centered
		:closable="false"
		:maskClosable="false"
		:bodyStyle="{ 'max-height': '650px', 'overflow-y': 'auto' }"
		@ok="toggle"
	>
		<div class="dialog-body">
			<a-space size="middle" direction="vertical" class="ticker-symbol p-16 mb-24 primary-color">
				<div class="title">股票代码</div>
				<div class="ticker weight-600 font-36">{{ asset.ticker }}</div>
			</a-space>
			<a-row type="flex" justify="start" align="middle">
				<a-space direction="vertical">
					<div class="secondary-color">总供应量</div>
					<a-space align="baseline">
						<span class="font-32 weight-500 title-color">{{ asset.balance }}</span>
						<span class="secondary-color">{{ asset.ticker }}</span>
					</a-space>
				</a-space>
			</a-row>
			<div class="asset-content mt-32">
				<a-row type="flex" justify="space-between" class="asset-content__item transaction">
					<a-col :span="9" class="label p-16">配置事务</a-col>
					<a-col flex="auto" class="value p-16">
						<template v-if="asset.blockNumber && asset.eventIndex">
							<a-tag color="blue">{{ asset.blockNumber }}-{{ asset.eventIndex }}</a-tag>
							<a :href="`https://polymesh-testnet.subscan.io/extrinsic/${asset.blockNumber}-1?event=${asset.eventIndex}`" target="_blank">
								<a-icon class="tag-icon" type="select" />
							</a>
						</template>
						<span v-else>--</span>
					</a-col>
				</a-row>
				<a-row type="flex" justify="space-between" class="asset-content__item name">
					<a-col :span="9" class="label p-16">安全令牌名称</a-col>
					<a-col flex="auto" class="value p-16">{{ asset.name }}</a-col>
				</a-row>
				<a-row type="flex" justify="space-between" class="asset-content__item assetType">
					<a-col :span="9" class="label p-16">令牌类型</a-col>
					<a-col flex="auto" class="value p-16">{{ asset.assetType }}</a-col>
				</a-row>
				<a-row type="flex" justify="space-between" class="asset-content__item fundingRound">
					<a-col :span="9" class="label p-16">资金轮次</a-col>
					<a-col flex="auto" class="value p-16">{{ asset.currentFundingRound || '--' }}</a-col>
				</a-row>
				<a-row type="flex" justify="space-between" class="asset-content__item uniqueness-requirement">
					<a-col :span="9" class="label p-16">投资者唯一性要求</a-col>
					<a-col flex="auto" class="value p-16">{{ asset.requiresInvestorUniqueness ? '需要' : '不需要' }}</a-col>
				</a-row>
				<a-row type="flex" justify="space-between" class="asset-content__item divisibility">
					<a-col :span="9" class="label p-16">是否可分割</a-col>
					<a-col flex="auto" class="value p-16">{{ asset.isDivisible ? '可分割' : '不可分割' }}</a-col>
				</a-row>
			</div>
			<div class="mt-24">
				<div class="title-color">引用</div>
				<a-row type="flex" justify="center" class="content">
					<a-empty description="暂无引用数据" />
				</a-row>
			</div>
		</div>
		<div slot="footer" class="py-8">
			<a-button type="primary" @click="visible = false">
				关闭
			</a-button>
		</div>
	</a-modal>
</template>
<script>

export default {
	name: 'HoldingDetalDialog',
	props: {
		asset: {
			type: Object,
			default: () => {}
		}
	},
	data() {
		return {
			visible: false
		}
	},
	methods: {
		toggle() {
			this.visible = !this.visible
		}
	}
}
</script>
<style lang="scss" scoped>
.holding-dialog {
	:deep.ant-modal-footer {
		border-top: none;
	}
	.ticker-symbol {
		width: 540px;
		border: 1px solid #91D5FF;
		border-radius: 4px;
		background-color: #E6F7FF;
	}
	.asset-content {
		.asset-content__item {
			border: 1px solid rgb(0, 0, 0,.06);
			&:not(:last-child) {
				border-bottom-color: transparent;
			}
			.label {
				background: #FAFAFA;
				color: $heading-color;
			}
			.value {
				border-left: 1px solid rgb(0, 0, 0,.06);
			}
		}
	}
}
</style>

