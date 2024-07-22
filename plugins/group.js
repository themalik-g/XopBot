const { bot, isAdmin, parsedJid } = require('../lib')
bot(
 {
  pattern: 'add',
  fromMe: true,
  desc: 'add a person to group',
  type: 'group',
 },
 async (message, match) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')

  match = match || message.reply_message.jid
  if (!match) return await message.reply('_Mention user to add')

  const isadmin = await isAdmin(message.jid, message.user, message.client)

  if (!isadmin) return await message.reply("_I'm not admin_")
  const jid = parsedJid(match)

  await message.client.groupParticipantsUpdate(message.jid, jid, 'add')

  return await message.reply(`_@${jid[0].split('@')[0]} added_`, {
   mentions: [jid],
  })
 }
)

bot(
 {
  pattern: 'kick',
  fromMe: true,
  desc: 'kicks a person from group',
  type: 'group',
 },
 async (message, match) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')

  match = match || message.reply_message.jid
  if (!match) return await message.reply('_Mention user to kick_')

  const isadmin = await isAdmin(message.jid, message.user, message.client)

  if (!isadmin) return await message.reply("_I'm not admin_")
  const jid = parsedJid(match)

  await message.client.groupParticipantsUpdate(message.jid, jid, 'remove')

  return await message.reply(`_@${jid[0].split('@')[0]} kicked_`, {
   mentions: [jid],
  })
 }
)
bot(
 {
  pattern: 'promote',
  fromMe: true,
  desc: 'promote to admin',
  type: 'group',
 },
 async (message, match) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')

  match = match || message.reply_message.jid
  if (!match) return await message.reply('_Mention user to promote_')

  const isadmin = await isAdmin(message.jid, message.user, message.client)

  if (!isadmin) return await message.reply("_I'm not admin_")
  const jid = parsedJid(match)

  await message.client.groupParticipantsUpdate(message.jid, jid, 'promote')

  return await message.reply(`_@${jid[0].split('@')[0]} promoted as admin_`, {
   mentions: [jid],
  })
 }
)
bot(
 {
  pattern: 'demote',
  fromMe: true,
  desc: 'demote from admin',
  type: 'group',
 },
 async (message, match) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')

  match = match || message.reply_message.jid
  if (!match) return await message.reply('_Mention user to demote_')

  const isadmin = await isAdmin(message.jid, message.user, message.client)

  if (!isadmin) return await message.reply("_I'm not admin_")
  const jid = parsedJid(match)

  await message.client.groupParticipantsUpdate(message.jid, jid, 'demote')

  return await message.reply(`_@${jid[0].split('@')[0]} demoted from admin_`, {
   mentions: [jid],
  })
 }
)

bot(
 {
  pattern: 'mute',
  fromMe: true,
  desc: 'nute group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_")
  await message.reply('_Muting_')
  return await client.groupSettingUpdate(message.jid, 'announcement')
 }
)

bot(
 {
  pattern: 'unmute',
  fromMe: true,
  desc: 'unmute group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_")
  await message.reply('_Unmuting_')
  return await client.groupSettingUpdate(message.jid, 'not_announcement')
 }
)

bot(
 {
  pattern: 'gjid',
  fromMe: true,
  desc: 'gets jid of all group members',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  let { participants } = await client.groupMetadata(message.jid)
  let participant = participants.map((u) => u.id)
  let str = '╭──〔 *Group Jids* 〕\n'
  participant.forEach((result) => {
   str += `├ *${result}*\n`
  })
  str += `╰──────────────`
  message.reply(str)
 }
)

bot(
 {
  pattern: 'tagall',
  fromMe: true,
  desc: 'mention all users in group',
  type: 'group',
 },
 async (message, match) => {
  if (!message.isGroup) return
  const { participants } = await message.client.groupMetadata(message.jid)
  let teks = ''
  for (let mem of participants) {
   teks += ` @${mem.id.split('@')[0]}\n`
  }
  message.sendMessage(message.jid, teks.trim(), {
   mentions: participants.map((a) => a.id),
  })
 }
)

bot(
 {
  pattern: 'tag',
  fromMe: true,
  desc: 'mention all users in group',
  type: 'group',
 },
 async (message, match) => {
  console.log('match')
  match = match || message.reply_message.text
  if (!match) return message.reply('_Enter or reply to a text to tag_')
  if (!message.isGroup) return
  const { participants } = await message.client.groupMetadata(message.jid)
  message.sendMessage(message.jid, match, {
   mentions: participants.map((a) => a.id),
  })
 }
)

bot(
 {
  pattern: 'lock',
  fromMe: true,
  desc: 'Allows Only Admins to Edit Gc Settings',
  type: 'group',
 },
 async (message, match) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply('_I am not admin_')
  await message.reply('_Locking Group_')
  await message.client.groupSettingUpdate(message.jid, 'locked')
 }
)

bot(
 {
  pattern: 'unlock',
  fromMe: true,
  desc: 'Allows All Members To Edit Gc Settings',
  type: 'group',
 },
 async (message, match) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply('_I am not admin_')
  await message.reply('_Unlocking Group_')
  await message.client.groupSettingUpdate(message.jid, 'unlocked')
 }
)

bot(
 {
  pattern: 'requests',
  fromMe: true,
  desc: 'View Group Join Requests',
  type: 'group',
 },
 async (message) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply('_I am not admin_')
  const requests = await message.client.groupRequestParticipantsList(message.jid)
  if (!requests || requests.length === 0) {
   return await message.reply('_No Requests Yet_')
  }
  let requestList = '_Join Requests_\n\n'
  for (const request of requests) {
   requestList += `@${request.jid.split('@')[0]}\n`
  }
  await message.reply(requestList, { mentions: requests.map((r) => r.jid) })
 }
)

bot(
 {
  pattern: 'accept',
  fromMe: true,
  desc: 'Accept Group Join Requests',
  type: 'group',
 },
 async (message) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply('_I am not admin_')
  const requests = await message.client.groupRequestParticipantsList(message.chat)
  if (!requests || requests.length === 0) {
   return await message.reply('No Join Requests Yet.')
  }
  let acceptedList = 'List of accepted users\n\n'
  for (const request of requests) {
   await message.client.groupRequestParticipantsUpdate(message.jid, [request.jid], 'approve')
   acceptedList += `@${request.jid.split('@')[0]}\n`
  }
  await message.reply(acceptedList, { mentions: requests.map((r) => r.jid) })
 }
)

bot(
 {
  pattern: 'reject',
  fromMe: true,
  desc: 'Reject Group Join Requests',
  type: 'group',
 },
 async (message) => {
  if (!message.isGroup) return await message.reply('_This command is for groups_')
  if (!isAdmin(message.jid, message.user, message.client)) return await message.reply('_I am not admin_')
  const requests = await message.client.groupRequestParticipantsList(message.chat)
  if (!requests || requests.length === 0) {
   return await message.reply('No Join Requests Yet.')
  }
  let rejectedList = 'List of rejected users\n\n'
  for (const request of requests) {
   await message.client.groupRequestParticipantsUpdate(message.jid, [request.jid], 'reject')
   rejectedList += `@${request.jid.split('@')[0]}\n`
  }
  await message.reply(rejectedList, { mentions: requests.map((r) => r.jid) })
 }
)
