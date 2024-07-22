
const { bot } = require('../lib/index')

bot({
    pattern: 'twitter',
    desc: 'Downloads Twitter Videos & Images',
    type: 'download',
},
async (message, match) =>{
   if (!match) return message.reply('_Need X Link!_')
    await match(isUrl)
}
)