const supabase = require('./db')

async function insertUsage(userId) {
  const { data, error } = await supabase
    .from('llm_usage')
    .insert([
      {
        user_id: userId,
        question: '테스트 질문',
        response: '테스트 응답',
        model: 'gpt-4',
        tokens_in: 20,
        tokens_out: 25,
        cost_usd: 0.03,
        cost_krw: 39.0
      }
    ])
    .select()

  if (error) {
    console.error('Insert error:', error)
    return null
  }

  console.log('Inserted data:', data)
  return data[0]
}

async function updateUsage(id) {
  const { data, error } = await supabase
    .from('llm_usage')
    .update({ response: '수정된 응답' })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Update error:', error)
    return null
  }

  console.log('Updated data:', data)
  return data[0]
}

async function deleteUsage(id) {
  const { data, error } = await supabase
    .from('llm_usage')
    .delete()
    .eq('id', id)
    .select()

  if (error) {
    console.error('Delete error:', error)
    return null
  }

  console.log('Deleted data:', data)
  return data[0]
}

async function selectAll() {
  const { data, error } = await supabase
    .from('llm_usage')
    .select('*')

  if (error) {
    console.error('Select error:', error)
    return []
  }

  console.log('Fetched data:', data)
  return data
}

module.exports = { insertUsage, updateUsage, deleteUsage, selectAll }
