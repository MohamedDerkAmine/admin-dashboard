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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## AI Product Content Assistant

The AI Product Content Assistant helps ecommerce admins draft product titles,
descriptions, SEO fields, tags, category suggestions, image alt text, and a
marketing summary from basic product information.

The feature uses the official Google GenAI SDK and keeps the Gemini API key on
the server. The browser calls the internal Next.js route
`POST /api/ai/product-content`; it never calls Gemini directly.

### Setup

1. Get a Gemini API key from Google AI Studio:
   https://aistudio.google.com/app/apikey
2. Add the key to `.env.local`:

```bash
GEMINI_API_KEY=your_gemini_key
```

Do not use `NEXT_PUBLIC_GEMINI_API_KEY`. Environment variables without the
`NEXT_PUBLIC_` prefix stay server-side by default in Next.js.

3. Install dependencies:

```bash
npm install
```

4. Run the development server:

```bash
npm run dev
```

5. Open:

```text
http://localhost:3000/dashboard/products/new
```

### Manual Test

Fill the assistant with:

- Product name: Wireless Noise Cancelling Headphones
- Product type: Electronics
- Target audience: commuters and remote workers
- Key features: 40 hour battery, bluetooth 5.3, active noise cancellation, foldable design
- Brand tone: professional

Click **Generate with AI**, confirm generated content appears, then click
**Apply** and confirm the product form fields are filled. In browser devtools,
the Gemini key should never appear in requests or client source.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
