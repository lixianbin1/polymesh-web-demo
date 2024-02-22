<template>
	<div>
		<a-row>
			<a-col
				:span="24"
				class="mt-24 mb-16"
			>
				<div>分红排除人员列表</div>
			</a-col>
			<a-col :span="6">
				<div class="secondary-color">资产持有者</div>
				<p class="mt-8">{{ statisticsObj.tokenholders }}</p>
			</a-col>
			<a-col :span="6">
				<div class="secondary-color">排除持有者</div>
				<p class="mt-8">{{ statisticsObj.excludedTokenholders }}</p>
			</a-col>
			<!-- <a-col v-show="progress===1" :span="6">
				<div class="secondary-color">代扣税款的持有者数量</div>
				<p class="mt-8">{{ statisticsObj.taxesWithheld }}</p>
			</a-col> -->
			<!-- <a-col v-show="progress===2" :span="6">
				<div class="secondary-color">收到股息的代币持有人</div>
				<p class="mt-8">{{ statisticsObj.tokenholders }}</p>
			</a-col> -->
			<a-table
				:row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange,getCheckboxProps:getCheckboxProps}" :columns="columns"
				:data-source="data" :rowKey="(record, index) => { return index }" :pagination="isPagination"
			>
				<template slot="did" slot-scope="text, record">
					<div style="position:relative;">
						<span>{{ record.did }}</span>
						<div style="position: absolute;right: 60px;top: 0px;">
							<a-tag v-if="record.isSign" color="#87d068">  Distribution Agent </a-tag>
							<a-tag v-if="record.isAgent" color="#87d068"> CAA </a-tag>
						</div>
					</div>
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
		holdList: {
			type: Array,
			default: () => []
		},
		isInterest: {
			type: String,
			default: ''
		},
		progress: {
			type: Number,
			default: 0
		}
	},

	data(){
		return {
			isPagination: false,
			columns: [
				{
					title: '排除分红账户ID',
					dataIndex: 'did',
					scopedSlots: { customRender: 'did' }
				}
			],
			data: [],
			selectedRowKeys: [3, 4]
		}
	},
	computed: {
		statisticsObj() {
			return {
				taxesWithheld: 0,
				allTokens: this.data.length,
				// tokenholders: (this.data.length - this.selectedRowKeys.length),
				tokenholders: (this.data.length),
				excludedTokenholders: this.selectedRowKeys.length
			}
		}
	},
	watch: {
		holdList: {
			deep: true,
			immediate: true,
			handler(arr) {
				this.data = arr
				this.selectedRowKeys = []
				arr.forEach((item, index) => {
					if ((item.isAgent || item.isSign) && this.selectedRowKeys.indexOf(index) === -1){
						this.selectedRowKeys.push(index)
					}
				})
			}
		},
		isInterest(){
			this.selectedRowKeys = []
			this.holdList.forEach((item, index) => {
				if ((item.isAgent || item.isSign) && this.selectedRowKeys.indexOf(index) === -1){
					this.selectedRowKeys.push(index)
				}
			})
			// this.selectedRowKeys = [3, 4]
		}
	},
	methods: {
		continueFun(bool) {
			console.log('aaa')
			this.$emit('to-next', { bool, selectArr: this.selectedRowKeys, statisticsObj: this.statisticsObj })
		},
		onSelectChange(selectedRowKeys) {
			console.log(selectedRowKeys)
			this.selectedRowKeys = selectedRowKeys
		},
		getCheckboxProps: record => ({
			props: {
				disabled: record.isSign || record.isAgent, // Column configuration not to be checked
				did: record.did
			}
		})
	}
}
</script>
