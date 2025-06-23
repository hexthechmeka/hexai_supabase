const supabase = require('../db')

// 인증을 처리하는 미들웨어 함수
async function authMiddleware(req, res, next) {
  // Authorization 헤더 가져오기
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization 헤더가 없습니다.' })
  }

  // Bearer 토큰 분리
  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: '유효하지 않은 Authorization 헤더입니다.' })
  }

  try {
    // Supabase를 통해 사용자 인증
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' })
    }

    // 사용자 정보를 요청 객체에 추가
    req.user = data.user

    // 다음 미들웨어 또는 라우트로 이동
    next()
  } catch (err) {
    console.error('인증 미들웨어 오류:', err)
    res.status(500).json({ error: '인증 처리 중 서버 오류가 발생했습니다.' })
  }
}

module.exports = authMiddleware
