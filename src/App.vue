<template>
	<div id="app">
		<div v-if="$store.state.Global.loading" class="global-loading">
			<a-spin size="large" :spinning="$store.state.Global.loading"></a-spin>
		</div>
		<router-view />
	</div>
</template>
<style>
body{
    color: rgb(140, 155, 165);
}
ul,li{
    list-style: none;
    margin: 0;
    padding: 0;
}
.global-loading{
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(0,0,0,.2);
    z-index: 9999999;
    display: flex;
    justify-content: center;
    align-items: center;
}
.ant-drawer-header{
    padding: 13px 24px;
}
</style>
