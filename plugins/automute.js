const { bot } = require('../lib')

const validateGroup = (message) => {
 if (!message.isGroup) return message.reply('_This command is for groups_')
 if (!isAdmin(message.jid, message.user, message.client)) return message.reply("_I'm not admin_")
 return true
}

const parseTime = (args) => {
 const time = parseInt(args[0])
 const unit = args[1]?.toLowerCase()

 if (!time || isNaN(time)) {
  throw new Error('Please provide a valid time')
 }

 switch (unit) {
  case 'sec':
  case 'second':
   return time * 1000
  case 'min':
  case 'minute':
   return time * 60000
  case 'hour':
   return time * 3600000
  default:
   throw new Error("Invalid time unit. Use 'second', 'minute', or 'hour'.")
 }
}

const setGroupTimer = (action, message, args) => {
 try {
  if (!validateGroup(message)) return

  const delay = parseTime(args)
  const actionText = action === 'close' ? 'closed' : 'opened'

  message.reply(`Group will be ${actionText} in ${args[0]} ${args[1]}!`)

  setTimeout(() => {
   const settingUpdate = action === 'close' ? 'announcement' : 'not_announcement'
   message.bot.groupSettingUpdate(message.from, settingUpdate)
   message.reply(`Group ${actionText}!`)
  }, delay)
 } catch (error) {
  message.reply(error.message)
  console.error(error)
 }
}

bot(
 {
  pattern: 'amute',
  desc: 'Set timer to close a group chat',
  type: 'group',
 },
 (message, match, { args }) => setGroupTimer('close', message, args)
)

bot(
 {
  pattern: 'aunmute',
  desc: 'Set timer to open a group chat',
  type: 'group',
 },
 (message, match, { args }) => setGroupTimer('open', message, args)
)
