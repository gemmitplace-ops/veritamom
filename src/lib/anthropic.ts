import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generatePaperSummaries(
  title: string,
  citation: string,
  journalName: string,
  publishedYear: number,
  fullPaperUrl?: string
): Promise<{ summary: string; summaryZh: string; summaryKo: string }> {
  const paperContext = `
Title: ${title}
Citation: ${citation}
Journal: ${journalName}
Year: ${publishedYear}
${fullPaperUrl ? `URL: ${fullPaperUrl}` : ''}
  `.trim();

  const systemPrompt = `You are a maternal health communicator who translates complex medical research into warm, accessible summaries for pregnant women and new mothers. Your summaries are:
- Written in plain English (or the target language)
- 3-4 sentences long
- Warm and reassuring in tone
- Focused on practical implications for mothers
- Free of medical jargon
- Honest about limitations`;

  const [englishSummary, chineseSummary, koreanSummary] = await Promise.all([
    client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please write a plain-English summary of this research paper for pregnant women and new mothers:\n\n${paperContext}`,
        },
      ],
    }),
    client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please write a plain-language summary in Simplified Chinese (简体中文) of this research paper for pregnant women and new mothers:\n\n${paperContext}`,
        },
      ],
    }),
    client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please write a plain-language summary in Korean (한국어) of this research paper for pregnant women and new mothers:\n\n${paperContext}`,
        },
      ],
    }),
  ]);

  return {
    summary:
      englishSummary.content[0].type === 'text'
        ? englishSummary.content[0].text
        : '',
    summaryZh:
      chineseSummary.content[0].type === 'text'
        ? chineseSummary.content[0].text
        : '',
    summaryKo:
      koreanSummary.content[0].type === 'text'
        ? koreanSummary.content[0].text
        : '',
  };
}
