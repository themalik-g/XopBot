const axios = require('axios')
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

bot(
 {
  pattern: 'weather',
  fromMe: isPrivate,
  desc: 'Get weather information for a location',
  type: 'tools',
 },
 async (message, match) => {
  if (!match) return await message.reply('*Please provide a place to search*')

  try {
   const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${match}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`)
   const res = response.data

   const name = res.name
   const Country = res.sys.country
   const Weather = res.weather[0].description
   const Temperature = res.main.temp + '°C'
   const Minimum_Temperature = res.main.temp_min + '°C'
   const Maximum_Temperature = res.main.temp_max + '°C'
   const Humidity = res.main.humidity + '%'
   const Wind = res.wind.speed + 'km/h'

   const weatherInfo = `「 📍 」PLACE: ${name}\n「 🗺️ 」COUNTRY: ${Country}\n「 🌤️ 」VIEW: ${Weather}\n「 🌡️ 」TEMPERATURE: ${Temperature}\n「 💠 」 MINIMUM TEMPERATURE: ${Minimum_Temperature}\n「 📛 」 MAXIMUM TEMPERATURE: ${Maximum_Temperature}\n「 💦 」HUMIDITY: ${Humidity}\n「 🌬️ 」 WINDSPEED: ${Wind}\n\n©WEATHER-BOT`

   return await message.reply(weatherInfo)
  } catch (error) {
   console.error('Error fetching weather data:', error)
   return await message.reply('*ERROR: Unable to fetch weather data*')
  }
 }
)
