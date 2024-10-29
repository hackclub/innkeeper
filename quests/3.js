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
    var events = await (await fetch("https://events.hackclub.com/api/events/upcoming/")).json()
    events = events.filter(event => new Date(event.end) > new Date()).slice(0, 10)
    const user = (await app.client.users.info({
        user: body?.user_id || body?.user?.id
    })).user;
    const tz = user?.tz;
    const eventBlocks = await Promise.all(events.map(async event => {

        const date = new Date(event.start).toLocaleString('en-US', { timeZone: tz, timeStyle: "short", dateStyle: "long" });
        return {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*${event.title}*\n*Organizer*: ${event.leader}\n${event.desc}\n*Date*: ${date}\n<${event.cal}|:calendar: Add to calendar>`
            },
            accessory: {
                type: "image",
                image_url: event.amaAvatar || event.avatar || "https://assets.hackclub.com/icon-progress-square.png",
                alt_text: `${event.leader}'s profile picture`
            }
        };
    }));
    var msg = {
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Now, you can see upcoming events. You can attend them if you want and meet new people, but it's always optional. In the future, you can see more at https://events.hackclub.com. *NB!* the times have been converted to your timezone (\`${tz}\`)`
                }
            },
            {
                "type": "divider"
            },
            ...eventBlocks,
            {
                "type": "divider"
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "Quest 3 out of 7. This quest is optional and you can skip it."
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
    }
    await respond(msg)


}