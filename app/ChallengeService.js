var AWS = require("aws-sdk")
AWS.config.update({
	region: "us-east-1"
});

export default {

    dynamo: new AWS.DynamoDB.DocumentClient(),

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

}