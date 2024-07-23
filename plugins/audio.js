const { bot } = require('../lib')
const { editAudio } = require('../lib/functions')

const patterns = [
 { pattern: 'bass', desc: 'adds bass in given sound' },
 { pattern: 'blown', desc: 'adds blown in given sound' },
 { pattern: 'deep', desc: 'adds deep in given sound' },
 { pattern: 'earrape', desc: 'adds earrape in given sound' },
 { pattern: 'fast', desc: 'adds fast in given sound' },
 { pattern: 'fat', desc: 'adds fat in given sound' },
 { pattern: 'nightcore', desc: 'adds nightcore in given sound' },
 { pattern: 'reverse', desc: 'adds reverse in given sound' },
 { pattern: 'robot', desc: 'adds robot in given sound' },
 { pattern: 'slow', desc: 'adds slow in given sound' },
 { pattern: 'smooth', desc: 'adds smooth in given sound' },
 { pattern: 'tupai', desc: 'adds tupai in given sound' },
]

patterns.forEach(({ pattern, desc }) => {
 bot(
  {
   pattern,
   desc,
   type: 'audio',
  },
  async (audio, message, match, { command }) => {
   const result = await editAudio(audio, command, audio)
   return result
  }
 )
})
