<template>
	<div>
		<a-modal
			:visible="show"
			title="创建快照"
			centered
			:closable="false"
			:maskClosable="false"
			:destroyOnClose="true"
			cancelText="取消"
			okText="创建"
			:okButtonProps="{props: { loading: nextLoading } }"
			@cancel="cancel"
			@ok="create"
		>
			<p>快照将为您提供当前的所有权分布。此快照可用于确定公司行为的分配方式，包括如何预扣适用税款。目前仅支持分红。</p>
		</a-modal>
	</div>
</template>
<script>
export default {
	props: {
		nextLoading: {
			type: Boolean,
			default: false
		},
		show: {
			type: Boolean,
			default: false
		}
	},
	data(){
		return {
			// show: true,
			// nextLoading: false
		}
	},
	methods: {
		cancel(){
			this.$emit('create-shot', 'cancel')
		},
		create(){
			console.log('next')
			this.$emit('create-shot', 'create')
		}
	}

}
</script>
