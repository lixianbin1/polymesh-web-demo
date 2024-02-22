import Vue from 'vue'
import { Account } from '@polymeshassociation/polymesh-sdk/internal'

const setAccount = (address, context) => {
	Vue.prototype.$account = new Account({ address }, context)
}
export {
	setAccount
}
