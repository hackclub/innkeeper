/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}}} param1
 */
module.exports = async function ({ app, prisma, command, body, ack, respond }) {
    if (body?.channel_id !== "C078Q8PBD4G" || body?.channel?.id !== "C078Q8PBD4G") return await respond("Check <#C078Q8PBD4G> for the next quest!")
    await prisma.user.update({
        where: {
            id: body?.user_id || body?.user?.id
        },
        data: {
            stage: 4
        }
    })
    await app.client.chat.postEphemeral({
        channel: "C078Q8PBD4G",
        user: body?.user_id || body?.user?.id,
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `This is the Hack Club library! It keeps a track of over 6200 channels and helps you find conversations which you can join in on at any time and make new friends! It has three sections:

1. Staff featured channels. Those who work at Hack Club can add channels so they're more easily seen. They're typically ongoing events or popular community channels
2. Active channels. These are channels with messages sent in them within the past 30 minutes.
3. Active threads. These are active subconversations within a channel. Other platforms like Discord have them too! <https://slack.com/help/articles/115000769927-Use-threads-to-organize-discussions|Read more about them here.>

Librarian also has a feature where you can find channels close to you. Normally, you can do this by clicking the button "Find Local Hack Clubbers", but, I've pulled it up for you.`
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
                        "text": "Quest 3 out of 6"
                    }
                ]
            }
        ]
    })
    setTimeout(async function () {
        const sls = (await fetch(`https://l.hack.club/sls/${body?.user_id || body?.user?.id}`))

        await app.client.chat.postEphemeral({
            channel: "C078Q8PBD4G",
            user: body?.user_id || body?.user?.id,
            blocks: [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `${sls.statusText == 404 ? `Normally I would show you your location, but I don't seem to have it. 
You can give it to me by running /setuserlocation [location].
Example: /setuserlocation Atlanta, Georgia.` : (await sls.text())}`
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
                            "text": "Quest 3 out of 6. Run /quest for the next quest, or click the button below:"
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


    }, 2000)
}