<template>
	<a-modal
		:visible="drawerTrue"
		title="铸币"
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
		<div class="wrap">
			<div class="font-14 title-color">
				输入您希望向分发代理铸造的代币数量，以便他们可以分发给您的代币持有者。
			</div>
			<a-tips title="提示" :bgSize="66">分发您的代币可能会触发适用的证券监管机构或其他政府机构的注册或备案要求。 在分发您的代币之前，请咨询法律和财务顾问。</a-tips>
			<div class="ruleForm mt-24">
				<a-form :form="form">
					<a-form-item label="分销代理的Polymesh账户">
						<span>{{ did.substr(0, 29) }}...{{ did.substr(-29) }}</span>
					</a-form-item>
					<a-form-item label="令牌数量">
						<a-input
							v-decorator="['amount', { rules: [{ required: true, message: '请输入令牌数量!' }] }]"
							placeholder="0.00"
							:suffix="ticker"
						></a-input>
					</a-form-item>
				</a-form>
			</div>
		</div>
	</a-modal>
</template>

<script>
import ATips from '@/views/components/aTips'
import { BigNumber } from '@polymeshassociation/polymesh-sdk'
export default {
	name: 'Minttokens',
	components: {
		ATips
	},
	props: {
		visible: Boolean,
		did: {
			type: String,
			default: ''
		}
	},
	data(){
		return {
			iconLoading: false,
			form: this.$form.createForm(this, { name: 'minttokens' }),
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
				try {
					this.iconLoading = true
					this.$notification.warn({
						key: 'update',
						message: '执行中',
						description: `提交铸币申请...`,
						duration: 0
					})
					const asset = await this.api.assets.getAsset({
						'ticker': this.ticker
					})
					const issuance = asset.issuance
					const issueQueue = await issuance.issue({
						'amount': new BigNumber(values.amount)
					})
					await issueQueue.run()
					this.$notification.success({
						key: 'update',
						message: '执行成功',
						description: `提交铸币申请...`,
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
	::v-deep .ant-form-item-control,
	::v-deep .ant-form-item-label{
		line-height: 1;
		margin-bottom: 8px;
	}
</style>
