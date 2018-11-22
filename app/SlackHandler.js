const ChallengeService = require('./ChallengeService')

export default {
    handle(event, context, callback) {
        if (event.path.includes("challenge")){
            console.log("/challenge")
            const body = qs.parse(decodeURIComponent(event.body))
            console.log(body)
            //respond(callback, body)
            let name = ""
            if (body.text && body.text.length > 0)
                name = body.text
            this.respond(callback, {
                response_type: "in_channel",
                text: `<@${body.user_id}> has issued a challenge! <${name}>`,
                attachments: [
                    this.challengeAttachment(body.user_id, body.user_name)
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
                this.respond(callback, this.replyToChallenge(user1, user2))
            }
            else if (body.callback_id == "post-match"){
                if (body.actions[0].value == "na") {
                    this.respond(callback, `<@${body.user.id}> backed out`)
                }
                else {
                    const split = body.actions[0].value.split(":")
                    ChallengeService.saveMatch(split[0], split[1], DAte.now())
                    this.respond(callback, { text: `<@${split[0]}> beat <@${split[1]}>!` })
                }
            }
        }
    },


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
    },

    challengeAttachment(id, name){
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
    },

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