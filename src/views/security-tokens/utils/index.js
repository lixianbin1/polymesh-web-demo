import moment from 'moment'
import { Notification } from './notification'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import { BigNumber } from '@polymeshassociation/polymesh-sdk'

export function getNotification(vm, options) {
	return new Notification(vm, options)
}

export async function getSigningIdentity(api) {
	return await api.getSigningIdentity()
}

export async function getPortfolios(api) {
	return await (await getSigningIdentity(api)).portfolios.getPortfolios()
}

// 获取此身份托管的所有投资组合
export async function getCustodiedPortfolios(api) {
	const identity = await getSigningIdentity(api)
	return (await identity.portfolios.getCustodiedPortfolios()).data.map(portfolio => (portfolio.isCustodiedPortfolio = true))
}

export async function formatterPortfolios(portfolios) {
	portfolios = portfolios || []
	const portfolioArr = []
	for (const portfolio of portfolios) {
		// 是否为投资组合托管人
		const isCustodiedBy = await portfolio.isCustodiedBy()
		const balances = await portfolio.getAssetBalances()
		const portfolioType = portfolio.constructor.name
		const temp = {}
		if (portfolioType === 'DefaultPortfolio') {
			temp.name = '未分配投资组合'
			temp.createdAt = null
		} else {
			temp.name = await portfolio.getName()
			const createdAt = await portfolio.createdAt()
			temp.createdAt = createdAt && moment(createdAt.blockDate.getTime()).format('YYYY-MM-DD')
			temp.id = portfolio.id
		}
		temp.portfolioType = portfolioType
		temp.uuid = portfolio.uuid
		temp.portfolio = portfolio
		temp.balances = balances.filter(balance => balance.total.toNumber())
		temp.isCustodiedBy = isCustodiedBy
		portfolioArr.push(temp)
	}
	return portfolioArr
}

// 处理组合数据
export async function getAssets(api, portfolios) {
	// 数据转换, 根据所有投资组合获取控股资产
	const allBalance = portfolios.filter(portfolio => portfolio.balances.length).reduce((initial, currentValue) => {
		return initial.concat(currentValue.balances)
	}, [])
	const tickers = allBalance.reduce((initial, currentValue) => {
		const ticker = currentValue.asset.ticker
		if (ticker in initial) {
			initial[ticker] += currentValue.total.toNumber()
		} else {
			initial[ticker] = currentValue.total.toNumber()
		}

		return initial
	}, {})
	const assets = []
	for (const ticker in tickers) {
		try {
			const asset = await api.assets.getAsset({ ticker })
			// 检索资产标识符列表
			// const identifiers = await balance.getIdentifiers()
			// 检索此资产的操作历史
			// const operationHistory = await asset.getOperationHistory()
			const createdAt = await asset.createdAt()
			// 检索资产的融资轮
			const currentFundingRound = await asset.currentFundingRound()
			// 处理所有资产提供相关功能
			// const offerings = await balance.offerings.get()
			// fullAgents -- 全部代理
			const { name, assetType, requiresInvestorUniqueness, isDivisible } = await asset.details()
			// const tickerReservationDetails = await tickerReservation.details()
			// 获取固定资产
			// const heldAssets = await details.owner.getHeldAssets()
			// 获取托管资产
			// const trustingAssets = await details.owner.getTrustingAssets()
			assets.push({
				ticker,
				name,
				assetType,
				balance: new BigNumber(tickers[ticker]),
				currentFundingRound,
				requiresInvestorUniqueness,
				isDivisible,
				asset,
				createdAt,
				blockNumber: createdAt && createdAt.blockNumber.toNumber(),
				eventIndex: createdAt && createdAt.eventIndex.toNumber()
			})
		} catch (err) {
			console.log('getAssets@@@', err && err.message)
		}
	}
	return assets.filter(asset => asset.balance.toNumber())
}

export function sliceHash(hash, number = 6) {
	if (hash) {
		const preFix = hash.slice(0, number)
		const postFix = hash.slice(hash.length - number, hash.length)
		return `${preFix}...${postFix}`
	}
	return ''
}

export async function getWeb3Accounts() {
	web3Enable('polkadot-js/apps')
	const webAccounts = await web3Accounts()
	const accountNames = {}
	const accounts = webAccounts.map(item => {
		accountNames[item.address] = item.meta.name
		return {
			address: item.address,
			sliceAddress: sliceHash(item.address, 11),
			name: item.meta.name
		}
	})
	return [accounts, accountNames]
}
