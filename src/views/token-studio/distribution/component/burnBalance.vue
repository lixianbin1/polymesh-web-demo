<template>
	<a-modal
		:visible="drawerTrue"
		title="销毁代币"
		centered
		:closable="false"
		:maskClosable="false"
		:destroyOnClose="true"
		cancelText="取消"
		okText="提交"
		:okButtonProps="{props: { loading: iconLoading } }"
		@cancel="closeModal"
		@ok="saveModal"
	>
		<div class="ruleForm">
			<div class="font-14 mb-8 title-color">输入您希望销毁的代币数量。</div>
			<a-form :form="form">
				<a-form-item prop="key" class="form-item" label="销毁数量">
					<a-input
						v-decorator="['amount', { rules: [{ required: true, message: '请输入销毁代币数量!' }] }]"
						placeholder="0.00"
						:suffix="ticker"
					></a-input>
				</a-form-item>
			</a-form>
		</div>
	</a-modal>
</template>

<script>
import { BigNumber } from '@polymeshassociation/polymesh-sdk'
export default {
	name: 'BurnBalance',
	props: {
		visible: Boolean
	},
	data(){
		return {
			iconLoading: false,
			form: this.$form.createForm(this, { name: 'burnBalance' }),
			ticker: ''
		}
	},
	computed: {
		drawerTrue: {
			get(){
				return this.visible
			},
			set(){
				this.$emit('close')
			}
		}
	},
	created(){
		this.ticker = this.$route.params.ticker
	},
	methods: {
		closeModal(){
			this.form.resetFields()
			this.iconLoading = false
			this.drawerTrue = false
		},

		async saveModal(){
			this.form.validateFields(async(err, values) => {
				if (err) {
					return false
				}
				this.iconLoading = true
				try {
					this.$notification.warn({
						key: 'update',
						message: '执行中',
						description: `销毁代币...`,
						duration: 0
					})
					const asset = await this.api.assets.getAsset({
						ticker: this.ticker
					})
					const redeem = await asset.redeem({
						'amount': new BigNumber(values.amount)
					})
					await redeem.run()
					this.$notification.success({
						key: 'update',
						message: '执行成功',
						description: `销毁代币...`,
						duration: 0
					})
					this.$emit('close', 'success')
					this.closeModal()
				} catch (error) {
					this.iconLoading = false
					this.$notification.destroy()
					this.$message.error(error.message)
				}
			})
		}
	}
}
</script>
<style lang="scss" scoped>

</style>
