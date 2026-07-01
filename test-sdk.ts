import OpenAI from 'openai';
async function test() {
  const client = new OpenAI({ apiKey: 'dummy', baseURL: 'http://127.0.0.1:8080/v1' });
  try {
    const res = await client.models.list();
    console.log(res.data);
  } catch (e: any) {
    console.error(e.message);
  }
}
test();
