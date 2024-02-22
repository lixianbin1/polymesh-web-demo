import Vue from 'vue'
import {
	Badge,
	Drawer,
	Form,
	FormModel,
	Button,
	message,
	notification,
	Input,
	Modal, Space, Spin, Layout, Menu, Icon,
	Card,
	Row,
	Col,
	Select,
	Radio,
	Skeleton,
	List, Collapse, Divider,
	Switch, Checkbox, Steps, Tabs, Table, Popover, Tooltip, Pagination, Tag,
	Timeline,
	DatePicker,
	Empty,
	Descriptions,
	Affix
} from 'ant-design-vue'

const components = [
	Badge,
	Button,
	Skeleton,
	Form,
	FormModel,
	Modal,
	Drawer,
	Space,
	Spin,
	Layout,
	Menu,
	Input,
	Icon,
	Card,
	Row,
	Col,
	Select,
	Radio,
	List,
	Collapse,
	Divider,
	Switch,
	Checkbox,
	Steps,
	Tabs,
	Table,
	Popover,
	Tooltip,
	Popover,
	Pagination,
	Tag, Timeline,
	DatePicker,
	Empty,
	Descriptions,
	Affix
]
components.forEach(key => {
	Vue.use(key)
})
message.config({
	maxCount: 2
})
notification.config({
	placement: 'topRight',
	top: '64px',
	duration: null // 3
})

const notification_success = notification.success
notification.success = args => {
	const obj = {
		style: { background: '#F6FFED', border: '1px solid #B7EB8F' }
	}
	return notification_success(Object.assign(obj, args))
}
const notification_warn = notification.warn
notification.warn = args => {
	const obj = {
		style: { background: '#FFFBE6', border: '1px solid #FFE58F' }
	}
	return notification_warn(Object.assign(obj, args))
}
const notification_error = notification.error
notification.error = args => {
	const obj = {
		style: { background: '#FFF1F0', border: '1px solid #FFCCC7' }
	}
	return notification_error(Object.assign(obj, args))
}
const notification_info = notification.info
notification.info = args => {
	const obj = {
		style: { background: '#E6F7FF', border: '1px solid #91D5FF' }
	}
	return notification_info(Object.assign(obj, args))
}

Vue.prototype.$message = message
Vue.prototype.$notification = notification
Vue.prototype.$success = Modal.success
Vue.prototype.$confirm = Modal.confirm
