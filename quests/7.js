/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}}} param1
 */
const { metrics } = require('../utils/metrics')
module.exports = async function ({ app, prisma, command, body, ack, respond }) {
    metrics.increment('events.flow.finish', 1)
    const userId = body?.user_id || body?.user?.id
    await respond({
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `One last thing, you should set your <https://forms.fillout.com/t/dpjQEYgRa1us?id=${userId.toUpperCase()}|channel suggestion preferences here>. You'll also be able to run \`/like\` on channels that you like, just like Instagram (and get recommendations using \`/recommendations\`). Learn more in the <#C07SREWJ4DA> channel.

Congrats! You've done all of the quests.`
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "Quest 7 out of 7. You're finished! :tada:"
                    }
                ]
            }
        ]
    })

    await prisma.user.update({
        where: {
            id: body?.user_id || body?.user?.id
        },
        data: {
            finished: true
        }
    })
}
