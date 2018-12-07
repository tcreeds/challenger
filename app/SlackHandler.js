const ChallengeService = require('./ChallengeService')
var qs = require('querystring')

class SlackHandler {
    handle(event, context, callback) {
        this.challengeService = new ChallengeService(process.env.BOT_TOKEN, process.env.STAGE)
        if (event.path.includes("list-challenges")){
            console.log("/list-challenges")
            const body = qs.parse(decodeURIComponent(event.body))
            this.challengeService.getMatches().then(matches => {
                this.respond(callback, {
                    response_type: "in_channel",
                    text: matches
                })
            })
            
        }
        else if (event.path.includes("challenge")){
            console.log("/challenge")
            const body = qs.parse(decodeURIComponent(event.body))
            this.respond(callback, {
                response_type: "in_channel",
                text: `<@${body.user_id}> has issued a challenge!`,
                attachments: [
                    this.challengeAttachment(body.user_id, body.user_name)
                ]
            })
        }
        else if (event.path.includes("reply")){
            console.log("/reply")
            const body = JSON.parse(decodeURIComponent(event.body).replace("payload=", ""))
            if (body.callback_id == "reply-to-challenge"){
                const user1Split = body.actions[0].value.split(":")
                const user1 = { id: user1Split[0], name: user1Split[1] }
                const user2 = { id: body.user.id, name: body.user.name }
                this.respond(callback, this.replyToChallenge(user1, user2))
            }
            else if (body.callback_id == "post-match"){
                if (body.actions[0].value == "na") {
                    this.respond(callback, `<@${body.user.id}> backed out`)
                }
                else {
                    const split = body.actions[0].value.split(":")
                    this.challengeService.saveMatch(split[0], split[1], Date.now())
                    this.respond(callback, { text: `<@${split[0]}> beat <@${split[1]}>!` })
                }
            }
        }
    }


    replyToChallenge(user1, user2){
        return {
            text: `<@${user1.id}> has issued a challenge!`,
            attachments: [
                {
                    text: `<@${user2.id}> accepts your challenge! <@${user1.id}>, prepare for battle!`
                },
                {
                    text: "Who won???",
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

    challengeAttachment(id, name, target){
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

    respond(callback, data){
        const response = {
            statusCode: 200,
            headers: {
            'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(data),
        };
        callback(null, response)
    }

}

module.exports = SlackHandler