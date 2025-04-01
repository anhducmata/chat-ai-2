# MataChat

An AI-powered search engine with a generative UI.
Demo: ducmata.com

## 🛠 Features

- AI-powered search with GenerativeUI
- Multiple models (OpenAI, Google, Anthropic, xAI, etc.)
- Multiple search providers (Tavily, SearXNG, Exa)
- Video search support
- Shareable results
- Browser search engine integration

## 🧱 Stack

- **Framework**: Next.js, TypeScript, Vercel AI SDK
- **AI/Search**: OpenAI, Tavily, SearXNG, Exa
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Storage**: Upstash Redis (optional)

## 🚀 Quickstart

1. **Clone repo**
   ```bash
   git clone https://github.com/your-username/chat-ai.git
   cd chat-ai
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   ```
   Required variables:
   ```
   OPENAI_API_KEY=     # From https://platform.openai.com/api-keys
   TAVILY_API_KEY=     # From https://app.tavily.com/home
   ```

4. **Run locally**
   ```bash
   bun dev
   # or
   docker compose up -d
   ```

## 🌐 Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmiurla%2Fchat-ai&env=OPENAI_API_KEY,TAVILY_API_KEY,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN)

### Docker
```bash
docker pull ghcr.io/miurla/chat-ai:latest
```

## 📑 License

Apache-2.0 license
