const OpenAIApi = require('openai');
const Configuration = require('openai');
class OpenAI {
    constructor(apiKey) {
        this.openai = new OpenAIApi(new Configuration({ apiKey }));
    }
    async generateText(prompt, model, max_tokens, temperature = 1) {
        try {
            const response = await this.openai.chat.completions.create({
                messages: prompt,
                model: model,
                max_tokens: max_tokens,
                n: 1,
                temperature: temperature,
            });
            console.log(`request cost: ${response.usage.total_tokens} tokens`);
            console.log(`prompt cost: ${response.usage.prompt_tokens} tokens`);
            console.log(`completion cost: ${response.usage.completion_tokens} tokens`);
            return response.choices[0].message.content;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = { OpenAI };