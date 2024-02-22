<template>
	<a-modal
		title="控股资产详情"
		:visible="show"
		okText="确定"
		:width="648"
		:closable="false"
		class="holding-details"
	>
		<div class="symbol"><span>股票代码</span><p>{{ detail.asset?.ticker }}</p></div>
		<div class="holdings">
			<div class="holdings-icon">
				<a-icon type="audit" />
			</div>
			<div class="holdings-total">
				<span>拥有股份</span>
				<p>{{ detail.balances?.format?.total }}<span>{{ detail.asset?.ticker }}</span></p>
			</div>
		</div>
		<div class="holdings-info">
			<ul>
				<li>
					<span class="label">交易事件编号</span>
					<span class="text text-tag">
						<a-tag color="blue">{{ detail.id }}</a-tag>
						<a :href="`https://polymesh-testnet.subscan.io/extrinsic/${detail.blockNumber}-1?event=${detail.id}`" target="_blank">
							<a-icon class="tag-icon" type="select" />
						</a>
					</span>
				</li>
				<li>
					<span class="label">安全令牌名称</span>
					<span class="text">{{ detail.details?.name }}</span>
				</li>
				<li>
					<span class="label">融资轮次</span>
					<span class="text">{{ detail.round }}</span>
				</li>
				<li>
					<span class="label">投资者的独特性要求</span>
					<span class="text">{{ detail.details?.requiresInvestorUniqueness?'是':'无要求' }}</span>
				</li>
				<li>
					<span class="label">是否可分割交易</span>
					<span class="text">{{ detail.details?.isDivisible?'可分割':'不可分割' }}</span>
				</li>
			</ul>
		</div>
		<template #footer>
			<a-button type="primary" @click="ok">确定</a-button>
		</template>
	</a-modal>
</template>

<script>
export default {
	name: 'HoldingsDetails',
	props: {
		show: {
			type: Boolean,
			default(){
				return false
			}
		},
		detail: {
			type: Object,
			default(){
				return {

				}
			}
		}
	},
	data(){
		return {}
	},
	mounted(){

	},
	methods: {
		ok(){
			this.$emit('ok')
		}
	}
}
</script>

<style lang="scss" scoped>
.holding-details{
    p{
        margin: 0;
    }
    .symbol{
        width: 400px;
        margin-bottom: 16px;
        padding: 16px;
        border-radius: 8px;
        background-color: rgb(235, 240, 247);
        span{
            font-size: $font-14;
            color: rgb(108, 125, 137);
            overflow-wrap: break-word;
        }
        p{
            font-size: $font-34;
            font-weight: 500;
            letter-spacing: -0.25px;
            color: rgb(21, 41, 53);
        }
    }
    .holdings{
        display: flex;
        align-items: center;
        .holdings-icon{
            width: 48px;
            height: 48px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 99px;
            color: rgb(19, 72, 228);
            background-color: rgb(220, 239, 254);
            font-size: $font-20;
        }
        .holdings-total{
            display: flex;
            flex-direction: column;
            margin-left: 20px;
            & > span{
                font-size: $font-16;
                color: rgb(108, 125, 137);
            }
            p{
                font-size: $font-20;
                color: rgb(21, 41, 53);
            }
        }
    }
    .holdings-info{
        margin: 30px 0;
        ul{
            li{
                height: 48px;
                font-size: $font-16;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid rgb(235, 240, 247);
                .label{
                    color: rgb(108, 125, 137);
                }
                .text-tag{
                    display: flex;
                    align-items: center;
                    .tag-icon{
                        margin-top: 3px;
                        color: rgb(108, 125, 137);
                        transform: rotateY(180deg);
                    }
                    .tag-icon:hover{
                        opacity: .8;
                    }
                }
            }
        }
    }
}
</style>
