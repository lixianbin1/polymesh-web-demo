<template>
	<a-row>
		<a-col :span="24">
			<div class="font-20 mb-20">保留您的股票代码</div>
			<a-tips title="提示">您的股票代码将会保留60天或直到您配置股票资产。在此预定期间，任何其他人或公司都不能使用您的股票代码。</a-tips>
			<div class="mt-16 mb-8 font-16">股票代码</div>
			<a-input
				v-model="ticker" style="width: 540px;" :maxLength="12"
				placeholder="输入股票代码(最多12个字符)" @change="onChangeTicker"
			/>
			<span v-show="ticker && !isTickerAvailable"><a-icon type="close-circle" theme="filled" class="font-20" style="color:#db2c3e;margin:0 8px;" />不可用</span>
			<span v-show="ticker && isTickerAvailable"><a-icon type="check-circle" theme="filled" class="font-20" style="color:#00aa5e;margin:0 8px;" />可用</span>
			<div class="mt-16">
				<a-space
					size="middle"
					direction="vertical"
					class="token-name p-16 mb-24 primary-color"
				>
					<div>股票代码</div>
					<div class="font-36 weight-600">{{ ticker||'Ticker Symbol' }}</div>

				</a-space>
			</div>
			<div class="secondary-color">
				<a-icon type="info-circle" />
				<span> 保留股票代码需要消费 </span>
				<span class="primary-color">500POLYX</span>
			</div>
		</a-col>
		<a-col :span="24">
			<a-space class="mt-32">
				<a-button
					type="primary"
					@click="()=>{$emit('to-next',{progress:0})}"
				>上一步</a-button>
				<a-button
					:loading="loading"
					:disabled="!(ticker && isTickerAvailable)"
					type="primary" @click="onConfirmTicker"
				>确认代码</a-button>
			</a-space>
		</a-col>
	</a-row>
</template>
<script>
import ATips from '@/views/components/aTips'
export default {
	components: { 'a-tips': ATips },
	data () {
		return {
			loading: false,
			ticker: '',
			isTickerAvailable: false
		}
	},
	methods: {
		async onChangeTicker(e){
			this.ticker = e.target.value.toUpperCase()
			// 检查代码是否可用
			if (this.ticker){
				this.isTickerAvailable = await this.api.assets.isTickerAvailable({
					ticker: this.ticker
				})
			}
		},
		async onConfirmTicker(){ // 保留代码
			if (this.ticker) {
				try {
					this.loading = true
					this.$notification.warn({
						key: '1',
						message: '执行中',
						description: '正在保存股票代码...',
						duration: null,
						icon: h => h('a-icon', { attrs: { type: 'clock-circle', style: 'color: #faad14' }})
					})
					const assets = await this.api.assets.reserveTicker({
						ticker: this.ticker
					// extendPeriod: true  // 延期使用(重置为60天)，默认是保留60天
					})
					await assets.run()
					this.$notification.success({
						key: '1',
						message: '执行成功',
						description: '保存股票代码成功'
						// duration: null
					})
					this.loading = false
					this.$emit('to-next', { progress: 2, ticker: this.ticker })
				} catch (e){
					this.loading = false
					this.$notification.destroy()
					this.$message.error(e.message)
				}
			}
		}
	}
}
</script>
<style>
.token-name {
  width: 540px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
}
</style>
