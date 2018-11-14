const axios = require('axios')

const webhook = process.env.WEBHOOK_URL

axios.post(webhook, {
	text: "testing, testing, 1 2 3"
}).then(res => console.log(res)).catch(err => console.log(err))
