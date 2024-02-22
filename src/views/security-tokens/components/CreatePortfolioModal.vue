<template>
	<a-modal
		title="创建投资组合"
		:visible="visible"
		okText="确定"
		:width="648"
		:closable="false"
		centered
		:bodyStyle="{ 'max-height': '650px', 'overflow-y': 'auto' }"
	>
		<a-form-model ref="form" :model="formData" layout="vertical">
			<a-form-model-item
				v-for="(item, index) in formData.names"
				:key="index"
				label="组合名称"
				:prop="'names.' + index + '.name'"
				:rules="{ required: true, message: '组合名称不能为空', trigger: 'blur' }"
			>
				<a-input
					v-model="item.name"
					style="width: 90%; margin-right: 8px"
					placeholder="请输入组合名称"
				/>
				<a-icon
					v-if="formData.names.length > 1"
					class="dynamic-delete-button"
					type="minus-circle-o"
					:disabled="formData.names.length === 1"
					@click="() => removePortfolio(index)"
				/>
			</a-form-model-item>
			<a-form-model-item v-bind="formItemLayoutWithOutLabel">
				<a-button type="link" style="padding-left: 0" @click="addPortfolio">
					<a-icon type="plus" /> 添加
				</a-button>
			</a-form-model-item>
		</a-form-model>
		<template #footer>
			<div class="py-16">
				<a-button @click="onClose">取消</a-button>
				<a-button type="primary" @click="onSubmit">保存</a-button>
			</div>
		</template>
	</a-modal>
</template>
<script>
import { getNotification } from '../utils'

export default {
	name: 'CreatePortfolioModal',
	data() {
		return {
			visible: false,
			formItemLayoutWithOutLabel: {
				labelCol: { span: 0 }
			},
			formData: {
				names: [{ name: '' }]
			}
		}
	},
	methods: {
		toggle() {
			this.visible = !this.visible
		},
		addPortfolio() {
			this.formData.names.push({ name: '' })
		},
		removePortfolio(index) {
			this.formData.names.splice(index, 1)
		},
		onClose() {
			this.toggle()
			this.formData = {
				names: [{ name: '' }]
			}
			this.$refs.form.resetFields()
		},
		onSubmit() {
			this.$refs.form.validate((valid) => {
				if (valid) {
					const { names } = this.formData
					const that = this
					const portfolios = names.map(item => item.name)
					const notification = getNotification(this, { message: '创建投资组合', icon: <a-icon type='loading' />, width: 648 })
					this.onClose()
					notification.confirm(
						{
							subTitle: '请查看并确认新的投资组合详细信息',
							children: portfolios.map(portfolio => ({ label: '投资组合名称', value: portfolio }))
						},
						async () => {
							try {
								const portfolioQueue = await that.api.identities.createPortfolios({
									names: portfolios
								})
								// 操作提示
								notification.run(portfolioQueue, () => {
									that.$emit('on-success')
								})
							} catch (err) {
								notification.open({
									type: 'error',
									description: err.message
								})
							}
						}
					)
				}
			})
		}
	}
}
</script>
