const { bot } = require('../lib/index')

bot({
    pattern: 'twitter',
    desc: 'Downloads Twitter Videos & Images',
    type: 'download',
},
)