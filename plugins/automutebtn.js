const { bot } = require('../lib')

bot(
 {
  pattern: 'togglemute',
  fromMe: true,
  desc: 'Toggle automute settings',
  type: 'group',
 },
 async (message) => {
  const buttons = [
   { type: 'reply', params: { display_text: 'Enable Automute', id: 'automute on' } },
   { type: 'reply', params: { display_text: 'Disable Automute', id: 'automute off' } },
  ]

  const data = {
   jid: message.jid,
   button: buttons,
   header: { title: 'Automute Settings', subtitle: 'Toggle Automute' },
   footer: { text: 'Choose an option' },
   body: { text: 'Toggle automute settings for this group' },
  }

  await message.sendMessage(message.jid, data, {}, 'interactive')
 }
)

bot(
 {
  pattern: 'toggleunmute',
  fromMe: true,
  desc: 'Toggle autounmute settings',
  type: 'group',
 },
 async (message) => {
  const buttons = [
   { type: 'reply', params: { display_text: 'Enable Autounmute', id: 'autounmute on' } },
   { type: 'reply', params: { display_text: 'Disable Autounmute', id: 'autounmute off' } },
  ]

  const data = {
   jid: message.jid,
   button: buttons,
   header: { title: 'Autounmute Settings', subtitle: 'Toggle Autounmute' },
   footer: { text: 'Choose an option' },
   body: { text: 'Toggle autounmute settings for this group' },
  }

  await message.sendMessage(message.jid, data, {}, 'interactive')
 }
)
