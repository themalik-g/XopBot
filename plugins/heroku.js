const got = require('got')
const Heroku = require('heroku-client')
const { bot } = require('../lib/')
const Config = require('../config')
const heroku = new Heroku({ token: Config.HEROKU_API_KEY })
const { secondsToDHMS } = require('../lib/functions')

function checkHerokuConfig(message) {
 if (!Config.HEROKU || !Config.HEROKU_APP_NAME || !Config.HEROKU_API_KEY) {
  message.reply('Your Heroku is not configured properly')
  return false
 }
 return true
}

bot(
 {
  pattern: 'dyno',
  fromMe: true,
  desc: 'Show Quota info',
  type: 'heroku',
 },
 async (message) => {
  if (!checkHerokuConfig(message)) return

  const account = await heroku.get('/account')
  const url = `https://api.heroku.com/accounts/${account.id}/actions/get-quota`
  const headers = {
   'User-Agent': 'Chrome/80.0.3987.149 Mobile Safari/537.36',
   Authorization: 'Bearer ' + Config.HEROKU_API_KEY,
   Accept: 'application/vnd.heroku+json; version=3.account-quotas',
  }
  const res = await got(url, { headers })
  const resp = JSON.parse(res.body)
  const total_quota = Math.floor(resp.account_quota)
  const quota_used = Math.floor(resp.quota_used)
  const remaining = total_quota - quota_used
  const quota = `Total Quota : ${secondsToDHMS(total_quota)}
Used  Quota : ${secondsToDHMS(quota_used)}
Remaning    : ${secondsToDHMS(remaining)}`
  await message.reply('```' + quota + '```')
 }
)

bot(
 {
  pattern: 'getvar',
  fromMe: true,
  desc: 'Get a specific environment variable',
  type: 'heroku',
 },
 async (message, match) => {
  if (!checkHerokuConfig(message)) return
  if (!match[1]) {
   await message.reply('Please specify a variable name')
   return
  }

  const app = await heroku.get(`/apps/${Config.HEROKU_APP_NAME}`)
  const config = await heroku.get(`/apps/${app.id}/config-vars`)

  if (match[1] in config) {
   await message.reply(`${match[1]}: ${config[match[1]]}`)
  } else {
   await message.reply(`Variable ${match[1]} not found`)
  }
 }
)

bot(
 {
  pattern: 'setvar',
  fromMe: true,
  desc: 'Set or update an environment variable',
  type: 'heroku',
 },
 async (message, match) => {
  if (!checkHerokuConfig(message)) return

  const [varName, varValue] = match[1].split('=').map((item) => item.trim())
  if (!varName || !varValue) {
   await message.reply('Usage: setvar NAME=VALUE')
   return
  }

  await heroku.patch(`/apps/${Config.HEROKU_APP_NAME}/config-vars`, {
   body: {
    [varName]: varValue,
   },
  })
  await message.reply(`Variable ${varName} set to ${varValue}`)
 }
)

bot(
 {
  pattern: 'delvar',
  fromMe: true,
  desc: 'Remove an environment variable',
  type: 'heroku',
 },
 async (message, match) => {
  if (!checkHerokuConfig(message)) return
  if (!match[1]) {
   await message.reply('Please specify a variable name to remove')
   return
  }

  await heroku.patch(`/apps/${Config.HEROKU_APP_NAME}/config-vars`, {
   body: {
    [match[1]]: null,
   },
  })
  await message.reply(`Variable ${match[1]} removed`)
 }
)

bot(
 {
  pattern: 'allvars',
  fromMe: true,
  desc: 'List all environment variables',
  type: 'heroku',
 },
 async (message) => {
  if (!checkHerokuConfig(message)) return

  const app = await heroku.get(`/apps/${Config.HEROKU_APP_NAME}`)
  const config = await heroku.get(`/apps/${app.id}/config-vars`)

  let varList = 'Environment Variables:\n'
  for (const [key, value] of Object.entries(config)) {
   varList += `${key}: ${value}\n`
  }

  await message.reply(varList)
 }
)

bot(
 {
  pattern: 'dynor',
  fromMe: true,
  desc: 'Restart the Heroku dyno',
  type: 'heroku',
 },
 async (message) => {
  if (!checkHerokuConfig(message)) return

  await message.reply('Restarting dyno...')
  await heroku.delete(`/apps/${Config.HEROKU_APP_NAME}/dynos`)
  await message.reply('Dyno restarted successfully')
 }
)
