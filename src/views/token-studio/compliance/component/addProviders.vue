<template>
	<a-modal
		:visible="true"
		title="添加新的证明提供者"
		centered
		:closable="false"
		:maskClosable="false"
		:destroyOnClose="true"
		cancelText="取消"
		:okText="isEdit?'修改':'新增'"
		:okButtonProps="{props: { loading: iconLoading } }"
		@cancel="closeModal"
		@ok="saveModal"
	>
		<div class="wrap1">
			<div class="font-14">您可以在下面为您的资产添加名称和已批准的证明提供商的 Polymesh 账户。只有这些提供者做出的证明将用于检查资产传输的有效性。</div>
			<a-tips title="什么是证明提供者" :bgSize="66">证明提供者是受信任的 Polymesh 账户，可以为您的资产向其他 Polymesh 账户添加证明。</a-tips>
			<a-form ref="ruleForm" :form="form" class="mt-24">
				<a-form-item prop="name" class="form-item">
					<div class="font-14 mb-8">证明提供者的名称</div>
					<a-input v-decorator="['name',decorator.name]" placeholder="输入名称"></a-input>
				</a-form-item>
				<a-form-item prop="key" class="form-item">
					<div class="font-14 mb-8">Polymesh 账户</div>
					<a-input v-decorator="['did',decorator.did]" placeholder="输入Polymesh账户" :disabled="isEdit"></a-input>
				</a-form-item>
				<a-form-item v-if="showOwn" class="form-item text-right">
					<a-button class="botton" @click="addOwn">添加我自己的Polymesh账户</a-button>
				</a-form-item>
				<a-form-item prop="attestations" class="form-item">
					<div class="font-14 mb-16">该提供者可以提供哪些证明？</div>
					<a-checkbox :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange">
						选择所有
					</a-checkbox>
					<a-divider class="mt-16 mb-0" />
					<a-checkbox-group v-model="trustedFor" :options="attestationEnum" @change="onChange" />
				</a-form-item>
			</a-form>
		</div>
	</a-modal>
</template>

<script>
import ATips from '@/views/components/aTips'
export default {
	name: 'ProviderDrawer',
	components: {
		ATips
	},
	props: {
		visible: Boolean,
		providers: {
			type: Object,
			default: null
		},
		attestationEnum: {
			type: Array,
			default: () => {
				return []
			}
		},
		trustedClaimIssuers: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	data(){
		return {
			isEdit: false,
			showOwn: true,
			iconLoading: false,
			did: '',
			trustedFor: [],
			indeterminate: false,
			checkAll: true,
			decorator: {
				name: { rules: [{ required: true, message: '请输入提供者的名称' }] },
				did: { rules: [{ required: true, message: '请输入Polymesh账户' }] }
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
	created(){
		this.form = this.$form.createForm(this)
		this.run()
	},
	methods: {
		async run (){
			if (!this.did) {
				const signing = await this.api.accountManagement.getSigningAccount()
				const identity = await signing.getIdentity()
				this.did = identity.did
			}
			this.init()
		},
		init(){
			this.isEdit = this.providers !== null
			if (this.isEdit) {
				this.trustedFor = this.providers.trustedFor
				this.form.setFieldsValue({
					name: this.providers.name,
					did: this.providers.did
				})
				this.checkAll = this.trustedFor.length === this.attestationEnum.length
				this.showOwn = false
			} else {
				this.showOwn = this.$parent?.providersData?.findIndex(i => i.did === this.did) < 0
				this.trustedFor = this.attestationEnum.map(i => i.value)
				this.checkAll = true
			}
		},

		addOwn(){
			this.form.setFieldsValue({
				name: '我的Polymesh账号',
				did: this.did
			})
		},
		closeModal(){
			this.$emit('close')
		},
		async saveModal(){
			this.form.validateFields(async (err, param) => {
				if (err) {
					return false
				}
				this.iconLoading = true
				const claimIssuers = [{
					identity: param.did,
					trustedFor: this.trustedFor
				}]
				try {
					const saveProv = this.isEdit ? await this.trustedClaimIssuers.set({ claimIssuers }) : await this.trustedClaimIssuers.add({ claimIssuers })
					const text = this.isEdit ? '修改' : '新增'
					this.$notification.warn({
						key: 'update',
						message: '执行中',
						description: `${text}提供者...`,
						duration: 0
					})
					await saveProv.run()
					const ticker = this.$route.params.ticker
					let local = JSON.parse(localStorage.getItem('attestationProviderDetails')) || []
					if (this.isEdit) {
						local = local.filter(item => item.tokenSymbol !== ticker && item.did !== param.did)
					}
					const cur = {
						did: param.did,
						name: param.name,
						tokenSymbol: ticker
					}
					local.push(cur)
					localStorage.setItem('attestationProviderDetails', JSON.stringify(local))
					this.$notification.success({
						key: 'update',
						message: '执行成功',
						description: `${text}提供者...`,
						duration: 0
					})
					this.$emit('close', 'success')
				} catch (error) {
					this.iconLoading = false
					this.$notification.destroy()
					this.$message.error(error.message)
				}
			})
		},

		onChange(trustedFor) {
			this.indeterminate = !!trustedFor.length && trustedFor.length < this.attestationEnum.length
			this.checkAll = trustedFor.length === this.attestationEnum.length
		},
		onCheckAllChange(e) {
			Object.assign(this, {
				trustedFor: e.target.checked ? this.attestationEnum.map(i => i.value) : [],
				indeterminate: false,
				checkAll: e.target.checked
			})
		}
	}
}
</script>
<style lang="scss" scoped>
::v-deep .ant-modal-body{
	max-height: 600px;
	overflow-y: scroll;
}
::v-deep .ant-checkbox-group .ant-checkbox-group-item{
	display: block;
	margin-top: 16px;
}
::v-deep .ant-form-item-label,
::v-deep .ant-form-item-control{
	line-height: 1;
}
.text-right{
	text-align: right;
}
</style>
