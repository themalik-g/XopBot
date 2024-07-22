const { bot, isPrivate } = require('../lib')
const sys = require('../lib/updater')
bot(
 {
  pattern: 'isupdate',
  fromMe: isPrivate,
  desc: 'Get Update From Devs',
  type: 'updater',
 },
 async (message, match) => {
  let commits = await sys.syncGit()
  if (commits.total === 0) return await message.reply(`_Bot is UptoDate_`)
  let update = await sys.sync()
  await message.reply(`${update}`)

  if (match == 'redeploy' && process.env.HEROKU_APP_NAME && process.env.HEROKU_API_KEY) {
   await message.reply('_Redeploying Bot, this may take a while!_')
   const update = await updateHerokuApp()
   return await message.reply(update)
  }
 }
)
bot(
 {
  pattern: 'update',
  fromMe: isPrivate,
  desc: 'Update Your Bot Now!',
  type: 'updater',
 },
 async (message) => {
  let commits = await sys.syncGit()
  if (commits.total === 0) return await message.reply(`_Bot is UptoDate_`)
  let update = await sys.sync()
  let text = `> Updated Started\n\n${update}`
  await message.client.sendMessage(message.jid, { text })
  await require('simple-git')().reset('hard', ['HEAD'])
  await require('simple-git')().pull('origin', 'master')
  await message.reply(`_Bot Updated, Restart Now!_`)
 }
)
