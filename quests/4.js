/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}}} param1
 */
module.exports = async function ({ app, prisma, command, body, ack, respond }) {
    const arr = await (await fetch(`https://l.hack.club/affinity`)).json()
    if (arr.find(ch => ch.id == (body?.channel_id || body?.channel?.id))) {
        await prisma.user.update({
            where: {
                id: body?.user_id || body?.user?.id
            },
            data: {
                stage: 5
            }
        })
        await require(`./5`)({ app, prisma, command, body, ack, respond });
        return;
    }
    async function getRandomChannels() {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        return arr.slice(0, 10).map(ch => `- ${ch.emoji} <#${ch.id}>`).join("\n").replaceAll(/[\u{1F3FB}-\u{1F3FF}]/gmu, "")
    }

    await respond({
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Now, you can join these interest group channels to ask for help and meet other people interested in stuff like you!
                    
We've picked 10 random ones. Join one you might be interested in and run /quest from one of them!
                    
${await getRandomChannels()}
                    `
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
                        "text": "Quest 4 out of 6"
                    }
                ]
            }
        ]
    })

}