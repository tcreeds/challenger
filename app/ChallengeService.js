var AWS = require("aws-sdk")
const qs = require('querystring')
const axios = require('axios')
AWS.config.update({
	region: "us-east-1"
});

class ChallengeService {

    constructor(token, stage){
        this.dynamo = new AWS.DynamoDB.DocumentClient()
        this.token = token
        this.tableName = `challenger-${stage}`
    }

    saveChallenge(challenger, timestamp){
        var params = {
            TableName: this.tableName,
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
            TableName: this.tableName,
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
            TableName: this.tableName,
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
            TableName: this.tableName
        }
        const result = await this.dynamo.scan(params)
            .promise().then((data) => {
                const allIds = data.Items.reduce((acc, item) => {
                    return (acc.includes(item.Winner) ? acc : acc.concat(item.Winner))
                            .concat((acc.includes(item.Loser) || item.Winner == item.Loser) ? [] : item.Loser)
                }, [])
                console.log("ids:")
                console.log(allIds)
                return Promise.all(allIds.map(id => this.getUserById(id))).then(values => {
                    return data.Items.map(item => {
                        return {
                            timestamp: item.Timestamp,
                            winner: values.find(v => v.id == item.Winner).name,
                            loser: values.find(v => v.id == item.Loser).name
                        }
                    })
                })
            }).then(data => {
                return data
                    .sort((a,b) => (+a.timestamp) - (+b.timestamp))
                    .map((item) => {
                        return `${item.winner} beat ${item.loser} on ${new Date(+item.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`
                    })
                    .reduce((acc, val) => acc + val, '')
            }).catch((err) => {
                console.log("Error")
                console.log(err)
                return {}
            })
        console.log(result)
        return result
    }

    async getUserById(id){
        const params = qs.stringify({
            token: this.token,
            user: id
        })
        const url = `https://slack.com/api/users.info?${params}`
        const response = await axios.get(url, params, {
            'Authorization': `Bearer ${this.token}`
        })
        return response.data.user
    }

}

module.exports = ChallengeService