var qs = require('querystring')
var AWS = require("aws-sdk")
AWS.config.update({
	region: "us-east-1"
});

var dynamodb = new AWS.DynamoDB()

exports.handler = (event, context, callback) => {
    if (event.path.includes("challenge")){
    	console.log("/challenge")
    	const body = qs.parse(decodeURIComponent(event.body))
    	console.log(body)
    	//respond(callback, body)

    	respond(callback, {
    		text: `<@${body.user_id}> has issued a challenge!`,
    		attachments: [
    			challengeAttachment(body.user_id, body.user_name)
    		]
    	})
    }
    else if (event.path.includes("reply")){
    	console.log(event)
    	const body = JSON.parse(decodeURIComponent(event.body).replace("payload=", ""))
		console.log("/reply")
		console.log(body)
		if (body.callback_id == "reply-to-challenge"){
			const user1Split = body.actions[0].value.split(":")
			const user1 = { id: user1Split[0], name: user1Split[1] }
			const user2 = { id: body.user.id, name: body.user.name }
			respond(callback, replyToChallenge(user1, user2))
		}
		else if (body.callback_id == "post-match"){
			if (body.actions[0].value == "na") {
				respond(callback, `<@${body.user.id}> backed out`)
			}
			else {
				const split = body.actions[0].value.split(":")
				saveMatch(split[0], split[1])
				respond(callback, { text: `<@${split[0]}> beat <@${split[1]}>!` })
			}
		}
    }
}


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

function saveMatch(winner, loser){
	var params = {
		Item: {
			"Timestamp": {
				S: `${Date.now()}`
			}, 
			"Winner": {
				S: `${winner}`
			}, 
			"Loser": {
				S: `${loser}`
			}
		}, 
		ReturnConsumedCapacity: "TOTAL", 
		TableName: "challenger"
	};
	dynamodb.putItem(params, function(err, data) {
		console.log(err)
		console.log(data)
	})
}

function respond(callback, data){
    const response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(data),
    };
    callback(null, response)
}