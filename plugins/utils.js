const { bot, qrcode, Bitly, isPrivate, isUrl, readQr } = require('../lib')
const formatRuntime = require('./_menu')
bot(
 {
  pattern: 'qr',
  fromMe: isPrivate,
  desc: 'Read/Write Qr.',
  type: 'utils',
 },
 async (message, match, m) => {
  match = match || message.reply_message.text

  if (match) {
   let buff = await qrcode(match)
   return await message.sendMessage(message.jid, buff, {}, 'image')
  } else if (message.reply_message.image) {
   const buffer = await m.quoted.download()
   readQr(buffer)
    .then(async (data) => {
     return await message.sendMessage(message.jid, data)
    })
    .catch(async (error) => {
     console.error('Error:', error.message)
     return await message.sendMessage(message.jid, error.message)
    })
  } else {
   return await message.sendMessage(message.jid, '*Example : qr test*\n*Reply to a qr image.*')
  }
 }
)

bot(
 {
  pattern: 'bitly',
  fromMe: isPrivate,
  desc: 'Converts Url to bitly',
  type: 'utils',
 },
 async (message, match) => {
  match = match || message.reply_message.text
  if (!match) return await message.reply('_Reply to a url or enter a url_')
  if (!isUrl(match)) return await message.reply('_Not a url_')
  let short = await Bitly(match)
  return await message.reply(short.link)
 }
)

bot(
 {
  pattern: 'repo',
  info: 'Sends info about repo',
  type: 'utils',
 },
 async (message) => {
  const { data } = await axios.get('https://api.github.com/repos/AstroAnalytics/XopBot')
  let repo = 'https://github.com/EX-BOTS/Zenon-bot'
  const repoInfo = `
   ᴢᴇɴᴏɴ ᴠ𝟷
 ╭──────────────
 │ ᴜsᴇʀ : ${message.pushName}
 │ sᴛᴀʀs : ${data?.stargazers_count} stars
 │ ғᴏʀᴋs : ${data?.forks_count} forks
 │ ʀᴇᴘᴏ : ${repo}
 │ ᴜᴘᴛɪᴍᴇ : ${formatRuntime(process.uptime())}
 ╰────────────── 
   `.trim()

  return await message.sendMessage(message.jid, {
   caption: repoInfo,
  })
 }
)
