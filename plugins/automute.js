const { prefix, setSchedule, getSchedule, getAllSchedule, addSchedule } = require('../lib/database/automute')
const { bot } = require('../lib')
const { AUTOMUTE_MSG, AUTOUNMUTE_MSG } = require('../config')

/**
 * Checks if the user is an admin of the group.
 *
 * @param {Object} message - The message object.
 * @returns {Promise<boolean>} - True if the user is an admin, otherwise false.
 */
const isBotAdmin = async (message) => {
 const groupMetadata = await message.client.groupMetadata(message.chat)
 const participants = await groupMetadata.participants
 const groupAdmins = participants.filter((participant) => participant.admin !== null).map((participant) => participant.id)
 return groupAdmins.includes(message.user_id)
}

// Handler for automute commands
bot(
 {
  pattern: 'automute ?(.*)',
  fromMe: true,
  desc: 'Auto group mute scheduler',
  type: 'group',
 },
 async (message, match, client) => {
  if (!message.isGroup) return await message.reply('_This command only works in group chats_')

  const isAdmin = await isBotAdmin(message)
  if (!isAdmin) return await message.reply("I'm not an admin")

  const groupMetadata = await message.client.groupMetadata(message.jid)
  const currentMuteSchedule = await getSchedule(message.jid, 'mute')
  const replyMessage = message.reply_message.text || AUTOMUTE_MSG

  if (!match) {
   const isMuteEnabled = currentMuteSchedule?.enabled || false
   const buttonMessage = {
    text: 'AutoMute Manager',
    footer: `Group Name: ${groupMetadata.subject}\nAutoMute Status: ${isMuteEnabled}`,
    buttons: [
     { buttonId: `${prefix}automute on`, buttonText: { displayText: 'ON' }, type: 1 },
     { buttonId: `${prefix}automute off`, buttonText: { displayText: 'OFF' }, type: 1 },
     { buttonId: `${prefix}automute get`, buttonText: { displayText: 'GET' }, type: 1 },
    ],
    headerType: 1,
   }
   await message.client.sendMessage(message.jid, buttonMessage)
   return
  }

  if (match === 'get') {
   if (!currentMuteSchedule) return await message.send('_AutoMute is not scheduled in this chat_')
   const { time, enabled } = currentMuteSchedule
   const formattedTime =
    time
     .toUpperCase()
     .match(/[^A-Za-z]/gm)
     .join('') || 'null'
   const meridiem = time.toUpperCase().match(/[A-Z]/gm).join('') || 'null'
   return await message.send(`*Time:* ${formattedTime}${meridiem}\n*Status:* ${enabled ? 'on' : 'off'}\nMessage: ${currentMuteSchedule.message}`)
  }

  if (match === 'on' || match === 'off') {
   if (!currentMuteSchedule) return await message.send('_AutoMute is not scheduled in this chat_')
   if (!currentMuteSchedule.time) return await message.send('_AutoMute is not scheduled in this chat_')

   if (match === 'off') {
    currentMuteSchedule.time = 'off'
   }

   const wasScheduled = await addSchedule(message.jid, currentMuteSchedule.time, 'mute', currentMuteSchedule.subject, currentMuteSchedule.message, client)
   if (!wasScheduled) return await message.send(`_AutoMute is already ${match === 'on' ? 'enabled' : 'disabled'}_`)

   await setSchedule(message.jid, currentMuteSchedule.time, 'mute', currentMuteSchedule.subject, currentMuteSchedule.message, match === 'on')
   return await message.send(`_AutoMute ${match === 'on' ? 'enabled' : 'disabled'}._`)
  }

  if (!match.includes(':') || (!match.toUpperCase().includes('AM') && !match.toUpperCase().includes('PM'))) {
   return await message.reply('_Wrong Format!_\n*Example: automute 6:00 AM || automute 12:00 PM*')
  }

  await setSchedule(message.jid, match, 'mute', groupMetadata.subject, replyMessage, true)
  await addSchedule(message.jid, match, 'mute', groupMetadata.subject, replyMessage, client)
  const formattedTime = match
   .toUpperCase()
   .match(/[^A-Za-z]/gm)
   .join('')
  const meridiem = match.toUpperCase().match(/[A-Z]/gm).join('')
  return await message.send(`_Group will mute at ${formattedTime} ${meridiem}_`)
 }
)

// Handler for autounmute commands
bot(
 {
  pattern: 'autounmute ?(.*)',
  fromMe: true,
  desc: 'Auto group unmute scheduler',
  type: 'group',
 },
 async (message, match, client) => {
  if (!message.isGroup) return await message.reply('_This command only works in group chats_')

  const isAdmin = await isBotAdmin(message)
  if (!isAdmin) return await message.reply("I'm not an admin")

  const groupMetadata = await message.client.groupMetadata(message.jid)
  const currentUnmuteSchedule = await getSchedule(message.jid, 'unmute')
  const replyMessage = message.reply_message.text || AUTOUNMUTE_MSG

  if (!match) {
   const isUnmuteEnabled = currentUnmuteSchedule?.enabled || false
   const buttonMessage = {
    text: 'AutoUnmute Manager',
    footer: `Group Name: ${groupMetadata.subject}\nAutoUnmute Status: ${isUnmuteEnabled}`,
    buttons: [
     { buttonId: `${prefix}autounmute on`, buttonText: { displayText: 'ON' }, type: 1 },
     { buttonId: `${prefix}autounmute off`, buttonText: { displayText: 'OFF' }, type: 1 },
     { buttonId: `${prefix}autounmute get`, buttonText: { displayText: 'GET' }, type: 1 },
    ],
    headerType: 1,
   }
   await message.client.sendMessage(message.jid, buttonMessage)
   return
  }

  if (match === 'get') {
   if (!currentUnmuteSchedule) return await message.send('_AutoUnmute is not scheduled in this chat_')
   const { time, enabled } = currentUnmuteSchedule
   const formattedTime =
    time
     .toUpperCase()
     .match(/[^A-Za-z]/gm)
     .join('') || 'null'
   const meridiem = time.toUpperCase().match(/[A-Z]/gm).join('') || 'null'
   return await message.send(`*Time:* ${formattedTime}${meridiem}\n*Status:* ${enabled ? 'on' : 'off'}\nMessage: ${currentUnmuteSchedule.message}`)
  }

  if (match === 'on' || match === 'off') {
   if (!currentUnmuteSchedule) return await message.send('_AutoUnmute is not scheduled in this chat_')
   if (!currentUnmuteSchedule.time) return await message.send('_AutoUnmute is not scheduled in this chat_')

   if (match === 'off') {
    currentUnmuteSchedule.time = 'off'
   }

   const wasScheduled = await addSchedule(message.jid, currentUnmuteSchedule.time, 'unmute', currentUnmuteSchedule.subject, currentUnmuteSchedule.message, client)
   if (!wasScheduled) return await message.send(`_AutoUnmute is already ${match === 'on' ? 'enabled' : 'disabled'}_`)

   await setSchedule(message.jid, currentUnmuteSchedule.time, 'unmute', currentUnmuteSchedule.subject, currentUnmuteSchedule.message, match === 'on')
   return await message.send(`_AutoUnmute ${match === 'on' ? 'enabled' : 'disabled'}._`)
  }

  if (!match.includes(':') || (!match.toUpperCase().includes('AM') && !match.toUpperCase().includes('PM'))) {
   return await message.reply('_Wrong Format!_\n*Example: autounmute 6:00 AM || autounmute 12:00 PM*')
  }

  await setSchedule(message.jid, match, 'unmute', groupMetadata.subject, replyMessage, true)
  await addSchedule(message.jid, match, 'unmute', groupMetadata.subject, replyMessage, client)
  const formattedTime = match
   .toUpperCase()
   .match(/[^A-Za-z]/gm)
   .join('')
  const meridiem = match.toUpperCase().match(/[A-Z]/gm).join('')
  return await message.send(`_Group will unmute at ${formattedTime} ${meridiem}_`)
 }
)

// Handler for retrieving all mute and unmute schedules
bot(
 {
  pattern: 'getmute ?(.*)',
  fromMe: true,
  desc: 'Get all groups mute and unmute schedules',
  type: 'group',
 },
 async (message) => {
  const schedules = await getAllSchedule()
  let responseMessage = ''

  for (const [index, schedule] of schedules.entries()) {
   const { mute, unmute } = JSON.parse(schedule.dataValues.content)
   const muteTime = mute.time || 'null'
   const unmuteTime = unmute.time || 'null'

   const formattedMuteTime =
    muteTime
     .toUpperCase()
     .match(/[^A-Za-z]/gm)
     .join('') || 'null'
   const muteMeridiem = muteTime.toUpperCase().match(/[A-Z]/gm).join('') || 'null'

   const formattedUnmuteTime =
    unmuteTime
     .toUpperCase()
     .match(/[^A-Za-z]/gm)
     .join('') || 'null'
   const unmuteMeridiem = unmuteTime.toUpperCase().match(/[A-Z]/gm).join('') || 'null'

   responseMessage += `*${index + 1}. Group:* ${mute.groupName || 'null'}
*Mute:* ${formattedMuteTime}${muteMeridiem}
*Unmute:* ${formattedUnmuteTime}${unmuteMeridiem}
*Status:* ${mute.enabled || 'null'}\n\n`
  }

  await message.send(responseMessage.trim())
 }
)
