
var SlackHandler = require('./app/SlackHandler')


exports.handler = (event, context, callback) => { new SlackHandler().handle(event, context, callback) }