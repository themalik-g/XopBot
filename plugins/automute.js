const { bot } = require('../lib')
const automuteDB = require('../lib/database/automute')
bot(
 {
  pattern: 'automute ?(.*)',
  fromMe: true,
  desc: 'Set automute time for the group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_")

  const input = match.trim()

  if (!input) {
   return await message.reply('_Please specify a time or use "on/off" to toggle automute_')
  }

  if (input.toLowerCase() === 'on') {
   const randomMinutes = Math.floor(Math.random() * 55) + 5 // Random time not less than 5 mins
   const currentTime = new Date()
   const muteTime = new Date(currentTime.getTime() + randomMinutes * 60000)

   await automuteDB.upsert({
    groupId: message.jid,
    muteTime: muteTime.toTimeString().split(' ')[0],
    isAutomuteOn: true,
   })

   return await message.reply(`_Automute is set to on. Group will be muted at ${muteTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}_`)
  }

  if (input.toLowerCase() === 'off') {
   await automuteDB.update({ isAutomuteOn: false }, { where: { groupId: message.jid } })
   return await message.reply('_Automute is now off_')
  }

  const timeParts = input.match(/^(\d{1,2}):(\d{2})(am|pm)?$/i)
  if (!timeParts) {
   return await message.reply('_Invalid time format. Use HH:MM AM/PM_')
  }

  const [_, hours, minutes, period] = timeParts
  let muteTime = new Date()
  muteTime.setHours(period.toLowerCase() === 'pm' ? parseInt(hours) + 12 : parseInt(hours))
  muteTime.setMinutes(parseInt(minutes))
  muteTime.setSeconds(0)

  await automuteDB.upsert({
   groupId: message.jid,
   muteTime: muteTime.toTimeString().split(' ')[0],
   isAutomuteOn: true,
  })

  return await message.reply(`_Automute set to mute the group at ${formatTime(input)}_`)
 }
)

// Helper function to format time
function formatTime(time) {
 const [hours, minutes] = time.split(':').map(Number)
 const ampm = hours >= 12 ? 'PM' : 'AM'
 const formattedHours = hours % 12 || 12
 return `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes}${ampm}`
}

// Autounmute command
bot(
 {
  pattern: 'autounmute ?(.*)',
  fromMe: true,
  desc: 'Set autounmute time for the group',
  type: 'group',
 },
 async (message, match, m, client) => {
  const timeInput = match.trim()

  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_")

  if (timeInput.toLowerCase() === 'on') {
   const randomTime = `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}`
   await automuteDB.upsert({ groupId: message.jid, unmuteTime: randomTime, isAutounmuteOn: true })
   return await message.reply(`_Autounmute is set to on at a random time: ${formatTime(randomTime)}_`)
  }

  if (timeInput.toLowerCase() === 'off') {
   await automuteDB.update({ isAutounmuteOn: false }, { where: { groupId: message.jid } })
   return await message.reply('_Autounmute is now off_')
  }

  if (!timeInput) {
   return await message.reply('_Please specify a time or use "on/off" to toggle_')
  }

  await automuteDB.upsert({ groupId: message.jid, unmuteTime: timeInput, isAutounmuteOn: true })
  await message.reply(`_Autounmute is set to unmute the group at ${formatTime(timeInput)}_`)
 }
)

// Getmute command
bot(
 {
  pattern: 'getmute',
  fromMe: true,
  desc: 'Get automute settings for the group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')

  const settings = await automuteDB.findOne({ where: { groupId: message.jid } })

  if (!settings) {
   return await message.reply('_No automute settings found for this group_')
  }

  const muteStatus = settings.isAutomuteOn ? `On at ${formatTime(settings.muteTime)}` : 'Off'
  const unmuteStatus = settings.isAutounmuteOn ? `On at ${formatTime(settings.unmuteTime)}` : 'Off'

  const response = `_Automute: ${muteStatus}_\n` + `_Autounmute: ${unmuteStatus}_`

  await message.reply(response)
 }
)
