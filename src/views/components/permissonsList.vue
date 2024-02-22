<template>
	<div>
		<!-- <a-spin :spinning="spinning"> -->
		<a-skeleton :active="true" :loading="spinning"></a-skeleton>
		<div v-if="!spinning">
			<template v-for="(item, index) in myTxTags">
				<div v-if="item[2]" :key="index" class="module-outer">
					<div class="module-name font-16 p-16">{{ item[0] }}</div>
					<div class="module-value">
						<template v-for="(li, lia) in item[1]">
							<span
								v-if="li.checked"
								:key="lia"
								class="module-item m-16 font-16"
							>
								<slot></slot>
								<a-tooltip placement="topLeft" :title="li.key">{{ li.key }}</a-tooltip>
							</span>
						</template>
					</div>
				</div>
			</template>
		</div>
		<!-- </a-spin> -->
	</div>
</template>
<script>
export default {
	// 权限显示列表组件
	props: {
		myTxTags: {
			type: Array,
			default: () => {
				return []
			}
		}
	},
	data() {
		return {
			spinning: false
		}
	},
	mounted() {
		this.spinning = true
		setTimeout(() => {
			this.spinning = false
		}, 500)
	}
}
</script>
<style lang="scss">
.module-item {
  position: relative;
  padding-left: 15px;
  width: calc( ( 100% / 3 ) - 32px );
  flex: 0 0 auto;
  overflow:hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.module-item::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  position: absolute;
  left: 0;
  top: 50%;
}

.module-outer:last-child {
  border-bottom: 1px solid #f0f0f0;
}
.module-outer {
  display: flex;
  border-top: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
  border-left: 1px solid #f0f0f0;
  .module-name {
    flex: 0 0 auto;
    background: #fafafa;
    width: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-right: 1px solid #f0f0f0;
    word-break: break-all;
  }
  .module-value {
    display: flex;
    flex-wrap: wrap;
    width: calc(100% - 200px);
  }
}
</style>
