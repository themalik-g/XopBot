const plugins = require('../lib/plugins')
const { bot, isPrivate } = require('../lib')
const { BOT_NAME } = require('../config')
const { hostname } = require('os')
const os = require('os')
const { tiny } = require('../lib/fancy')
const config = require('../config')

function formatRuntime(totalSeconds, dayLabel = ' d', hourLabel = ' h', minuteLabel = ' m', secondLabel = ' s') {
 totalSeconds = Number(totalSeconds)
 const days = Math.floor(totalSeconds / 86400)
 const hours = Math.floor((totalSeconds % 86400) / 3600)
 const minutes = Math.floor((totalSeconds % 3600) / 60)
 const seconds = Math.floor(totalSeconds % 60)
 const dayPart = days > 0 ? days + dayLabel + ', ' : ''
 const hourPart = hours > 0 ? hours + hourLabel + ', ' : ''
 const minutePart = minutes > 0 ? minutes + minuteLabel + ', ' : ''
 const secondPart = seconds > 0 ? seconds + secondLabel : ''
 return dayPart + hourPart + minutePart + secondPart
}
module.exports = formatRuntime
bot(
 {
  pattern: 'menu',
  fromMe: isPrivate,
  desc: 'Show All Commands',
  dontAddCommandList: true,
  type: 'user',
 },
 async (message, match) => {
  const [date, time] = new Date().toLocaleString('en-IN', { timeZone: config.TIME_ZONE }).split(',')
  let menuHeader = `╭━━━〔 ${BOT_NAME} 〕━━━⊷
│ ᴜsᴇʀ: ${message.pushName}
│ ᴏs: ${os.platform}
│ ᴘʟᴀᴛғᴏʀᴍ: ${hostname().split('-')[0]}
│ ᴅᴀᴛᴇ: ${date}
│ ᴛɪᴍᴇ: ${time}
│ ᴘʟᴜɢɪɴs: ${plugins.commands.length}
│ ʀᴜɴᴛɪᴍᴇ: ${formatRuntime(process.uptime())} 
╰━━━━━━━━━━━━━━━┈⊷\n`

  let commandList = []
  let categories = []

  plugins.commands.forEach((command) => {
   if (command.pattern instanceof RegExp) {
    const commandName = command.pattern.toString().split(/\W+/)[1]
    const commandType = command.type ? command.type.toLowerCase() : 'misc'

    if (!command.dontAddCommandList && commandName) {
     commandList.push({ commandName, commandType })

     if (!categories.includes(commandType)) {
      categories.push(commandType)
     }
    }
   }
  })

  commandList.sort()
  categories.sort().forEach((category) => {
   menuHeader += `\n╭━━━〔  *${tiny(category)}* 〕━━━┈⊷`
   commandList
    .filter(({ commandType }) => commandType === category)
    .forEach(({ commandName }) => {
     menuHeader += `\n│ ${tiny(commandName.trim())}`
    })
   menuHeader += `\n╰━━━━━━━━━━━━━━━┈⊷`
  })

  menuHeader += `\n`
  menuHeader += `ᴢᴇɴᴏɴ-ʙᴏᴛ`
  let button = {
   jid: message.jid,
   button: [
    { type: 'reply', params: { display_text: 'MENU', id: '#menu' } },
    { type: 'url', params: { display_text: 'Neeraj-x0', url: 'https://www.neerajx0.xyz/', merchant_url: 'https://www.neerajx0.xyz/' } },
   ],
   header: { title: `ʜᴇʟʟᴏ${message.pushName}`, subtitle: 'WhatsApp Bot', hasMediaAttachment: false },
   footer: { text: BOT_NAME },
   body: { text: menuHeader },
  }
  return await message.sendMessage(message.jid, button, {}, 'interactive')
 }
)

bot(
 {
  pattern: 'list',
  fromMe: isPrivate,
  desc: 'Show All Commands',
  type: 'user',
  dontAddCommandList: true,
 },
 async (message) => {
  let commandMenu = '\t\t```Command List```\n'
  let commandList = []

  plugins.commands.forEach((command) => {
   if (command.pattern) {
    const commandName = command.pattern.toString().split(/\W+/)[1]
    const commandDescription = command.desc || false

    if (!command.dontAddCommandList && commandName) {
     commandList.push({ commandName, commandDescription })
    }
   }
  })

  commandList.sort()
  commandList.forEach(({ commandName, commandDescription }, index) => {
   commandMenu += `\`\`\`${index + 1} ${commandName.trim()}\`\`\`\n`
   if (commandDescription) {
    commandMenu += `Use: \`\`\`${commandDescription}\`\`\`\n\n`
   }
  })

  return await message.reply(commandMenu)
 }
)
