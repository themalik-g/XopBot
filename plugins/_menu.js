const plugins = require('../lib/plugins')
const { bot, isPrivate, clockString } = require('../lib')
const { BOT_NAME } = require('../config')
const { hostname } = require('os')
const os = require('os')
const { tiny } = require('../lib/fancy')
bot(
 {
  pattern: 'menu',
  fromMe: isPrivate,
  desc: 'Show All Commands',
  dontAddCommandList: true,
  type: 'user',
 },
 async (message, match) => {
  if (match) {
   for (let command of plugins.commands) {
    if (command.pattern instanceof RegExp && command.pattern.test(message.prefix + match)) {
     const commandName = command.pattern.toString().split(/\W+/)[1]
     message.reply(`\`\`\`Command: ${message.prefix}${commandName.trim()}
Description: ${command.desc}\`\`\``)
    }
   }
  } else {
   let [date, time] = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }).split(',')
   let menuHeader = `╭═══ ${BOT_NAME} ═══⊷
┃✵╭──────────────
┃✵│ User: ${message.pushName}
┃✵│ OS: ${os.platform}
┃✵│ Platform: ${hostname().split('-')[0]}
┃✵│ Date: ${date}
┃✵│ Time: ${time}
┃✵│ Plugins: ${plugins.commands.length}
┃✵│ Uptime: ${clockString(process.uptime())} 
┃✵╰──────────────
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
   return await message.sendMessage(message.jid, menuHeader)
  }
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
