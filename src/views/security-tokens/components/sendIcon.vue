<template>
	<span class="custom-icon" :class="[rotate ? 'rotate' : '']">
		<img src="@/assets/vector.svg" alt="">
	</span>
</template>
<script>
export default {
	name: 'SendIcon',
	props: {
		rotate: {
			type: Boolean,
			default: false
		}
	}
}
</script>
<style lang="scss" scoped>
.custom-icon {
    display: inline-block;
    width: $font-32;
    height: $font-32;
    line-height: $font-32;
    border-radius: 50%;
    text-align: center;
    background: #E6F7FF;
	img {
		width: $font-16;
		height: $font-14;
	}
	&.rotate {
		img {
			transform: rotate(180deg);
		}
	}
}
</style>
