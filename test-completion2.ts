import OpenAI from 'openai';
async function test() {
  const client = new OpenAI({ apiKey: 'dummy', baseURL: 'http://127.0.0.1:8080/v1' });
  const modelId = 'mlx-community/Qwen3.5-9B-OptiQ-4bit';
  try {
    const res = await client.chat.completions.create({
      model: modelId,
      messages: [{ role: 'user', content: 'Say hello' }],
      temperature: 0,
    });
    console.log(JSON.stringify(res, null, 2));
  } catch (e: any) {
    console.error(e.message);
  }
}
test();
