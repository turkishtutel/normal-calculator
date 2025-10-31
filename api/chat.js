import { Configuration, OpenAIApi } from "openai";

const OPENAI_API_KEY = "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"; // replace with your key

const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: "No messages provided" });

  try {
    const response = await openai.createChatCompletion({
      model: "openai/gpt-5",
      messages,
      max_tokens: 150,
    });

    res.status(200).json({ reply: response.data.choices[0].message });
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    res.status(500).json({ error: "Failed to get AI response" });
  }
}
