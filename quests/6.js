/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}}} param1
 */
module.exports = async function ({ app, prisma, command, body, ack, respond }) {
    metrics.increment('events.flow.finish', 1)
    await respond({
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `One last thing, you should set your <https://forms.fillout.com/t/dpjQEYgRa1us?id=${body?.user_id || body?.user?.id}|channel suggestion prefrences here>. You'll also be able to run \`/like\` on channels that you like, just like instagram (and get recommendations using \`/recommendations\`). Learn more in the <#C07SREWJ4DA> channel.

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
                        "text": "Quest 6 out of 6. You're finished! :tada:"
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