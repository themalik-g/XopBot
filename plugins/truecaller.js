const { bot } = require('../lib/')
const { truecaller } = require('../lib/database/truecaller')

bot(
 {
  pattern: 'truecaller ?(.*)',
  desc: 'search number on truecaller',
  type: 'search',
  fromMe: true,
 },
 async (message, match) => {
  if (match.match(/login/gi)) {
   match = match.replace(/login/gi, '').trim()
   if (!match) {
    return await message.reply('_Please provide a number to send OTP_')
   }
   const result = await truecaller.set(match)
   if (result === true) {
    return await message.reply(`_Successfully sent OTP to this number: ${match}_\n_Use *true otp* <key> to login_`)
   }
   return await message.reply(`*Message:* _Use *true logout* first_\n*Reason*: ${result}`)
  }

  if (match.match(/logout/gi)) {
   await truecaller.logout()
   return await message.reply('_Successfully logged out_')
  }

  if (match.match(/otp/gi)) {
   match = match.replace(/otp/gi, '').trim()
   if (!match) {
    return await message.reply('_Please provide an OTP_')
   }
   const result = await truecaller.otp(match)
   if (result === true) {
    return await message.reply('_Successfully logged into Truecaller!_')
   }
   return await message.reply(`*Message:* _Use *true logout* first_\n*Reason*: ${result}`)
  }

  const user = (message.mention.jid?.[0] || message.reply_message.mention.jid?.[0] || message.reply_message.reply || match).replace(/[^0-9]/g, '')

  if (!user) {
   return await message.reply('_Please reply to a user or provide a number_')
  }

  const response = await truecaller.search(user)

  if (!response.status) {
   return await message.reply(response.message)
  }

  let messageText = `╭─❮ Truecaller ❯ ❏\n`
  delete response.status

  for (const key in response) {
   messageText += `│ ${key.toLowerCase()}: ${response[key]}\n`
  }
  messageText += `╰─❏`

  return await message.reply('```' + messageText + '```', { quoted: message.data })
 }
)
