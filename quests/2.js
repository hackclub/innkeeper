/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}}} param1
 */
module.exports = async function ({ app, prisma, command, body, ack, respond }) {
    await prisma.user.update({
        where: {
          id: body?.user_id || body?.user?.id
        },
        data: {
            stage: 3
        }
    })
    await respond({
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Your next quest is to introduce yourself in <#C75M7C0SY>!
Things you might wanna include are:
- 👤 Your name
- 🗺️ Where you're from (you don't need to say your city)
- 🏀 What you like doing as a hobby`
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
                        "text": "Quest 2 out of 6. This quest is optional and you can skip it."
                    }
                ]
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Next Quest",
                            "emoji": true
                        },
                        "value": "next_quest",
                        "action_id": "next_quest"
                    }]
            }
        ]
    })

}