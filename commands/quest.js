/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}}} param1
 */
const { metrics } = require('../utils/metrics')
module.exports = async function ({ app, prisma }) {
  app.command("/quest", async ({ command, body, ack, respond }) => {
    metrics.increment('events.commands.run.next_quest', 1)
    await ack();
    var user = await prisma.user.findFirst({
      where: {
        id: body.user_id,
      },
    });

    if (!user) {
      await prisma.user.create({
        data: {
          id: body.user_id,
          stage: 1,
          finished: false,
        },
      });
      await require(`../quests/1`)({
        app,
        prisma,
        command,
        body,
        ack,
        respond,
      });
    } else {
      if (user.finished) {
        return await respond(":yay: :tada: Congrats! You've finished every quest!");
      }
      await require(`../quests/${user.stage}`)({
        app,
        prisma,
        command,
        body,
        ack,
        respond,
      });
    }
  });
};
