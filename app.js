// app.js: Express 앱 설정

const express = require('express')
const app = express()
const usageRoutes = require('./routes/usageRoutes')
const loginRoutes = require('./routes/loginRoutes')

// JSON 요청 본문 파싱
app.use(express.json())
app.use('/login', loginRoutes)

// 라우터 연결
app.use('/', usageRoutes)

module.exports = app