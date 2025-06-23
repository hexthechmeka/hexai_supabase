const express = require('express')
const authMiddleware = require('./authMiddleware')
// 기존 require들은 그대로 유지

const app = express()
app.use(express.json())

app.post('/login', async (req, res) => { /* 기존 코드 */ })

// usage API는 모두 보호
app.post('/usage', authMiddleware, async (req, res) => { /* 기존 코드 */ })
app.put('/usage/:id', authMiddleware, async (req, res) => { /* 기존 코드 */ })
app.delete('/usage/:id', authMiddleware, async (req, res) => { /* 기존 코드 */ })
app.get('/usage', authMiddleware, async (req, res) => { /* 기존 코드 */ })

app.listen(3000, () => console.log('API 서버가 http://localhost:3000 에서 실행 중'))
