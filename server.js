const app = require('./app')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`API 서버가 http://localhost:${PORT} 에서 실행 중`)
})
