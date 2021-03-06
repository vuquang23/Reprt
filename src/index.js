require('dotenv').config()
const Discord = require('discord.js')
const covid19 = require('./covid19')
const schedule = require('./schedule')

const client = new Discord.Client()

client.on('ready', () => {
    console.log('ready!')
    covid19.fetchData()
})

client.on('message', async (message) => {
    let result, options
    const msg = message.content.split(' ')
    switch (msg[0]) {
        case '!cmd':
            const cmd = '!g\n' + '!c :country_name [datetime] | [datetime example: 03-07-2021]\n' + '!p :country_name\n'
            message.channel.send(cmd)
            break
        case '!g':
            result = covid19.queryGlobal()
            message.channel.send(result)
            break
        case '!c':
            options = {
                country: msg[1],
                datetime: (msg[2] === undefined ? null : msg[2])
            }
            result = covid19.queryCountry(options)
            message.channel.send(result)
            break
        case '!p':
            let ok = await covid19.loadChart(msg[1])
            if (ok === false) {
                message.channel.send(`invalid country name! or data not updated at ${msg[1]}`)
            } else {
                message.channel.send(`Country: ${msg[1]}`, {
                    files: [
                        `../data/${msg[1]}`
                    ]
                })
            }
            break
    }
})

client.login(process.env.TOKEN)

const job = schedule(() => {
    covid19.fetchData()
})
job.start()
