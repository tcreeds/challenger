const axios = require('axios')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()

const port = 8081
const webhook = process.env.WEBHOOK_URL

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.post('/challenge', urlencodedParser, (req, res) => {
	console.log("/challenge")
	console.log(req.body)
	res.send({
		text: `<@${req.body.user_id}> has issued a challenge!`,
		attachments: [
			challengeAttachment(req.body.user_id, req.body.user_name)
		]
	})
})
app.post('/reply', urlencodedParser, (req, res) => {
	console.log(req)
	const body = JSON.parse(decodeURIComponent(req.body.payload))
	console.log("/reply")
	console.log(body)
	if (body.callback_id == "reply-to-challenge"){
		const user1Split = body.actions[0].value.split(":")
		const user1 = { id: user1Split[0], name: user1Split[1] }
		const user2 = { id: body.user.id, name: body.user.name }
		res.send(replyToChallenge(user1, user2))
	}
	else if (body.callback_id == "post-match"){
		if (body.actions[0].value == "na") {
			res.send(`<@${body.user.id}> backed out`)
		}
		else {
			const split = body.actions[0].value.split(":")
			res.send({ text: `<@${split[0]}> beat <@${split[1]}>!` })
		}
	}
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

function replyToChallenge(user1, user2){
	return {
		text: `<@${user1.id}> has issued a challenge!`,
		attachments: [
			{
				text: `<@${user2.id}> accepts your challenge!`
			},
			{
				fallback: 'somethin',
				callback_id: "post-match",
				actions: [
					{
						name: "response",
						text: `${user1.name}`,
						type: "button",
						value: `${user1.id}:${user2.id}`
					},
					{
						name: "response",
						text: `${user2.name}`,
						type: "button",
						value: `${user2.id}:${user1.id}`
					},
					{
						name: "response",
						text: "Back Out",
						type: "button",
						value: "na"
					}
				]
			}
		]
	}
}

function challengeAttachment(id, name){
	return  {
		fallback: "Somethin goofed",
		callback_id: "reply-to-challenge",
		actions: [
			{
				name: "response",
				text: "Accept",
				type: "button",
				value: `${id}:${name}`
			}
		]
	}
}