/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}}} param1
 */
const { Gorse } = require("gorsejs")
const client = new Gorse({ endpoint: process.env.GORSE_ENDPOINT, secret: process.env.GORSE_SECRET });
module.exports = async function ({ app, prisma, command, body, ack, respond }) {
    await prisma.user.update({
        where: {
            id: body?.user_id || body?.user?.id
        },
        data: {
            stage: 6
        }
    })
    var channels = await client.getItemNeighbors({ itemId: body?.channel_id || body?.channel?.id })
    channels = channels.map(rec => `- <#${rec.Id}>`).join("\n")
    await respond({
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Now, we encourage you to check out channels similar to this one :)
${channels}`
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
                        "text": "Quest 5 out of 6. This quest is optional so you can skip it. Run /quest for the next quest."
                    }
                ]
            }
        ]
    })

}