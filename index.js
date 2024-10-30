require("dotenv").config();
const { App } = require("@slack/bolt");
const { metrics } = require('./utils/metrics')
const newUsers = require('./utils/airtable.js');
const prisma = require("./utils/prismaExtends.js").prisma
const express = require('express')
const http = express()


const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000,
});

setInterval(async function () {
try {
  const records = await newUsers()
  await Promise.all(records.map(async (record) => {
    const user = await prisma.user.findFirst({
      where: {
        id: record.fields.slack_id
      }
    });
    if (!user) {
      await prisma.user.create({
        data: {
          id: record.fields.slack_id,
          stage: 1,
          finished: false,
        }
      });
      await app.client.chat.postMessage({
        channel: record.fields.slack_id,
        text: "🏴‍☠️🚢 Check your DMs to learn more about High Seas and Hack Club",
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Hey there pirate! I'm the Innkeeper of this humble Slack and I'm here to give you a couple of quests to embark on. Don't worry, it's totally optional and you can take it any time by saying `/quest` below."
            }
          }
        ]
      });
    }
  }));
} catch(e){
  console.error("Polling error. Details below:")
  console.error(e)
}
}, 1000 * 5)


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

http.get('/heartbeat', (req, res) => {
  res.send("💓 boom boom")
});

http.listen(process.env.PORT || 3000, () => {
  console.log(`Innkeeper HTTP listening on port ${process.env.PORT || 3000}`)
});


(async () => {
  await require("./commands/button.js")({ app, prisma });
  await require("./commands/quest.js")({ app, prisma });
  await require("./commands/profile.js")({ app, prisma });


  await app.start(process.env.PORT || 3000);
  metrics.increment('events.startup', 1)
  console.log("🤵 Innkeeper is running");
})();
