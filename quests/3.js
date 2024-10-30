/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}}} param1
 */
module.exports = async function ({ app, prisma, command, body, ack, respond }) {
    await prisma.user.update({
        where: {
            id: body?.user_id || body?.user?.id
        },
        data: {
            stage: 4
        }
    })
    var events = await (await fetch("https://events.hackclub.com/api/events/upcoming/")).json()
    events = events.filter(event => new Date(event.end) > new Date()).slice(0, 5)
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
                    "text": `Anything catch your eye? Here's a list of upcoming events happening in the Slack for High Seas! We'll have events of all kinds from workshops to fun hangout events. We'd love to see you at one, RSVP for your first event this week! (you can skip this quest if you're not interested in attending an event!). *NB!* the times have been converted to your timezone (\`${tz}\`)`
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
                        "text": "Quest 3 out of 7. This quest is optional and you can skip it. Run `/quest` to advance."
                    }
                ]
            }

        ]
    }
    await respond(msg)


}