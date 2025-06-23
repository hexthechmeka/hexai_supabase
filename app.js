const express = require('express')
const app = express()
const usageRoutes = require('./routes/usageRoutes')
const loginRoutes = require('./routes/loginRoutes')

app.use(express.json())

app.get('/', (req, res) => {
  res.send('HexAI API 서버 실행 중');
});

app.use('/login', loginRoutes)
app.use('/usage', usageRoutes)

module.exports = app
