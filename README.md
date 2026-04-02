STATUS : development

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## MVP Notes / Later

- **Blob / Organic card container** (gooey/liquid UI): implement an “organic” card shape (like the reference chip-card) as a renderer style option (e.g. `style: blob` / `style: organic`), ideally via an SVG path (`fabric.Path` / `loadSVGFromString`) or a quick MVP version by composing rounded-rect + circles with matching fill.
- **Image generation / replacement:** allow users to generate (or swap) images for `media` blocks (hero images, card thumbnails) via an image-gen step, without changing the layout geometry (`bbox` stays fixed).

## Getting Started

This repo has **two** dev servers:
- Next.js frontend (default: `http://localhost:3000`)
- Express + WebSocket realtime AI backend (from `backend/.env`, default: `http://localhost:4000`)

Start the frontend with:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Start the backend separately in another terminal:

```bash
npm run dev:backend
```

Optional: start both together:

```bash
npm run dev:all
```

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
