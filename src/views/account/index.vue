<template>
	<a-row type="flex" :gutter="[24, 24]">
		<AccountList />
		<Attestations />
	</a-row>
</template>

<script>
import AccountList from '@/views/account/accountList'
import Attestations from '@/views/account/attestations'

export default {
	name: 'Account',
	components: { AccountList, Attestations }
}
</script>

<style lang="scss" scoped>

</style>
