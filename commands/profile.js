const { metrics } = require('../utils/metrics')
/**
 * @param {{app: import('@slack/bolt').App, prisma: import('@prisma/client').PrismaClient}}} param1
 */
module.exports = async function ({ app, prisma }) {
    app.command("/profile", async ({ command, body, ack, respond }) => {
        await ack();
        const a = await app.client.team.profile.get({
        })
        const b = await app.client.users.profile.get({
            user: body.user_id
        })

        const blocks = a.profile.fields.filter(field => !field.is_hidden && field.type != "file").map(field => {
            var type = "plain_text_input"
            switch (field.type) {
                case 'date':
                    type = "datepicker"
                    break;
                case 'link':
                    type = "url_text_input"
                    break;
                default:
                    type = "plain_text_input"
            }

            var obj = {
                "type": "input",
                "optional": true,
                "element": {
                    "type": type,
                    "action_id": field.id,
                },
                "label": {
                    "type": "plain_text",
                    "text": field.label,
                    "emoji": true
                }
            }
            if ((type == "plain_text_input" || type == "url_text_input") && b.profile.fields[field.id]?.value) {
                obj.element.initial_value = b.profile.fields[field.id]?.value
            } else if (type == "datepicker") {
                obj.element.initial_date = b.profile.fields[field.id]?.value
            } else if (field.hint) {
                obj.element.placeholder = {
                    "type": "plain_text",
                    "text": field.hint
                }
            }

            return obj
        })
        await app.client.views.open({
            trigger_id: body.trigger_id,
            view: {
                type: 'modal',
                callback_id: 'profile',
                "title": {
                    "type": "plain_text",
                    "text": "Modify your profile",
                    "emoji": true
                },
                "submit": {
                    "type": "plain_text",
                    "text": "Submit",
                    "emoji": true
                },
                "close": {
                    "type": "plain_text",
                    "text": "Cancel",
                    "emoji": true
                },
                blocks
            }
        })
    })
    app.view('profile', async ({ view, ack, body, respond }) => {
        await ack()
        const input = view['state']['values']
        var fields = {}
        for (const outerKey in input) {
            const innerObject = input[outerKey];

            for (const fieldKey in innerObject) {
                const fieldData = innerObject[fieldKey];
                const fieldValue = fieldData.value || fieldData.selected_date || null;
                if (fieldValue)
                    fields[fieldKey] = {
                        value: fieldValue,
                        alt: ""
                    };

            }
        }
        await app.client.users.profile.set(
            {
                token: process.env.SLACK_USER_TOKEN, user: body.user.id, profile: JSON.stringify({
                    fields
                })
            }
        )
        await app.client.chat.postEphemeral({
            channel: body.user.id,
            user: body.user.id,
            text: "✅ Profile set successfully"
        });
    })
}