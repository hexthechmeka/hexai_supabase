const readline = require('readline')
const supabase = require('./db')

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise(resolve => rl.question(query, ans => {
    rl.close()
    resolve(ans)
  }))
}

async function login() {
  const email = await askQuestion('이메일 입력: ')
  const password = await askQuestion('비밀번호 입력: ')

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('Login error:', error)
    return null
  }

  console.log('Logged in user:', data.user)
  return data.user
}

module.exports = { login }
