<template>
	<a-row>
		<a-col :span="24">
			<div class="font-16">服务提供商市场</div>
			<div class="model-tips">
				<div class="weight-500 title-color mb-16">服务提供商市场是一个由第三方服务提供商组成的生态系统，代币发行商可以参与其中获得支持，服务范围包括KYC/AML、法律、金融、托管等。</div>
				<div class="font-14 text">稍后将提供服务提供商市场。</div>
			</div>
			<div class="mt-24">
				<a-button
					type="primary"
					@click="()=>{$emit('to-next',{progress:1})}"
				>下一步</a-button>
			</div>
		</a-col>
	</a-row>
</template>
<style scoped>
.model-tips{
  background: #FAFAFA;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 16px 24px;
  border-radius: 4px;
  margin-top: 16px;
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
