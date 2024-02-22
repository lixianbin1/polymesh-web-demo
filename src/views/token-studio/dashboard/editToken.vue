<template>
	<a-modal
		:visible="editVisible"
		:centered="true"
		title="资产详情"
		width="580"
	>
		<div class="ruleForm">
			<div class="font-16">资产详情</div>
			<div class="secondary-color mt-8">在下面编辑您的资产详细信息，您可以随时更改这些详细信息。</div>
			<a-form ref="ruleForm" :model="ruleForm" class="mt-16">
				<a-form ref="ruleForm" :model="ruleForm">
					<a-form-item prop="name" style="margin:0">
						<span>资产名称</span>
						<a-input v-model="ruleForm.name" placeholder="输入资产名称"></a-input>
					</a-form-item>
					<a-form-item prop="fundingRound" style="margin:0">
						<div>指定资金轮次</div>
						<a-select v-model="ruleForm.fundingRound" style="margin-bottom:16px;" @change="onChangeFundingRound">
							<a-select-option v-for="item of fundingRoundList" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
						</a-select>
					</a-form-item>
					<a-input v-show="ruleForm.fundingRound === 'Other'" v-model="ruleForm.fundingRoundOther" class="input-field" placeholder="输入资金轮次" style="margin-top:10px;"></a-input>
					<a-form-item prop="isDivisible" style="margin:0">
						<div>资金可分割性</div>
						<a-radio-group v-model="ruleForm.isDivisible">
							<a-radio :style="{display:'block'}" :value="false">不可分割</a-radio>
							<a-radio :style="{display:'block',marginTop:'10px'}" :value="true">可分割</a-radio>
						</a-radio-group>
					</a-form-item>
				</a-form>
			</a-form>
		</div>
		<template slot="footer">
			<a-button class="botton" @click="closeModal">取消</a-button>
			<a-button class="botton" type="primary" :loading="iconLoading" @click="saveModal">确定</a-button>
		</template>
	</a-modal>
</template>

<script>
export default {
	props: {
		editVisible: {
			type: Boolean,
			default: false
		},
		assets: {
			type: Object,
			default: () => {}
		},
		fundingRoundList: {
			type: Array,
			default: () => []
		}
	},
	data(){
		return {
			iconLoading: false,
			ruleForm: {
				name: '',
				fundingRound: '',
				isDivisible: '',
				fundingRoundOther: ''
			}
		}
	},
	watch: {
		assets: {
			deep: true,
			handler(obj){
				const { fundingRound, details } = obj
				this.ruleForm = {
					fundingRound,
					name: details.name,
					isDivisible: details.isDivisible
				}
				console.log('资产详情：', fundingRound, details, obj, this.ruleForm)
			}
		}
	},
	mounted(){},
	methods: {
		onChangeFundingRound(e){
			if (e !== 'Other'){
				this.ruleForm.fundingRoundOther = ''
			}
		},
		closeModal(){
			this.$emit('modal-handler', 'cancel')
		},
		async saveModal(){
			this.$emit('modal-handler', this.ruleForm)
		}
	}

}
</script>
<style scoped>

</style>
