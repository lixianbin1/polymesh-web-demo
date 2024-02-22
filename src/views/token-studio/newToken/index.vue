<template>
	<div>
		<div class="box-shadow back-wrap">
			<a-icon
				type="arrow-left"
				style="color: #1890ff;"
			/>
			<a-button
				class="back-btn"
				type="link"
				@click="goBackToken"
			>返回到资产列表</a-button>
		</div>
		<a-row :gutter="24">
			<a-col :span="24">
				<a-row class="box-shadow" type="flex" justify="center">
					<a-col :span="16" style="margin-bottom: 56px;">
						<a-steps
							progress-dot
							:current="progress"
						>
							<a-step title="服务提供商市场" />
							<a-step title="保留股票代码" />
							<a-step title="配置资产" />
						</a-steps>
					</a-col>
					<a-col :span="24">
						<createTokenOne v-show="progress===0" @to-next="toNext"></createTokenOne>
						<createTokenTwo v-show="progress===1" @to-next="toNext"></createTokenTwo>
						<createTokenThree v-show="progress===2" :ticker="ticker" @to-next="toNext"></createTokenThree>
					</a-col>
				</a-row>
			</a-col>
		</a-row>
	</div>
</template>
<script>
import createTokenOne from './createTokenOne.vue'
import createTokenTwo from './createTokenTwo.vue'
import createTokenThree from './createTokenThree.vue'
export default {
	components: { createTokenOne, createTokenTwo, createTokenThree },
	data(){
		return {
			progress: 0,
			ticker: ''
		}
	},
	mounted(){
		const ticker = this.$route.query.ticker
		console.log(ticker, this.progress)
		if (ticker){
			this.ticker = ticker
			this.progress = 2
		} else {
			this.ticker = ''
			this.progress = 0
		}
	},
	methods: {
		toNext({ progress, ticker }){
			this.progress = progress
			if (ticker){
				this.ticker = ticker
			}
		},
		goBackToken(){
			this.$router.replace('/token-studio')
		}
	}
}
</script>
<style lang="scss" scoped>
.back-wrap {
  padding: 16px 24px;
  margin-bottom: 24px;
  .back-btn {
    height: auto;
    line-height: 1;
    padding: 0 8px;
  }
}
</style>
