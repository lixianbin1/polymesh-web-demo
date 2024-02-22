<template>
	<div class="model-tips" size="middle">
		<a-icon class="tips-bg" type="info-circle" :style="'font-size:'+bgSize+'px'" />
		<div class="weight-500 font-16 title-color mb-16">{{ title }}</div>
		<div class="font-14 text">
			<slot></slot>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ATips',
	props: {
		title: {
			type: String,
			default: '提示'
		},
		bgSize: {
			type: Number,
			default: 60
		}
	}
}
</script>
<style scoped>
.model-tips{
  background: #FAFAFA;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 16px 24px;
  border-radius: 4px;
  margin-top: 10px;
  position: relative;
  overflow:hidden
}
.tips-bg{
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  color: #cccc;
}
.text{
	color: #000;
	opacity: 0.45;
	line-height:20px;
	position:relative;
	z-index: 1;
}
</style>
