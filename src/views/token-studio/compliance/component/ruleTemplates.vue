<template>
	<div class="rule-template">
		<div
			v-for="(item, index) in templateData"
			:key="index"
			class="item flex pt-16 pb-16"
			@click="selectRule(item.ruleContent)"
		>
			<p class="pr-16 font-14">{{ item.ruleName }}</p>
			<a-icon type="right" :style="{ fontSize: '14px', color:'#8c9ba5' }" />
		</div>
	</div>
</template>

<script>
export default {
	name: 'ProviderDrawer',
	props: {
		ruleScope: {
			type: Object,
			default: () => {}
		}
	},
	data(){
		return {
			templateData: []
		}
	},
	mounted(){
		const $scope = this.ruleScope
		this.templateData = [{
			ruleName: '接收方必须经过KYC验证',
			ruleContent: [{
				'type': 'IsPresent',
				'claim': { 'type': 'KnowYourCustomer', 'scope': $scope },
				'target': 'Receiver'
			}]
		}, {
			ruleName: '接收方是经KYC核实的或关联方、认可的或豁免的或来自特定司法管辖区的',
			ruleContent: [{
				'type': 'IsAnyOf',
				'claims': [
					{ 'type': 'KnowYourCustomer', 'scope': $scope },
					{ 'type': 'Accredited', 'scope': $scope },
					{ 'type': 'Affiliate', 'scope': $scope },
					{ 'type': 'Exempted', 'scope': $scope },
					{ 'type': 'Jurisdiction', 'code': 'Af', 'scope': $scope }
				],
				'target': 'Receiver'
			}]
		}, {
			ruleName: '接收方必须经过KYC验证，并且是关联方或豁免或认可方，或来自特定的司法管辖区',
			ruleContent: [{
				'type': 'IsPresent',
				'claim': { 'type': 'KnowYourCustomer', 'scope': $scope },
				'target': 'Receiver'
			}, {
				'type': 'IsAnyOf',
				'claims': [
					{ 'type': 'Accredited', 'scope': $scope },
					{ 'type': 'Affiliate', 'scope': $scope },
					{ 'type': 'Exempted', 'scope': $scope },
					{ 'type': 'Jurisdiction', 'code': 'Af', 'scope': $scope }
				],
				'target': 'Receiver'
			}]
		}, {
			ruleName: '接收方必须经过KYC验证，是关联方或豁免方或认可方，或不来自特定的司法管辖区',
			ruleContent: [{
				'type': 'IsPresent',
				'claim': { 'type': 'KnowYourCustomer', 'scope': $scope },
				'target': 'Receiver'
			}, {
				'type': 'IsAnyOf',
				'claims': [
					{ 'type': 'Accredited', 'scope': $scope },
					{ 'type': 'Affiliate', 'scope': $scope },
					{ 'type': 'Exempted', 'scope': $scope }
				],
				'target': 'Receiver'
			}, {
				'type': 'IsAbsent',
				'claim': { 'type': 'Jurisdiction', 'code': 'Af', 'scope': $scope },
				'target': 'Receiver'
			}]
		}, {
			ruleName: '接收方必须获豁免',
			ruleContent: [{
				'type': 'IsPresent',
				'claim': { 'type': 'Exempted', 'scope': $scope },
				'target': 'Receiver'
			}]
		}, {
			ruleName: '接收方不能被阻塞',
			ruleContent: [{
				'type': 'IsAbsent',
				'claim': { 'type': 'Blocked', 'scope': $scope },
				'target': 'Receiver'
			}]
		}]
	},
	methods: {
		selectRule(rule){
			this.$emit('selectRule', rule)
		}
	}
}
</script>
<style lang="scss" scoped>
	.flex{
		display: flex;
		align-items: center;
	}
	.item{
		color: $heading-color;
		line-height: 22px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06); // $border-color-base太深色
		cursor: pointer;
		p{
			flex: 1;
			margin: 0;
		}
	}
</style>
