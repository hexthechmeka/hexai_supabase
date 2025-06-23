const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());  // body 파서를 모든 라우트보다 위에 적용

const usageRoutes = require('./routes/usageRoutes');
const loginRoutes = require('./routes/loginRoutes');
const gptRoutes = require('./routes/gptRoutes');

app.use('/api', gptRoutes);
app.use('/login', loginRoutes);
app.use('/usage', usageRoutes);

app.get('/', (req, res) => {
  res.send('HexAI API 서버 실행 중');
});

module.exports = app;
