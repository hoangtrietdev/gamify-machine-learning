# ml-gamify

ml-gamify is an interactive Next.js project that helps people learn practical machine learning workflows by gamifying two core skills:

- preparing datasets for training (exploration, preprocessing, splitting)
- tuning hyperparameters for model training (learning rate, batch size, epochs, etc.)

The app provides UI panels to inspect datasets, adjust preprocessing options and hyperparameters, then run simulated or real training sessions to see the effects of those choices.

## About

This repository is intended as an educational playground for people who want hands-on experience with data preparation and hyperparameter tuning. It includes components such as `HyperparameterPanel`, `TrainingPanel`, and dataset views that make it easy to experiment and learn by doing.

## How it helps

- Visualize and explore datasets to understand distribution and common issues.
- Apply basic preprocessing and dataset splits to prepare data for training.
- Adjust hyperparameters interactively and observe their impact on training behaviour and results.
- A gamified feedback loop (scores/ratings) to reinforce learning through experimentation.

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

Open [http://localhost:3000](http://localhost:3000) with your browser.

To try the interactive experience, open the play route for a dataset, for example `/play/<datasetId>`.

You can start editing the app by modifying pages like `pages/index.tsx` or components under `components/game/`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
