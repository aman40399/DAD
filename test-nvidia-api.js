// Test NVIDIA API to see available models and correct format
const API_KEY = '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'

const modelsToTry = [
  'meta/llama-3.1-405b-instruct',
  'meta/llama-3.1-70b-instruct',
  'meta/llama-3.1-8b-instruct',
  'nvidia/llama-3.1-nemotron-70b-instruct',
  'mistralai/mixtral-8x7b-instruct-v0.1',
  'google/gemma-2-9b-it',
]

async function testModel(model) {
  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: 'Say "Hello"' }
        ],
        max_tokens: 10,
      })
    })
    
    const data = await response.json()
    console.log(`✅ ${model}: SUCCESS`, data.choices?.[0]?.message?.content || 'Working')
    return true
  } catch (error) {
    console.log(`❌ ${model}: FAILED`, error.message)
    return false
  }
}

async function testAll() {
  console.log('Testing NVIDIA API models...\n')
  for (const model of modelsToTry) {
    await testModel(model)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 sec between tests
  }
}

testAll()
