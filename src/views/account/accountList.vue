<template>
	<a-col :span="24">
		<div v-if="loading" class="box-shadow">
			<a-skeleton active :loading="loading" :paragraph="{ rows: 8 }" />
		</div>
		<AccountInfo v-show="!loading" />
		<div v-show="!loading" class="box-shadow">
			<a-row type="flex" justify="space-between" class="mb-24">
				<div class="font-16">您的账户</div>
				<a-space v-if="prohibit" size="middle">
					<a-button v-if="!loading" @click="$router.push('/accessControl')">权限分配</a-button>
					<a-button v-if="!loading" type="primary" @click="addSecondaryVis=true">邀请</a-button>
					<a-button v-if="!loading&&areSecondary" type="primary" @click="unfonSecondaryVis=true">解冻</a-button>
					<a-button v-if="!loading&&!areSecondary" type="danger" @click="fonSecondaryVis=true">冻结</a-button>
				</a-space>
			</a-row>
			<a-table
				:columns="[
					{title:'account',dataIndex:'account',scopedSlots: { customRender: 'account' }},
					{title:'current',dataIndex:'current',scopedSlots: { customRender: 'current' }},
					{title:'balance',dataIndex:'balances',scopedSlots: { customRender: 'balance' }},
					{title:'action',dataIndex:'action',align:'right',scopedSlots: { customRender: 'action' }}
				]"
				:showHeader="false"
				:data-source="accountList"
				:pagination="false"
				:rowKey="item => item.key"
				:customRow="holdingsRow"
				:loading="loading"
			>
				<template #account="text,r">
					<div style="margin-bottom:10px">
						<a-space class="font-16 title-color" style="margin-right:20px;">
							<a-space v-if="!r.editInput">{{ r.name }}</a-space>
							<a-input v-if="r.editInput" :ref="r.address" :style="{ width: '120px' }" size="small" :value="r.name" autofocus @change="e=>changEdit(r,e)" @pressEnter="e=>setEdit(r,e)" @blur="editBlur(r)" />
							<a-icon class="edit" type="edit" @click="openEdit(r)" />
						</a-space>
						<a-tag v-if="r.ttype=='Primary'" color="green">{{ r.ttype }}</a-tag>
						<a-tag v-if="r.ttype=='Pending'" color="orange">{{ r.ttype }}</a-tag>
					</div>
					<a-space>{{ r.address.slice(0,20)+'...'+r.address.slice(-20) }}</a-space>
				</template>
				<template #current="text,r">
					<a-icon v-if="r.address==$account.address" type="check" style="color: #1890ff" />
				</template>
				<template #balance="text,r"><span class="font-18 weight-500 title-color">{{ r.free }}</span> POLYX</template>
				<template v-if="identity" #action="text,r">
					<div>
						<a-button v-if="$account.address==r.address&&!r.ttype" type="link" size="small" style="padding:0;" @click="openSignOut(r)">退出身份</a-button>
						<a-button v-if="!r.ttype&&prohibit" type="link" size="small" style="padding:0;color:red" @click="openDelete(r)">删除</a-button>
						<a-button v-if="r.ttype=='Pending'&&prohibit" type="link" size="small" style="padding:0;color:red" @click="openCancel(r)">取消邀请</a-button>
					</div>
				</template>
			</a-table>
		</div>
		<AddSecondary :visible="addSecondaryVis" @close="addSecondaryVis=false" @update="init" />
		<DelSecondary :visible="delSecondaryVis" :apiAlice="RowObject" @close="closeDelete" @update="init" />
		<FonSecondary :visible="fonSecondaryVis" @close="fonSecondaryVis=false" @update="init" />
		<UnFonSecondary :visible="unfonSecondaryVis" @close="unfonSecondaryVis=false" @update="init" />
		<OutSecondary :visible="outSecondaryVis" @close="outSecondaryVis=false" @update="init" />
		<CancelModal :visible="invitationVis" :apiAlice="RowObject" @close="closeCancel" @update="init" />

	</a-col>
</template>

<script>
import { BigNumber } from '@polymeshassociation/polymesh-sdk'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import AccountInfo from '@/views/account/accountInfo'
import AddSecondary from '@/views/account/addSecondary'
import DelSecondary from '@/views/account/delSecondary'
import FonSecondary from '@/views/account/fonSecondary'
import UnFonSecondary from '@/views/account/unfonSecondary'
import OutSecondary from '@/views/account/outSecondary'
import CancelModal from '@/views/account/cancelInvitation'
export default {
	name: 'AccountList',
	components: { AccountInfo, AddSecondary, DelSecondary, FonSecondary, UnFonSecondary, OutSecondary, CancelModal },
	data() {
		return {
			loading: true,
			identity: null,
			accountList: [],
			addSecondaryVis: false,
			delSecondaryVis: false,
			fonSecondaryVis: false,
			unfonSecondaryVis: false,
			outSecondaryVis: false,
			invitationVis: false,
			RowObject: null,
			prohibit: false,
			areSecondary: false,
			accountName: {}
		}
	},
	watch: {
		'$store.state.Account.address': {
			handler(address) {
				this.init()
			}
		},
		'$store.state.Account.update': {
			handler(up) {
				this.init()
			}
		}
	},
	mounted() {
		this.init()
	},
	methods: {
		async init(){
			this.reset()
			const identity = await this.$account.getIdentity()
			this.identity = identity
			await this.getWeb3Name()
			if (identity){
				this.getSecondary()
				const areSecondary = await identity.areSecondaryAccountsFrozen()
				this.areSecondary = areSecondary
			} else {
				this.loading = false
				this.setAccountList([this.$account])
			}
		},
		// 获取设置账户名称
		async getWeb3Name(){
			web3Enable('polkadot-js/apps')
			const accounts = await web3Accounts()
			var object = {}; var object2 = {}
			accounts.map(item => {
				object[item.address] = item.meta.name
			})
			if (localStorage.getItem('accountName')){
				object2 = JSON.parse(localStorage.getItem('accountName'))
			}
			this.accountName = { ...object, ...object2 }
			localStorage.setItem('accountName', JSON.stringify(this.accountName))
			return Promise.resolve()
		},
		reset(){
			this.loading = true
			this.identity = null
			this.accountList = []
			this.addSecondaryVis = false
			this.delSecondaryVis = false
			this.fonSecondaryVis = false
			this.unfonSecondaryVis = false
			this.outSecondaryVis = false
			this.invitationVis = false
			this.RowObject = null
			this.prohibit = false
			this.areSecondary = false
			this.accountName = {}
		},
		// 获取主账户和辅助账户
		async getSecondary(){
			const identity = this.identity
			const Secondary = await identity.getSecondaryAccounts()
			const Primary = await identity.getPrimaryAccount()
			this.prohibit = this.$account.isEqual(Primary.account)
			Primary.account.ttype = 'Primary'
			const accountList = [Primary.account]
			Secondary.data.map(item => {
				accountList.push(item.account)
			})

			const send = await identity.authorizations.getSent()
			send.data.map(item => {
				if (item.data.type === 'JoinIdentity'){
					item.target.ttype = 'Pending'
					item.target.obj = item
					accountList.push(item.target)
				}
			})
			this.setAccountList(accountList)
			this.Secondary = Secondary
			this.Primary = Primary
		},
		setEdit(data, e){
			if (e.target.value){
				var object = JSON.parse(localStorage.getItem('accountName'))
				object[data.address] = e.target.value
				localStorage.setItem('accountName', JSON.stringify(object))
			} else {
				data.name = data.default
			}
			data.default = undefined
			data.editInput = false
		},
		changEdit(data, e){
			if (!data.default){
				data.default = data.name
			}
			data.name = e.target.value
		},
		openEdit(data){
			data.editInput = !data.editInput
			setTimeout(() => {
				this.$refs[data.address].focus()
			}, 0)
		},
		editBlur(data){
			if (data.default){
				data.name = data.default
			}
			data.default = undefined
			data.editInput = false
		},
		// 设置账户名称和余额
		async setAccountList(accountList){
			for (const i in accountList){
				accountList[i].name = this.accountName[accountList[i].address] || '未命名'
				accountList[i].editInput = false
				accountList[i].free = 0
				const accountBalance = await this.api.accountManagement.getAccountBalance({
					account: accountList[i]
				})
				accountList[i].free = new BigNumber(accountBalance.free).toFormat(3)
			}
			this.accountList = accountList
			this.loading = false
		},
		// 取消邀请
		openCancel(item){
			this.invitationVis = true
			this.RowObject = item.obj
		},
		closeCancel(){
			this.invitationVis = false
			this.RowObject = null
		},
		// 删除用户
		openDelete(item){
			this.delSecondaryVis = true
			this.RowObject = item
		},
		closeDelete(){
			this.delSecondaryVis = false
			this.RowObject = null
		},
		// 退出用户
		openSignOut(item){
			this.outSecondaryVis = true
			this.RowObject = item
		},
		closeSignOut(){
			this.outSecondaryVis = false
			this.RowObject = null
		},
		resetting(){},
		holdingsRow(record){
			if (this.$account.address === record.address){
				return {
					class: 'ant-table-current'
				}
			}
			return {}
		}
	}
}
</script>

<style scoped>
.edit{
	display: none;
  position: absolute;
  margin-top: -10px;
  margin-left: -10px;
  cursor: pointer;
  color: #1890ff;
}
/deep/.title-color:hover .edit{
	display:block
}
</style>
