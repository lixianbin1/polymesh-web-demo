<template>
	<div>
		<a-modal
			:visible="show"
			title="转账"
			centered
			:closable="false"
			:maskClosable="false"
			:destroyOnClose="true"
			cancelText="取消"
			okText="下一步"
			:okButtonProps="{props: { loading: nextLoading } }"
			:width="580"
			@cancel="toggle"
			@ok="next"
		>
			<a-space size="large">
				<a-icon class="primary-icon" type="money-collect" />
				<a-space direction="vertical">
					<div class="secondary-color">您的可用余额</div>
					<a-space align="baseline">
						<span class="font-24">{{ balance.free }}</span>
						<span class="secondary-color">POLYX</span>
					</a-space>
				</a-space>
			</a-space>
			<a-form :form="form">
				<a-form-item label="转账至">
					<a-input v-decorator="['to',decorator.to]" placeholder="请输入转账地址" />
				</a-form-item>
				<a-form-item label="转账数量">
					<a-input v-decorator="['amount',decorator.amount]" placeholder="请输入交易数量">
						<template #suffix>
							<span style="color: rgb(140, 155, 165)">POLYX</span>
						</template>
					</a-input>
				</a-form-item>
				<a-form-item label="备注">
					<a-input v-decorator="['memo']" placeholder="备注" />
				</a-form-item>
			</a-form>
		</a-modal>

		<a-modal
			:visible="showConfirm"
			title="转账确认"
			centered
			:destroyOnClose="true"
			:closable="false"
			:maskClosable="false"
			class="wrapper"
			cancelText="关闭"
			okText="确认转账"
			:okButtonProps="{props: { loading: confirmLoading } }"
			:width="880"
			@cancel="()=>{showConfirm = false}"
			@ok="setBalance"
		>
			<div class="transfer-info">
				<div class="flex item font-14">
					<span>转账至</span>
					<span>{{ param.to }}</span>
				</div>
				<div class="flex item font-14">
					<span>备注</span>
					<span>{{ param.memo }}</span>
				</div>
				<div class="flex item font-14">
					<span>交易数量</span>
					<a-space align="baseline">
						{{ param.amount }}<span class="polyx">POLYX</span>
					</a-space>
				</div>
				<div class="flex item font-14">
					<span>手续费</span>
					<a-space align="baseline">
						{{ fees }}<span class="polyx">POLYX</span>
					</a-space>
				</div>
			</div>
			<div class="flex settlement pl-24 pr-24">
				<span class="font-24">合计</span>
				<a-space align="baseline" class="font-32">
					{{ total }}<span class="polyx">POLYX</span>
				</a-space>
			</div>
		</a-modal>
	</div>
</template>

<script>
import { BigNumber } from '@polymeshassociation/polymesh-sdk'
const key = 'updatable'
export default {
	name: 'TransferAccounts',
	props: {
		balance: {
			type: Object,
			default(){
				return {
					total: 0,
					free: 0,
					locked: 0
				}
			}
		}
	},
	data(){
		return {
			form: null,
			show: false,
			showConfirm: false,
			fees: 0,
			nextLoading: false,
			confirmLoading: false,
			transferPolyx: null,
			param: {},
			total: 0,
			decorator: {
				to: { rules: [{ required: true, message: '请输入对方地址' }] },
				amount: { rules: [{ required: true, message: '请输入转账数量' }] }
			}
		}
	},
	created() {
		this.form = this.$form.createForm(this)
	},
	mounted(){
		// this.form.getFieldDecorator('to', { initialValue: '5GVqvGXrLAwjcZ2Z26r4wpmjxXQ5dYavD9qBFSfJGNv6tgmb' })
		// this.form.getFieldDecorator('amount', { initialValue: '10' })
		// this.form.getFieldDecorator('memo', { initialValue: 'test' })
	},
	methods: {
		toggle(){
			this.show = !this.show
		},
		next(e){
			e.preventDefault()
			this.form.validateFields(async (err, param) => {
				if (!err) {
					this.param = param
					this.nextLoading = true
					try {
						this.transferPolyx = await this.api.network.transferPolyx({
							amount: new BigNumber(param.amount),
							to: param.to,
							memo: param.memo
						})
					} catch (error) {
						this.$notification.error({
							key,
							message: 'error',
							description: '转账信息有误，请确认...',
							duration: 0
						})
						// this.message('error', '转账信息有误，请确认...')
						this.nextLoading = false
						return false
					}
					this.transferPolyx.onStatusChange(listener => {
						const status = listener.status
						if (status === 'Succeeded' || status === 'Rejected'){
							if (status === 'Succeeded'){
								this.$notification.success({
									key,
									message: '执行成功',
									description: '交易成功...'
								})
								// this.message('success', '交易成功!')
								this.showConfirm = false
								setTimeout(() => {
									this.show = false
								}, 310)
							} else {
								this.$notification.error({
									key,
									message: 'error',
									description: '交易已取消...',
									duration: 0
								})
								// this.message('error', '交易已取消')
							}
							this.confirmLoading = false
						} else if (status === 'Running') {
							this.$notification.warn({
								key,
								message: '执行中',
								description: '已成功授权,正在进行转账...',
								duration: 0
							})
							// this.message('loading', '已成功授权,正在进行转账...')
						} else if (status === 'Unapproved') {
							this.$notification.warn({
								key,
								message: '执行中',
								description: '等待授权交易...',
								duration: 0
							})
							// this.message('loading', '等待授权交易...')
						} else if (status === 'Failed'){
							this.confirmLoading = false
							this.$notification.error({
								key,
								message: 'error',
								description: '网络超时,请重新发起交易...',
								duration: 0
							})
							// this.message('error', '网络超时,请重新发起交易')
						}
						this.$emit('transferPolyx', listener.status)
					})
					const fees = (await this.transferPolyx.getTotalFees()).fees.total
					this.total = BigNumber.sum(fees, new BigNumber(param.amount)).toFormat(3)
					this.fees = fees.toFormat(3)
					// transferPolyx.run()
					this.showConfirm = true
					this.nextLoading = false
					this.show = false
				}
			})
		},
		async setBalance(){
			this.confirmLoading = true
			this.$notification.warn({
				key,
				message: '执行中',
				description: '正在进行交易...',
				duration: 0
			})
			// this.message('loading', '正在进行交易...')
			await this.transferPolyx.run()
		},
		message(type, content){
			const option = { content: content, key: 'transferPolyx' }
			if (type === 'loading'){
				option.duration = 0
			}
			this.$message[type](option)
		}
	}
}
</script>

<style lang="scss" scoped>
.wrapper{
	.flex{
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.transfer-info{
		.item{
			height: 48px;
			border-bottom: 2px solid rgb(235, 240, 247);
			&:last-child{
				border:none
			}
		}
	}
	.settlement{
		height: 72px;
		margin:0 -24px 30px -24px;
		background-color: rgb(235, 240, 247);
	}
}
::v-deep .ant-message{
    z-index: 10000;
}
</style>
