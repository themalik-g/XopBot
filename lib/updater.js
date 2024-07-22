const newsInfo = '@ Ex Bot Works'
const simpleGit = require('simple-git')
const git = simpleGit()

const Heroku = require('heroku-client')
async function syncGit() {
 const git = simpleGit()
 await git.fetch()
 const logs = await git.log(['main..origin/main'])
 return logs
}

async function sync() {
 const git = simpleGit()
 await git.fetch()
 const logs = await git.log(['main..origin/main'])

 const formattedLogs = logs.all
  .map((commit) => {
   const date = commit.date.substring(0, 10)
   return `\`\`\` [${date}]: ${commit.message}\`\`\`\n> By: ${commit.author_name}\n`
  })
  .join('')

 return formattedLogs
}

async function updateHerokuApp() {
 try {
  const heroku = new Heroku({ token: process.env.HEROKU_API_KEY })
  await git.fetch()
  const commits = await git.log(['main..origin/main'])
  if (commits.total === 0) {
   return 'You already have latest version installed.'
  } else {
   console.log('Update Detected, trying to update your bot!')
   const app = await heroku.get(`/apps/${process.env.HEROKU_APP_NAME}`)
   const gitUrl = app.git_url.replace('https://', `https://api:${process.env.HEROKU_API_KEY}@`)
   try {
    await git.addRemote('heroku', gitUrl)
   } catch (e) {
    print('Heroku remote adding error', e)
   }
   await git.push('heroku', 'main')
   return 'Bot updated. Restarting.'
  }
 } catch (e) {
  print(e)
  return "Can't Update, Request Denied!"
 }
}
module.exports = {
 newsInfo,
 syncGit,
 sync,
 updateHerokuApp,
}
