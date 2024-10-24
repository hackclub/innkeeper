/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}}} param1
 */
module.exports = async function ({ app, prisma, command, body, ack, respond }) {
    await prisma.user.update({
        where: {
            id: body?.user_id || body?.user?.id
        },
        data: {
            stage: 2
        }
    })
    await respond({
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Your first quest is to fill our your profile! You can set:
- 👤 Your name (<https://slack.com/help/articles/216360827-Change-your-display-name|learn how to set that here>)
- 🖼️ A photo, which doesn't have to be your face! (<https://slack.com/help/articles/115005506003-Upload-a-profile-photo|learn how to set that here>)
- 🏀 What you like doing as a hobby (Only on PC, <https://cloud-80a3j2fh7-hack-club-bot.vercel.app/0image.png|learn how to set that here>)`
                }
            }
        ]
    })
    await respond({
        blocks: [{
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `You can also set your pronouns if you want by clicking one of these buttons:`
            }
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "he/him",
                        "emoji": true
                    },
                    "value": "he/him",
                    "action_id": "set_pronouns1"
                }, {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "she/her",
                        "emoji": true
                    },
                    "value": "she/her",
                    "action_id": "set_pronouns2"
                }, {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "they/them",
                        "emoji": true
                    },
                    "value": "they/them",
                    "action_id": "set_pronouns3"
                }, {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "he/they",
                        "emoji": true
                    },
                    "value": "he/they",
                    "action_id": "set_pronouns4"
                }, {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "she/they",
                        "emoji": true
                    },
                    "value": "she/they",
                    "action_id": "set_pronouns5"
                }, {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Any pronouns",
                        "emoji": true
                    },
                    "value": "any pronouns",
                    "action_id": "set_pronouns6"
                }]
        }]
    })
    await respond(
        {
            blocks: [
                {
                    "type": "divider"
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": "Quest 1 out of 6. This quest is optional and you can skip it."
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
                }]
        })
}