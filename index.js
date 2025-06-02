const express = require('express')
const app = express()
const path = require('path')
const hbsConfig = require('./utils/hbsConfig.js')


app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())


app.set('view engine', 'hbs')
app.set('views', 'templates')
app.engine('hbs', hbsConfig)


app.listen(3000, () => console.log('server started'))

app.get('/', (request, response) => response.render('main.hbs'))



process.on('SIGINT', async (err) => {
    console.log('server is dead!')
    process.exit()
})