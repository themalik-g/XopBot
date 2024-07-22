const newsInfo = '@ Ex Bot Works'
const simpleGit = require('simple-git')
const git = simpleGit()
let updateMessage = '_Bot Already UptoDate_'
async function syncGit() {
 const git = simpleGit()
 await git.fetch()
 const logs = await git.log(['master..origin/master'])
 return logs
}

async function sync() {
 const git = simpleGit()
 await git.fetch()
 const logs = await git.log(['master..origin/master'])

 const formattedLogs = logs.all
  .map((commit) => {
   const date = commit.date.substring(0, 10)
   return `\`\`\` [${date}]: ${commit.message}\`\`\`\n> By: ${commit.author_name}\n`
  })
  .join('')

 return formattedLogs
}

async function updateHerokuApp() {
 const heroku = new Heroku({ token: process.env.HEROKU_API_KEY })
 await git.fetch()
 const commits = await git.log(['master..origin/master'])
 if (commits.total === 0) {
  return updateMessage
 } else {
  console.log('Update Detected, trying to update your bot!')
  const app = await heroku.get(`/apps/${process.env.HEROKU_APP_NAME}`)
  const gitUrl = app.git_url.replace('https://', `https://api:${process.env.HEROKU_API_KEY}@`)
  await git.addRemote('heroku', gitUrl)
  await git.push('heroku', 'master')
  return 'Bot updated. Restarting.'
 }
}
module.exports = {
 newsInfo,
 syncGit,
 sync,
 updateHerokuApp,
}
