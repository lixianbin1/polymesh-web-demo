import Vue from 'vue'
import VueRouter from 'vue-router'
import Base from '@/views/Base'

Vue.use(VueRouter)

const routes = [
	{
		path: '/',
		name: 'base',
		component: Base,
		redirect: '/overview',
		children: [
			{
				path: '/overview',
				name: 'Overview',
				component: () => import('../views/Overview')
			},
			{
				path: '/security-tokens',
				name: 'SecurityTokens',
				component: () => import('../views/security-tokens')
			},
			{
				path: '/token-studio',
				name: 'TokenStudio',
				component: () => import('../views/token-studio')
			},
			{
				path: '/token',
				name: 'Token',
				component: () => import('../views/token-studio/Token.vue'),
				children: [
					{
						path: ':ticker/dashboard',
						name: 'TokenDashboard',
						component: () => import('../views/token-studio/dashboard')
					},
					{
						path: ':ticker/compliance',
						name: 'TokenCompliance',
						component: () => import('../views/token-studio/compliance')
					},
					{
						path: ':ticker/attestations',
						name: 'TokenaAtestations',
						component: () => import('../views/token-studio/attestations')
					},
					{
						path: ':ticker/distribution',
						name: 'TokenDistribution',
						component: () => import('../views/token-studio/distribution')
					},
					{
						path: ':ticker/dividends',
						name: 'TokenDividends',
						component: () => import('../views/token-studio/dividends')
					},
					{
						path: ':ticker/permissions',
						name: 'TokenPermissions',
						component: () => import('../views/token-studio/permissions')
					},
					{
						path: ':ticker/agents',
						name: 'TokenAgents',
						component: () => import('../views/token-studio/agents')
					},
					{
						path: 'newToken',
						name: 'NewToken',
						meta: { noFrame: true },
						component: () => import('../views/token-studio/newToken')
					}
				]
			},
			{
				path: '/network',
				name: 'Network',
				component: () => import('../views/network')
			},
			{
				path: '/account',
				name: 'Account',
				meta: { keepAlive: true },
				component: () => import('../views/account')
			},
			{
				path: '/accessControl',
				name: 'AccessControl',
				meta: { keepAlive: true },
				component: () => import('../views/account/AccessControl')
			}
		]
	},
	{
		path: '/:catchAll(.*)',
		redirect: '/overview'
	}
]

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes
})

router.beforeEach((to, from, next) => {
	document.body.scrollTop = 0
	document.documentElement.scrollTop = 0
	window.scrollTo(0, 0)
	next()
})

export default router
