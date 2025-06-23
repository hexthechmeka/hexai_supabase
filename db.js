// db.js: Supabase 클라이언트 연결 설정

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// .env의 값 불러오기 (기존 SUPABASE_ANON_KEY 유지)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

console.log('SUPABASE_URL:', supabaseUrl)
console.log('SUPABASE_KEY:', supabaseKey ? 'Loaded' : 'Missing')

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase
