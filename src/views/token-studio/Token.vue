<template>
	<div>
		<div v-if="!isNoFrame" class="box-shadow back-wrap">
			<a-icon type="arrow-left" style="color: #1890ff;" />
			<a-button class="back-btn" type="link" @click="goBackToken">返回到资产列表</a-button>
		</div>
		<a-row class="token-wrap" type="flex" :gutter="24">
			<a-col v-if="!isNoFrame" flex="200px">
				<div class="box-shadow token-menu p-24 h-100">
					<!-- <a-affix :offset-top="184"> -->
					<a-menu v-model="current" mode="vertical" class="menu">
						<a-menu-item v-for="item in tokenMenu" :key="item.name">
							<router-link :to="item.path">{{ item.title }}</router-link>
						</a-menu-item>
					</a-menu>
					<!-- </a-affix> -->
				</div>
			</a-col>
			<a-col flex="auto">
				<div class="h-100">
					<router-view></router-view>
				</div>
			</a-col>
		</a-row>
	</div>
</template>

<script>
export default {
	name: 'Token',
	data(){
		return {
			current: ['dashboard'],
			tokenManage: [
				{ name: 'dashboard', title: '资产管理' },
				{ name: 'compliance', title: '合规性' },
				{ name: 'attestations', title: '证书管理' },
				{ name: 'distribution', title: '分发' },
				{ name: 'dividends', title: '股息分红' },
				{ name: 'permissions', title: '权限管理' },
				{ name: 'agents', title: '代理管理' }
			]
		}
	},
	computed: {
		tokenMenu(){
			const ticker = this.$route.params.ticker
			return this.tokenManage.map(item => {
				item.path = `/token/${ticker}/${item.name}`
				return item
			})
		},
		isNoFrame(){
			return this.$route.meta.noFrame === true
		}
	},
	methods: {
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
.token-wrap {
  flex-wrap: nowrap;
}
.ant-menu-vertical {
  border:none;
}
.ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
  background: none;
}
.ant-menu-vertical .ant-menu-item {
  padding: 0;
  margin: 0;
}
</style>
