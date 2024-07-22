const { bot, getLyrics, isPrivate } = require('../lib')

bot(
 {
  pattern: 'lyric',
  fromMe: isPrivate,
  desc: 'Searches for lyrics based on the format: song;artist',
  type: 'search',
 },
 async (message, match) => {
  const [song, artist] = match.split(';').map((item) => item.trim())
  if (!song || !artist) {
   await message.reply('Search with this format: \n\t_lyric song;artist_')
  } else {
   try {
    const data = await getLyrics(song, artist)
    if (data) {
     return await message.reply(`*Artist:* ${data.artist_name}\n*Song:* ${data.song}\n*Lyrics:*\n${data.lyrics.trim()}`)
    } else {
     return await message.reply('No lyrics found for this song by this artist.')
    }
   } catch (error) {
    return await message.reply('An error occurred while fetching lyrics.')
   }
  }
 }
)
