/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}}} param1
 */
const { metrics } = require('../utils/metrics')
module.exports = async function ({ app, prisma }) {
    const handleSetPronouns = async ({ ack, respond, body, action }) => {
        await ack();
        metrics.increment('events.actions.run.set_pronouns', 1)
        await app.client.users.profile.set({
            profile: JSON.stringify({
                pronouns: action.text.text
            }),
            user: body.user.id,
            token: process.env.SLACK_USER_TOKEN
        })
        await respond("✅ Set pronouns successfully");
    };

    for (let i = 1; i <= 6; i++) {
        app.action(`set_pronouns${i}`, handleSetPronouns);
    }
    app.action("next_quest", async ({ ack, respond, say, body }) => {
        await ack();
        metrics.increment('events.buttons.run.next_quest', 1)
        var user = await prisma.user.findFirst({
            where: {
                id: body.user.id,
            },
        });

        if (!user) {
            await prisma.user.create({
                data: {
                    id: body.user.id,
                    stage: 1,
                    finished: false,
                },
            });
            await require(`../quests/1`)({
                app,
                prisma,
                body,
                ack,
                respond,
            });
        } else {
            if (user.finished) {
                await respond(":yay: :tada: Congrats! You've finished every quest!");
            }
            await require(`../quests/${user.stage}`)({
                app,
                prisma,
                body,
                ack,
                respond,
            });
        }
    });
}