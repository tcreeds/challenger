const ChallengeService = require('./app/ChallengeService')

challengeService = new ChallengeService(process.env.BOT_TOKEN)

challengeService.getMatches().then(matches => console.log(matches))