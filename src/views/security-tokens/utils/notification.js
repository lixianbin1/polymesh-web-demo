// const styleObj = {
// 	display: 'flex',
// 	'justify-content': 'space-between'
// }
// if (status === 'Unapproved') {
// 	this.open({
// 		type: 'info',
// 		key: 'Unapproved',
// 		description: '请求中...'
// 	})
// }
// else if (status === 'Running') {
// 	this.open({
// 		key: 'InProgress',
// 		icon: <a-icon type='clock-circle' style='color: rgb(19, 72, 228)' />
// 	})
// }
// import { sliceHash } from './'

const hrStyle = {
	background: 'rgb(235, 240, 247)',
	height: '2px',
	margin: '16px 0'
}

export class Notification {
	constructor(vm, { message = '', icon, width = 656 }) {
		this.vm = vm
		this.$createElement = vm.$createElement
		this.message = message
		this.width = width
		this.icon = icon
		this.prevKey = ''
		this.mappingDescription = {
			'Padding': '请求中...',
			'Unapproved': '请在钱包中签署交易',
			'InProgress': '正在进行中...',
			'Succeeded': '成功'
		}
	}
	open({ type, description = '', icon, duration = null, key = 'portfolios' }) {
		if (type) {
			this.vm.$notification[type]({
				message: description,
				description: this.message,
				key,
				duration
			})
		} else {
			this.vm.$notification.open({
				message: this.message,
				description: this.mappingDescription[key],
				icon: icon || this.icon,
				duration,
				key
			})
		}
	}

	close() {
		this.vm.$notification.close(this.prevKey)
	}
	confirm({ subTitle, children }, okCallback, cancelCallback = () => {}) {
		const { width, message } = this
		const h = this.$createElement

		const confirm = this.vm.$confirm({
			title: h('div', { class: 'confirm-notification__title', style: { textAlign: 'center' }}, message),
			// centered: true,
			class: 'confirm-notification',
			centered: true,
			width,
			content: h(
				'div',
				{
					class: 'pl-24 pr-24'
				},
				[
					h('div', { class: 'sub-title mt-24' }, subTitle),
					h(
						'div',
						{ class: 'info-content mt-24' },
						children.map((vNode, index) => {
							return h(
								'a-row',
								{ class: 'info-content__wrap pt-16 pb-16', props: { type: 'flex', justify: 'space-between', gutter: [0, 32] }},
								[
									h('span', { class: 'label', style: { width: '180px' }}, vNode.label),
									h('span', { class: 'value', style: {
										overflow: 'hidden',
										'text-overflow': 'ellipsis',
										'white-space': 'nowrap' }}, vNode.value)
								],
								index !== children.length - 1 && h('div', { style: hrStyle })
							)
						})
					)
				]
			),
			onOk: () => {
				confirm.destroy()
				this.open({
					type: 'warn',
					description: '执行中',
					duration: 0
				})
				okCallback()
			},
			onCancel: cancelCallback,
			cancelText: '取消',
			okText: '确认',
			okButtonProps: {
				type: 'primary'
			},
			cancelButtonProps: {
				type: 'default'
			}
		})
	}
	async run(queue, callback) {
		try {
			queue.onStatusChange(res => {
				const { status } = res
				if (status === 'Succeeded') { // Succeeded
					this.open({
						type: 'success',
						description: '执行成功'
					})
					callback && callback()
				} 	else if (status === 'Rejected') {
					this.open({
						type: 'error',
						description: '用户取消了交易签名'
					})
					return false
				}
			})
			await queue.run()
		} catch (err) {
			console.log('run-err@@@', err)
		}
	}
}
