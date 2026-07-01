import OpenAI from 'openai';
async function test() {
  const client = new OpenAI({ apiKey: 'dummy', baseURL: 'http://127.0.0.1:8080/v1' });
  const modelId = 'mlx-community/Qwen3.5-9B-OptiQ-4bit';
  try {
    console.log('Using model:', modelId);
    const res = await client.chat.completions.create({
      model: modelId,
      messages: [
        { role: 'system', content: 'You must reply in JSON format like {"hi": "world"}' },
        { role: 'user', content: 'Say hello' },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    });
    console.log(res.choices[0].message.content);
  } catch (e: any) {
    console.error(e.message);
  }
}
test();
