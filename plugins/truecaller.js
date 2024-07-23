const { bot } = require('../lib/')
const truecallerDB = require('../lib/database/truecaller')
const { search } = require('../lib/database/truecaller')

bot(
 {
  pattern: 'truecaller ?(.*)',
  desc: 'search number on truecaller',
  type: 'search',
  fromMe: true,
 },
 async (message, match) => {
  const command = match || ''

  if (command.includes('login')) {
   const number = command.replace(/login/gi, '').trim()
   if (!number) {
    return await message.reply('_Please provide a number to send OTP_')
   }
   const result = await truecallerDB.setTrueCallerKey({ number })
   if (result === 'created') {
    return await message.reply(`_Successfully sent OTP to this number: ${number}_\n_Use *true otp* <key> to login_`)
   }
   return await message.reply(`*Message:* _Use *true logout* first_\n*Reason*: ${result}`)
  }

  if (command.includes('logout')) {
   await truecallerDB.trueLogout()
   return await message.reply('_Successfully logged out_')
  }

  if (command.includes('otp')) {
   const otpKey = command.replace(/otp/gi, '').trim()
   if (!otpKey) {
    return await message.reply('_Please provide an OTP_')
   }
   const result = await truecallerDB.setTrueCallerKey({ token: otpKey })
   if (result === 'updated') {
    return await message.reply('_Successfully logged into Truecaller!_')
   }
   return await message.reply(`*Message:* _Use *true logout* first_\n*Reason*: ${result}`)
  }

  const user = (message.jid || command).replace(/[^0-9]/g, '')

  if (!user) {
   return await message.reply('_Please reply to a user or provide a number_')
  }

  const response = await search(user)

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
