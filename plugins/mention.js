const { bot } = require('../lib/')
const { getMentionMessage, enableMention, clearFiles, getMention } = require('../lib/database/mention')
bot(
 {
  pattern: 'mention ?(.*)',
  fromMe: true,
  desc: 'To set and Manage mention',
  type: 'misc',
 },
 async (message, match) => {
  if (!match) {
   const mention = await getMention()
   const onOrOff = mention && mention.enabled ? 'on' : 'off'
   return await message.send(`Mention is ${onOrOff}\n`)
  }
  if (match == 'get') {
   const msg = await getMentionMessage()
   if (!msg) return await message.send('_Reply to Mention not Activated._')
   return await message.send(msg)
  } else if (match == 'on' || match == 'off') {
   await enableMention(match == 'on')
   return await message.send(`_Reply to mention ${match == 'on' ? 'Activated' : 'Deactivated'}_`)
  }
  await enableMention(match)
  clearFiles()
  return await message.send('_Mention Updated_')
 }
)
