// server.js: API 서버 시작 파일

const app = require('./app') // Express 앱 불러오기

const PORT = process.env.PORT || 3000

// 서버 실행
app.listen(PORT, () => {
  console.log(`API 서버가 http://localhost:${PORT} 에서 실행 중`)
})