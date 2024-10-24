require("dotenv").config();
const { App } = require("@slack/bolt");
const { PrismaClient } = require("@prisma/client");
const { metrics } = require('./utils/metrics')
const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base('appTeNFYcUiYfGcR6');
const prisma = require("./utils/prismaExtends.js").prisma
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000,
});

setInterval(function(){
  base('people').select({
    view: "Innkeeper"
  }).all(function (err, records) {
    if (err) { console.error(err); return; }
    records.forEach(async function (record) {

      const user = await prisma.user.findFirst({
        where: {
          id: record.get("slack_id")
        }
      })
      if (user) return;
      await prisma.user.create({
        data: {
          id: record.get("slack_id"),
          stage: 1,
          finished: false,
        }
      })
      app.client.chat.postMessage({
        channel:record.get("slack_id"),
        blocks: [
          {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Hey there pirate! I'm the Innkeeper of this humble Slack and I'm here to give you a couple of quests to embark on. Don't worry, it's totally optional and you can take it any time by saying `/quest` below"
            }
        }]
      })
    });
  })
}, 1000*5)


setInterval(async function () {
  const stages = await prisma.user.findMany({
    where: {},
  })
  metrics.increment('events.pulse', 1)
  metrics.gauge('flow.users.starts.all_time', stages.length)
  for (let i = 1; i <= 6; i++) {
    metrics.gauge(`flow.users.stage.${i}`, stages.filter(stage => stage.stage == i).length);
  }
  const finished = await prisma.user.findMany({
    where: {
      finished: true
    },
  })
  metrics.gauge('flow.users.finished', finished.length)

  const totalStartsThisWeek = (
    await prisma.user.findMany({
      where: {
        createdAt: {
          lte: new Date(),
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    })
  ).length

  metrics.gauge('flow.users.starts.this_week', totalStartsThisWeek)
}, 1000 * 1);
(async () => {
  await require("./commands/button.js")({ app, prisma });
  await require("./commands/quest.js")({ app, prisma });

  await app.start(process.env.PORT || 3000);
  metrics.increment('events.startup', 1)
  console.log("🤵 Innkeeper is running");
})();
