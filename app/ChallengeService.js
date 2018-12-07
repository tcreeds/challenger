var AWS = require("aws-sdk")
AWS.config.update({
	region: "us-east-1"
});

class ChallengeService {

    constructor(){
        this.dynamo = new AWS.DynamoDB.DocumentClient()
    }

    saveChallenge(challenger, timestamp){
        var params = {
            TableName: "challenger",
            Item: {
                "Timestamp": `${timestamp}`, 
                "Challenger": `${winner}`
            }
        }
        this.dynamo.put(params, function(err, data) {
            console.log(err)
            console.log(data)
        })
    }

    saveChallengeAccepted(challenger, responder, timestamp){
        var params = {
            TableName: "challenger",
            Item: {
                "Timestamp": `${timestamp}`, 
                "Challenger": `${challenger}`,
                "Responder": `${responder}`
            }
        }
        this.dynamo.put(params, function(err, data) {
            console.log(err)
            console.log(data)
        })
    }

    saveMatch(winner, loser, timestamp){
        var params = {
            TableName: "challenger",
            Item: {
                "Timestamp": `${timestamp}`, 
                "Winner": `${winner}`, 
                "Loser": `${loser}`
            }
        }
        this.dynamo.put(params, function(err, data) {
            console.log(err)
            console.log(data)
        })
    }

    async getMatches(){
        const params = {
            TableName: "challenger"
        }
        const result = await this.dynamo.scan(params)
            .promise().then((data) => {
                return data.Items.map((item) => {
                    return `<@${item.Winner}> beat <@${item.Loser}> on ${new Date(+item.Timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`
                })
                .sort((a,b) => (+a.Timestamp) - (+b.Timestamp))
                .reduce((acc, val) => acc + val, '')
            }).catch((err) => {
                console.log("Error")
                console.log(err)
                return {}
            })
        return result
    }

}

module.exports = ChallengeService