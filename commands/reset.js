
const { metrics } = require('../utils/metrics')
/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}}} param1
 */
module.exports = async function ({ app, prisma }) {
    app.command("/reset-quests", async ({ command, body, ack, respond }) => {
        metrics.increment('events.commands.run.reset_quests', 1)
        await prisma.user.update({
            where: {
              id: body.user_id,
            },
            data: {
                stage: 1,
                finished: false
            }
          });
          await ack();
          await respond("✅ It is done.")
    })
}