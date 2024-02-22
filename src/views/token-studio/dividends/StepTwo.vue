<template>
	<div>
		<a-row>
			<a-col
				:span="24"
				class="mt-24 mb-16"
			>
				<div>管理预扣税</div>
			</a-col>
			<a-col :span="6">
				<div class="secondary-color">资产持有者</div>
				<p class="mt-8">{{ statisticsObj.tokenholders }}</p>
			</a-col>
			<a-col :span="6">
				<div class="secondary-color">选择分红的持有者</div>
				<p class="mt-8">{{ statisticsObj.tokenholders - statisticsObj.excludedTokenholders }}</p>
			</a-col>
			<a-col v-show="progress===1" :span="6">
				<div class="secondary-color">代扣税款的持有者</div>
				<p class="mt-8">{{ statisticsObj.taxesWithheld }}</p>
			</a-col>
			<a-table
				:columns="columns" :data-source="data" :rowKey="(record, index) => { return index }"
				:pagination="isPagination"
			>
				<template slot="taxWitholding" slot-scope="text, record">
					<a-input
						style="margin: -5px 0" :value="text"
						@change="e => handleChange(e.target.value, record.key, record)"
					/>
				</template>
			</a-table>
			<a-space class="mt-16">
				<a-button @click="continueFun(false)">返回</a-button>
				<a-button type="primary" @click="continueFun(true)">下一步</a-button>
			</a-space>
		</a-row>
	</div>
</template>
<script>
export default {
	props: {
		isInterest: {
			type: String,
			default: ''
		},
		stepOneResult: {
			type: Array,
			default: () => []
		},
		statisticsObj: {
			type: Object,
			default: () => {}
		},
		progress: {
			type: Number,
			default: 0
		}
	},
	data(){
		return {
			val: '',
			isPagination: false,
			data: [],
			columns: [
				{
					title: '选择分红账户',
					dataIndex: 'did',
					key: 'did'
				},
				{
					title: '配置税率（%）',
					dataIndex: 'taxWitholding',
					key: 'taxWitholding',
					scopedSlots: { customRender: 'taxWitholding' }
				}
			]
		}
	},
	watch: {
		stepOneResult: {
			deep: true,
			immediate: true,
			handler(arr) {
				this.data = [...arr]
				console.log(this.data)
				// let flag = 0
				this.data.forEach(item => {
					// console.log(item.taxWitholding)
					if (item.taxWitholding > 0){
						this.$emit('edit-step-one-result', { value: item.taxWitholding, record: item })
					}
				})
				// console.log(flag)
			}
		}
	},
	methods: {
		// 子数据保存
		handleChange(value, key, record) {
			console.log('******:', value, record)
			this.$emit('edit-step-one-result', { value, record })
		},
		continueFun(bool) {
			this.$emit('to-next', { bool })
		}
	}

}
</script>
