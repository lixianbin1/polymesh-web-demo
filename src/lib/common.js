/*
* 格式化Balance
* @param balanceBigNumber BigNumber
* */
const FormatBalance = balanceBigNumber => {
	let { total, free, locked } = balanceBigNumber
	total = total.toFormat(3)
	free = free.toFormat(3)
	locked = locked.toFormat(3)
	return {
		total,
		free,
		locked
	}
}
export {
	FormatBalance
}
// 获取 预定资产还剩下时间的 天 时 分 秒
export function getExpiry (date) {
	const now = new Date().getTime()
	const expiryDate = new Date(date).getTime()
	const duration = expiryDate - now
	if (duration <= 0){
		return {
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0
		}
	}
	let days = 0
	let hours = 0
	let minutes = 0
	let seconds = 0
	const oneDay = 3600 * 24 * 1000
	//
	days = Math.floor(duration / oneDay)
	hours = Math.floor((duration % oneDay) / (3600 * 1000))
	minutes = Math.floor((duration % oneDay) % (3600 * 1000) / (60 * 1000))
	seconds = Math.floor((duration % oneDay) % (3600 * 1000) % (60 * 1000) / 1000)
	return {
		days: days,
		hours: hours,
		minutes: minutes,
		seconds: seconds
	}
}
// 格式化时间
export function FormatTime(newDate = new Date()){
	if (newDate == null){
		return null
	}
	const time = new Date(newDate)
	var year = time.getFullYear()
	var Month = time.getMonth() + 1
	var day = time.getDate()
	var Hours = time.getHours()
	var Minu = time.getMinutes()
	var Secon = time.getSeconds()
	Month > 9 ? Month : Month = '0' + Month
	day > 9 ? day : day = '0' + day
	Hours > 9 ? Hours : Hours = '0' + Hours
	Minu > 9 ? Minu : Minu = '0' + Minu
	Secon > 9 ? Secon : Secon = '0' + Secon
	return year + '/' + Month + '/' + day + ' ' + Hours + ':' + Minu + ':' + Secon
}
