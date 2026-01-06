This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000]postgresql://postgres.qnfoougnzoaatjqpdoau:YPVQ*rNPx7jN_Yq@aws-1-eu-central-1.pooler.supabase.com:6543/postgres) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## AI Provider

This project is currently configured to use the Google Gemini (Generative Language) API as the LLM and embedding provider. The code was updated to use `GEMINI_API_KEY` and the Generative Language endpoints. If you prefer to use OpenAI instead (or switch back and forth), follow the instructions below.

- To use Gemini (current setup):
	- Add your Gemini API key to `.env.local` as `GEMINI_API_KEY`.
	- Restart the dev server: `npm run dev`.

- To switch to OpenAI:
	1. Add your OpenAI API key to `.env.local` as `OPENAI_API_KEY`.
	2. Update `src/lib/services/index.ts` to pass `process.env.OPENAI_API_KEY` for `llmService` and `embeddingService`:

```ts
export const llmService = createLLMService({
	config: { ...LLM_CONFIG, apiKey: process.env.OPENAI_API_KEY },
});

export const embeddingService = createEmbeddingService({
	config: { ...EMBEDDING_CONFIG, apiKey: process.env.OPENAI_API_KEY },
});
```

	3. Update LLM config to an OpenAI model in `src/lib/services/ai/config.ts`:

```ts
export const LLM_CONFIG = {
	model: "gpt-4",
	temperature: 0.7,
	maxTokens: 1000,
	defaultProvider: "openai",
} as const;
```

	4. Update embedding config in `src/lib/services/embedding/config.ts`:

```ts
export const EMBEDDING_CONFIG = {
	model: "text-embedding-3-small",
	dimensions: 1536,
	provider: "openai",
} as const;
```

	5. Revert the API calls in `src/lib/services/ai/service.ts` and `src/lib/services/embedding/service.ts` to use OpenAI endpoints. For example, in `ai/service.ts` use:

```ts
const response = await fetch("https://api.openai.com/v1/chat/completions", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${llmConfig.apiKey || process.env.OPENAI_API_KEY}`,
	},
	body: JSON.stringify(formattedRequest),
});
```

and in `embedding/service.ts` use `https://api.openai.com/v1/embeddings` similarly.

	6. Restart the dev server.

- To switch back to Gemini (the current configuration):
	1. Add `GEMINI_API_KEY` to `.env.local`.
	2. Update `src/lib/services/index.ts` so `llmService` and `embeddingService` use `process.env.GEMINI_API_KEY`.
	3. Ensure `src/lib/services/ai/config.ts` uses a Gemini model (for example `gemini-2.0-flash`) and `defaultProvider: "gemini"`.
	4. Ensure `src/lib/services/ai/service.ts` and `src/lib/services/embedding/service.ts` call the Generative Language endpoints and parse their response formats.
	5. Restart the dev server.

If you'd like, I can apply the reversible edits to switch the repo automatically between the two providers (or create a small runtime toggle). Which would you prefer?
