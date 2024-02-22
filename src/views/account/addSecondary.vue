<template>
	<a-modal
		v-model="drawerTrue"
		class="SecondaryModal"
		:centered="true"
		title="邀请辅助账户"
		width="580"
	>
		<div class="ruleForm">
			<div class="title-color">在下面输入钱包地址，将该账户添加为当前用户的辅助账户。</div>
			<a-tips>添加辅助账户时，将从您的主账户中支付POLYX网络费用</a-tips>
			<a-form ref="ruleForm" :model="ruleForm">
				<a-form ref="ruleForm" :model="ruleForm">
					<a-form-item prop="nickname" style="margin:0">
						<a-space>昵称</a-space>
						<a-input v-model="ruleForm.nickname" placeholder="输入账户昵称"></a-input>
					</a-form-item>
					<a-form-item prop="key" style="margin:0">
						<a-space>地址</a-space>
						<a-input v-model="ruleForm.key" placeholder="输入地址"></a-input>
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
const key = 'updatable'
import ATips from '@/views/components/aTips'
export default {
	name: 'SecondaryDrawer',
	components: { ATips },
	props: {
		visible: Boolean
	},
	data(){
		return {
			toNext: false,
			iconLoading: false,
			ruleForm: {
				nickname: '',
				key: ''
			}

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
	mounted(){
		this.accountName = JSON.parse(localStorage.getItem('accountName'))
	},
	methods: {
		closeModal(){
			this.ruleForm = {
				nickname: '',
				key: ''
			}
			this.iconLoading = false
			this.drawerTrue = false
		},
		saveModal(){
			this.iconLoading = true
			if (!this.ruleForm.nickname){
				this.$message.warning('key的昵称未填写！')
				this.iconLoading = false
				return false
			}
			if (!this.ruleForm.key){
				this.$message.warning('密钥地址未填写！')
				this.iconLoading = false
				return false
			}
			this.inviteAccount()
		},
		// 辅助密钥邀请
		async inviteAccount(){
			var account
			try {
				account = await this.api.accountManagement.getAccount({ address: this.ruleForm.key })
			} catch (err){
				this.$notification.error({
					message: 'error',
					description: err.toString()
				})
				this.iconLoading = false
				return false
			}
			try {
				const invite = await this.api.accountManagement.inviteAccount({
					'targetAccount': account
				})
				this.$notification.warn({
					key,
					message: '执行中',
					description: '邀请辅助账户...',
					duration: 0
				})
				await invite.run()
				this.accountName[this.ruleForm.key] = this.ruleForm.nickname
				localStorage.setItem('accountName', JSON.stringify(this.accountName))
				this.$notification.success({
					key,
					message: '执行成功',
					description: '邀请辅助账户...'
				})
				this.$emit('update')
				this.closeModal()
			} catch (err){
				this.$notification.error({
					key,
					message: 'error',
					description: err.toString()
				})
				this.iconLoading = false
				return false
			}
		}
	}
}
</script>
<style scoped>

</style>
