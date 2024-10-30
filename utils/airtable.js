module.exports = async function poll() {
    const json = await (await fetch('https://api.airtable.com/v0/appTeNFYcUiYfGcR6/people?' + new URLSearchParams({
        maxRecords: 100,
        view: "Innkeeper",

    }), {
        headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`
        }
    })).json()
    return json.records
}
