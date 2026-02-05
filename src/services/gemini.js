// Gemini AI Service for generating comments
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate content using Gemini API
 * @param {string} apiKey - Gemini API key
 * @param {string} prompt - The prompt to generate content from
 * @returns {Promise<string>} Generated text
 */
export async function generateContent(apiKey, prompt) {
    if (!apiKey) {
        throw new Error('API key is required');
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to generate content');
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error('No content generated');
        }

        return generatedText.trim();
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

/**
 * Generate multiple comments using a template
 * @param {string} apiKey - Gemini API key
 * @param {string} template - Prompt template with {{variables}}
 * @param {object} variables - Variables to replace in template
 * @param {number} count - Number of comments to generate
 * @returns {Promise<string[]>} Array of generated comments
 */
export async function generateComments(apiKey, template, variables, count = 1) {
    // Replace variables in template
    let prompt = template;
    for (const [key, value] of Object.entries(variables)) {
        prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    // Add instruction to generate multiple unique comments
    const fullPrompt = `${prompt}

Hãy tạo ${count} comment khác nhau, mỗi comment trên một dòng riêng. 
Đánh số từ 1 đến ${count}.
Mỗi comment phải độc đáo và tự nhiên.`;

    const result = await generateContent(apiKey, fullPrompt);

    // Parse numbered comments
    const comments = result
        .split(/\n/)
        .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(line => line.length > 10);

    return comments.slice(0, count);
}

/**
 * Regenerate a single comment with feedback
 * @param {string} apiKey - Gemini API key
 * @param {string} originalContent - Original comment content
 * @param {string} feedback - User feedback for improvement
 * @returns {Promise<string>} Regenerated comment
 */
export async function regenerateWithFeedback(apiKey, originalContent, feedback) {
    const prompt = `Đây là comment gốc:
"${originalContent}"

Feedback từ người dùng: ${feedback}

Hãy viết lại comment này dựa trên feedback, giữ nguyên ý chính nhưng cải thiện theo yêu cầu.
Chỉ trả về comment mới, không cần giải thích.`;

    return await generateContent(apiKey, prompt);
}

/**
 * Generate post suggestions based on a topic
 * @param {string} apiKey - Gemini API key
 * @param {string} topic - The main topic/theme for the post
 * @param {string} productName - Product or brand name
 * @param {string} style - Writing style
 * @param {number} count - Number of suggestions to generate
 * @returns {Promise<Array<{title: string, content: string, hashtags: string[]}>>}
 */
export async function generatePostSuggestions(apiKey, topic, productName, style = 'trẻ trung, năng động', count = 3) {
    const prompt = `Bạn là chuyên gia marketing, tạo ${count} gợi ý bài đăng cho:

Chủ đề: ${topic}
Sản phẩm: ${productName}
Phong cách: ${style}

Yêu cầu mỗi bài:
1. Tiêu đề hấp dẫn
2. Nội dung 100-200 từ, có emoji
3. 3-5 hashtags

Trả về JSON array (chỉ JSON):
[{"title": "...", "content": "...", "hashtags": ["#tag1", "#tag2"]}]`;

    const result = await generateContent(apiKey, prompt);

    try {
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(result);
    } catch (error) {
        console.error('Failed to parse:', result);
        return [{
            title: topic,
            content: result,
            hashtags: ['#' + productName.replace(/\s+/g, '')]
        }];
    }
}

/**
 * Generate full post content from a suggestion
 */
export async function generateFullPost(apiKey, title, topic, productName, additionalContext = '') {
    const prompt = `Viết bài đăng Facebook/Instagram hoàn chỉnh:

Tiêu đề: ${title}
Chủ đề: ${topic}
Sản phẩm: ${productName}
${additionalContext ? `Thêm: ${additionalContext}` : ''}

Yêu cầu:
- 150-300 từ, tự nhiên, có emoji
- Kết thúc với call-to-action
- 5-7 hashtags

Trả về JSON: {"content": "...", "hashtags": ["#tag1", ...]}`;

    const result = await generateContent(apiKey, prompt);

    try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(result);
    } catch (error) {
        return { content: result, hashtags: [] };
    }
}
