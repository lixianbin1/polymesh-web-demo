<template>
	<a-layout class="main-layout">
		<a-layout-header class="layout-header">
			<a-row type="flex" justify="space-between">
				<a-col flex="1" style="overflow:hidden">
					<a-row type="flex" style="align-items: center;">
						<div class="logo">
							<router-link to="overview"><img src="../assets/logo.png" alt="polymesh" /></router-link>
						</div>
						<a-col flex="1" style="overflow:hidden">
							<a-menu :selectedKeys="current" mode="horizontal">
								<a-menu-item v-for="item in menu" :key="item.path">
									<router-link :to="item.path">{{ item.label }}</router-link>
								</a-menu-item>
							</a-menu>
						</a-col>
					</a-row>
				</a-col>
				<a-col>
					<div class="user">
						<a-space size="middle">
							<a-space>
								<a-icon class="primary-color font-18" type="user" />
								<span v-if="did" class="secondary-color">{{ did.slice(0,5) }}...{{ did.slice(-5) }}</span>
							</a-space>
							<span>{{ add.slice(0,5) }}...{{ add.slice(-5) }}</span>
							<a-tag v-if="type" color="green">Primary</a-tag>
						</a-space>
					</div>
				</a-col>
			</a-row>
		</a-layout-header>
		<a-layout-content class="layout-content">
			<InvitationTips />
			<keep-alive>
				<router-view v-if="$route.meta.keepAlive" />
			</keep-alive>
			<router-view v-if="!$route.meta.keepAlive" />
		</a-layout-content>
	</a-layout>
</template>

<script>
import InvitationTips from '@/views/components/invitationTips'
export default {
	name: 'Base',
	components: { InvitationTips },
	data(){
		return {
			// current: ['/overview'],
			did: '',
			add: this.$account.address,
			type: false,
			menu: [
				{ label: '总览', path: '/overview' },
				{ label: '资产详情', path: '/security-tokens' },
				{ label: '资产管理', path: '/token-studio' },
				{ label: '网络', path: '/network' },
				{ label: '账号管理', path: '/account' }
			]
		}
	},
	computed: {
		current(){
			const path = this.$route.matched[1].path
			if (path === '/token'){
				return ['/token-studio']
			} else {
				return path ? [path] : ['/token-studio']
			}
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler(address) {
				this.init()
			}
		},
		'$store.state.Account.update': {
			handler(up) {
				this.init()
			}
		}
	},
	mounted(){
		this.init()
	},
	methods: {
		async init(){
			this.reset()
			const identity = await this.$account.getIdentity()
			if (identity){
				this.did = identity.did
				const Secondary = await identity.getPrimaryAccount()
				if (this.$store.state.Account.address === Secondary.account.address){
					this.type = true
				}
			}
		},
		reset(){
			this.did = ''
			this.add = this.$account.address
			this.type = false
		}
	}
}
</script>

<style lang="scss" scoped>
.main-layout {
	min-width: 1100px;
}
.layout-header {
	position: fixed;
	z-index: 2;
	width: 100%;
	height: $header-height;
	line-height: $header-height;
	background: #fff;
	padding: 0 60px;
	box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.06);
	.logo {
		margin-right: 48px;
		img {
			width: 100px;
		}
	}
}
.layout-content {
	padding: 24px 60px;
	margin-top: $header-height;
	.token-menu {
		height: 100%;
		background-color: #fff;
	}
}

.ant-menu-horizontal {
	border: none;
	line-height: $header-height;
	.ant-menu-item-selected,.ant-menu-item, .ant-menu-item:hover{
		border: none
	}
}
</style>
