const supabase = require('../db')
const { successResponse, errorResponse } = require('../tools/responseHelper')

// 새로운 사용 내역 생성
exports.createUsage = async (req, res) => {
  const { user_id, question, response, model, tokens_in, tokens_out, cost_usd, cost_krw, meta } = req.body

  const { data, error } = await supabase
    .from('llm_usage')
    .insert([{ user_id, question, response, model, tokens_in, tokens_out, cost_usd, cost_krw, meta }])
    .select()
    .single()

  if (error) {
    return errorResponse(res, 'ERR_CREATE_USAGE', error.message, 400)
  }

  successResponse(res, data, '사용 내역이 성공적으로 생성되었습니다.')
}

// 전체 사용 내역 조회
exports.getAllUsage = async (req, res) => {
  const { data, error } = await supabase.from('llm_usage').select('*')

  if (error) {
    return errorResponse(res, 'ERR_GET_ALL_USAGE', error.message, 500)
  }

  successResponse(res, data, '전체 사용 내역 조회 성공')
}

// 특정 사용 내역 조회
exports.getUsageById = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('llm_usage')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return errorResponse(res, 'ERR_USAGE_NOT_FOUND', '사용 내역을 찾을 수 없습니다.', 404)
  }

  successResponse(res, data, '사용 내역 조회 성공')
}

// 사용 내역 수정
exports.updateUsage = async (req, res) => {
  const { id } = req.params
  const { response } = req.body

  const { data, error } = await supabase
    .from('llm_usage')
    .update({ response })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return errorResponse(res, 'ERR_UPDATE_USAGE', error.message, 400)
  }

  successResponse(res, data, '사용 내역이 성공적으로 수정되었습니다.')
}

// 사용 내역 삭제
exports.deleteUsage = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('llm_usage')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return errorResponse(res, 'ERR_DELETE_USAGE', error.message, 400)
  }

  successResponse(res, data, '사용 내역이 성공적으로 삭제되었습니다.')
}
