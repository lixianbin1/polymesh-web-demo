<template>
	<div class="timeline-node">
		<div class="node-list">
			<div v-for="item in nodeData.pointList" v-show="item.isShow" :key="item.distribution.uuid">
				<div v-if="item.type.code !== 'completed'" class="box-shadow node">
					<div class="top">
						<span>{{ item.distribution.description }}</span>
						<a-tag v-if="item.type.code === 'progress'" color="blue" style="height: 22px; margin-left: 10px;">进行中</a-tag>
						<a-tag v-if="item.type.code === 'expired'" color="red" style="height: 22px; margin-left: 10px;">已过期</a-tag>
					</div>
					<div class="secondary-color p-16">
						<div>申报时间：{{ item.distribution.declarationDate.toLocaleString() }}</div>
						<div>支付时间：{{ item.distribution.paymentDate.toLocaleString() }}</div>
						<div>过期时间：{{ item.distribution.expiryDate?item.distribution.expiryDate.toLocaleString():'无期' }}</div>
					</div>
					<div class="pl-16 pr-16">
						<div class="secondary-color">支付的股息</div>
						<div style="color: #1890FF">{{ parseFloat(item.distribution?.maxAmount.toString()) -
							parseFloat(item.details?.remainingFunds?.toString())
						}}  {{ item.distribution.currency }}</div>
						<div class="secondary-color">/ {{ item.distribution?.maxAmount.toString() + ' ' + item.distribution.currency }}</div>
					</div>
					<div class="bottom mt-16">
						<a-button type="primary" size="small" style="margin-top:4px;" @click="showDetail(item)">查看详细信息</a-button>
					</div>
				</div>
			</div>
			<div class="box-shadow node new-add" @click="addInterestSettlement">
				<div class="font-30">+</div>
				<p class="secondary-color">创建股息分红</p>
			</div>
		</div>
		<div class="node-list">
			<div v-for="item in nodeData.pointList" v-show="item.isShow" :key="item.distribution.uuid">
				<div v-if="item.type.code === 'completed'" class="box-shadow node">
					<div class="top">
						<span>{{ item.distribution.description }}</span>
						<a-tag color="green" style="height: 22px; margin-left: 10px;">已完成</a-tag>
					</div>
					<div class="secondary-color p-16">
						<div>申报时间：{{ item.distribution.declarationDate.toLocaleString() }}</div>
						<div>支付时间：{{ item.distribution.paymentDate.toLocaleString() }}</div>
						<div>过期时间：{{ item.distribution.expiryDate?item.distribution.expiryDate.toLocaleString():'无期' }}</div>
					</div>
					<div class="pl-16 pr-16">
						<div class="secondary-color">支付的股息</div>
						<div style="color: #1890FF">{{ parseFloat(item.distribution?.maxAmount.toString()) -
							parseFloat(item.details?.remainingFunds?.toString())
						}}  {{ item.distribution.currency }}</div>
						<div class="secondary-color">/ {{ item.distribution?.maxAmount.toString() + ' ' + item.distribution.currency }}</div>
					</div>
					<div class="bottom mt-16">
						<a-button type="primary" size="small" style="margin-top:4px;" @click="showDetail(item)">查看详细信息</a-button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
export default {
	props: {
		shotList: {
			type: Object,
			default: () => { }
		},
		assets: {
			type: Object,
			default: () => { }
		}
	},
	data() {
		return {
			nodeData: {},
			detailObj: {}
		}
	},
	watch: {
		shotList: {
			deep: true,
			immediate: true,
			handler(obj) {
				this.nodeData = obj
			}
		}
	},
	methods: {
		async showDetail(obj) {
			obj.createdAt = this.nodeData.createdAt
			console.log(obj)
			window.dd = obj
			this.$emit('to-detail', obj)
		},
		addInterestSettlement() { // 结息
			this.$emit('add-interest-settlement', this.nodeData)
		},
		async getaaa(id) {
			try {
				const distributions = this.assets.corporateActions.distributions
				console.log('aa:', distributions)
				// const bb = await distributions.get()
				const detailObj = await distributions.getOne({
					id
				})
				this.detailObj = detailObj
				console.log('bb:', id.toString(), detailObj)
			} catch (e) {
				this.detailObj = null
				console.log('没有进行股息分配', id.toString())
			}
		}
	}
}
</script>
<style scoped lang="scss">

.timeline-node{
  .node-list{
    display: flex;
    flex-flow: row wrap;
  }
    .node{
    width: 250px;
		min-height: 280px;
    padding:0px;
    margin:10px;
    .top{
      display: flex;
      justify-content: space-between;
      background-color:#fafafa;
      padding:12px;
    }
    .bottom{
      height:50px;
      display: flex;
      border-top: 1px solid #F0F0F0;
      justify-content: center;
      align-items: center;
    }

  }

  .new-add{
    background: #FAFAFA;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

}
</style>
