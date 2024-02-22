<template>
	<a-row>
		<a-col :span="24">
			<div class="font-20 mb-20">配置您的股票</div>
			<a-tips title="提示">配置股票不是您的安全令牌产品（STO）。这是设置股票细节的过程。请咨询您的法律和财务顾问，了解适用于您的股票的法规。</a-tips>
			<div class="mt-16 font-16">股票详情</div>
			<div class="mt-16">
				<a-space
					size="middle"
					direction="vertical"
					class="token-name p-16 mb-24 primary-color"
				>
					<div class="font-16">您的股票代码</div>
					<div class="font-36 weight-600">{{ ticker }}</div>
				</a-space>
			</div>

			<div class="mb-8">股票名称</div>
			<a-input
				v-model="name"
				style="width: 540px;"
			/>
			<div class="mt-16 mb-8">股票类型</div>
			<a-select
				v-model="assetType" style="width:540px;" placeholder="请选择资产类型" @change="onChangeAssetType"
			>
				<a-select-option v-for="item in assetTypeList" :key="item.value" :value="item.value">{{ item.label }}
				</a-select-option>
			</a-select>
			<a-input v-show="assetType === 'Custom'" v-model="assetTypeCustom" class="input-field" placeholder="输入自定义类型" style="margin-left:10px; width: 540px;"></a-input>
			<div class="mt-16 mb-8">需求投资者唯一性声明</div>
			<a-switch v-model="requireInvestorUniqueness" />
			<div class="mt-16 mb-8">资产声明（可选）</div>
			<a-select
				v-model="securityIdentifierType" style="width: 120px;width:540px;" @change="onChangeSecurityIdentifierType"
			>
				<a-select-option v-for="item in securityIdentifierTypeList" :key="item.value" :value="item.value">{{ item.label }}
				</a-select-option>
			</a-select>
			<a-input v-show="securityIdentifierType" v-model="securityIdentifierValue" class="input-field" placeholder="输入ID" style="width: 278px;margin-left:10px;"></a-input>
			<div class="mt-16 mb-8">指定资金轮次（可选）</div>
			<a-select
				v-model="fundingRound" style="width: 120px;width:540px;" @change="onChangeFundingRound"
			>
				<a-select-option v-for="item in fundingRoundList" :key="item.value" :value="item.value">{{ item.label }}
				</a-select-option>
			</a-select>
			<a-input v-show="fundingRound === 'Other'" v-model="fundingRoundOther" class="input-field" placeholder="输入资金轮次" style="margin-top:10px;"></a-input>
			<div class="mt-16 mb-8">初始资金（可选）</div>
			<a-input v-model="initialSupply" placeholder="输入初始资金" style="width: 540px;"></a-input>
			<span class="weight-600 font-20" style="margin-left: 10px;">{{ ticker }}</span>
			<div class="mt-16 mb-8">资金可分割性</div>
			<a-radio-group v-model="isDivisible" size="large">
				<a-radio style="display:block;" :value="false">不可分割</a-radio>
				<a-radio style="display:block;marginTop:10px;" :value="true">可分割</a-radio>
			</a-radio-group>
		</a-col>

		<a-col :span="24">
			<a-space class="mt-24">
				<a-button
					type="primary"
					:loading="loading" @click="onConfirmConfig"
				>确认配置</a-button>
			</a-space>
		</a-col>
	</a-row>
</template>
<script>
import { BigNumber } from '@polymeshassociation/polymesh-sdk'
import ATips from '@/views/components/aTips'
export default {
	components: { 'a-tips': ATips },
	props: {
		ticker: {
			type: String,
			default: ''
		}
	},
	data () {
		return {
			loading: false,
			name: '',
			assetType: '',
			assetTypeCustom: '',
			requireInvestorUniqueness: false,
			isDivisible: true,
			fundingRound: '',
			initialSupply: 0,
			fundingRoundOther: '',
			securityIdentifierValue: '',
			securityIdentifierType: undefined,
			list: [
				{ value: 'a', desc: 'aa' }
			],
			assetTypeList: [
				{ label: '普通股票 Equity Common', value: 'EquityCommon' },
				{ label: '股权优先 Equity Preferred', value: 'EquityPreferred' },
				{ label: '商品 Commodity', value: 'Commodity' },
				{ label: '固收 Fixed Income', value: 'FixedIncome' },
				{ label: '信托基金 Reit', value: 'Reit' },
				{ label: '基金 Fund', value: 'Fund' },
				{ label: '收入分成协议 Revenue Share greement', value: 'RevenueShareAgreement' },
				{ label: '结构化产品 Structured Product', value: 'StructuredProduct' },
				{ label: '衍生物 Derivative', value: 'Derivative' },
				{ label: '稳定币 StableCoin', value: 'StableCoin' },
				{ label: '自定义 Custom', value: 'Custom' }
			],
			securityIdentifierTypeList: [
				{ label: '无', value: '' },
				{ label: 'ISIN', value: 'Isin' },
				{ label: 'CUSIP', value: 'Cusip' },
				{ label: 'CINS', value: 'Cins' },
				{ label: 'LEI', value: 'Lei' },
				{ label: 'FIGI', value: 'Figi' }
			],
			fundingRoundList: [
				{ label: '选择一个轮次', value: '' },
				{ label: '天使轮 Angel', value: 'Angel' },
				{ label: 'Pre种子轮 Pre-Seed', value: 'Pre-Seed' },
				{ label: '种子轮 Seed', value: 'Seed' },
				{ label: '创投 Venture - Series Unknown', value: 'Venture' },
				{ label: 'A轮 Series A', value: 'Series A' },
				{ label: 'B轮 Series B', value: 'Series B' },
				{ label: 'C轮 Series C', value: 'Series C' },
				{ label: '股权众筹 Equity Crowdfunding', value: 'Equity Crowdfunding' },
				{ label: '私募基金 Private Equity', value: 'Private Equity' },
				{ label: '可转债 Convertible Note', value: 'Convertible Note' },
				{ label: '债务融资 Debt Financing', value: 'Debt Financing' },
				{ label: '其他 Other', value: 'Other' }
			]
		}
	},
	methods: {
		async onConfirmConfig(){
			const data = {
				assetType: this.assetType === 'Custom' ? this.assetTypeCustom : this.assetType,
				documents: [], // 资产文件 optional
				fundingRound: this.fundingRound === 'Other' ? this.fundingRoundOther : this.fundingRound,
				initialStatistics: [], // 初始统计 optional
				initialSupply: new BigNumber(this.initialSupply),
				isDivisible: this.isDivisible,
				name: this.name,
				requireInvestorUniqueness: this.requireInvestorUniqueness,
				securityIdentifiers: this.securityIdentifierType ? [{ type: this.securityIdentifierType, value: this.securityIdentifierValue }] : [],
				ticker: this.ticker
			}
			if (!data.name){
				return this.$message.error('请输入股票名称')
			}
			if (!data.assetType){
				return this.$message.error('请选择股票类型')
			}
			try {
				this.loading = true
				this.$notification.warn({
					key: '1',
					message: '执行中',
					description: '正在创建资产...',
					duration: null
					// icon: h => h('a-icon', { attrs: { type: 'clock-circle', style: 'color: #faad14' }})
				})
				const creationQ = await this.api.assets.createAsset(data)
				await creationQ.run()
				this.$notification.success({
					key: '1',
					message: '执行成功',
					description: '创建资产成功'
					// duration: null
				})
				this.$router.push('/token-studio')
				this.loading = false
			} catch (e){
				this.$notification.destroy()
				this.$notification.success({
					key: '1',
					message: '执行失败',
					description: '创建资产失败',
					duration: e.message
				})
				this.loading = false
			}
		},
		onChangeAssetType(e){
			if (e !== 'Custom') {
				this.assetTypeCustom = ''
			}
		},
		onChangeSecurityIdentifierType(e){
			if (e === '') {
				this.securityIdentifierValue = ''
			}
		},
		onChangeFundingRound(e){
			if (e !== 'Other'){
				this.fundingRoundOther = ''
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
