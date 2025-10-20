# Repository Guidelines

## Project Structure & Module Organization
This Next.js 14 frontend keeps routes, layouts, and server actions inside `src/app`. Cross-feature code now sits in `src/shared` (UI primitives, providers, contexts, logger, API clients), and feature-specific modules live under `src/features` (`chat`, etc.) with their own `components`, `hooks`, and `styles`. Stateful stores remain in `src/stores`. Static assets live in `public/` and `src/assets`, with Tailwind-ready tokens defined in `src/assets/styles`. Keep domain types in `src/types` to prevent circular imports.

## Build, Test, and Development Commands
- `npm run dev`: launch the local dev server at `http://localhost:3000`.
- `npm run build`: create a production build with Next.js and Tailwind processing.
- `npm run start`: serve the last production build.
- `npm run lint`: run ESLint with the Next.js ruleset; treat warnings as actionable.
- `npm run type-check`: ensure the TypeScript project compiles with `tsconfig.json`.
- `npm run test` / `npm run test:ui`: execute Vitest suites in CLI or watchable UI mode.
- `npm run format`: format staged sources with Prettier.

## Coding Style & Naming Conventions
Follow the existing strict TypeScript setup. Use PascalCase for React components, camelCase for hooks and utilities, and SCREAMING_SNAKE_CASE for shared constants. Prefer component-level styling via Tailwind classes or the styles in `src/assets/styles`. Run Prettier before submitting patches and rely on ESLint autofix when possible.

## Testing Guidelines
Write unit and integration tests with Vitest and `@testing-library/react`. Co-locate specs as `<Component>.test.tsx` or `<module>.test.ts`. Mock API calls via helpers in `src/shared/api`. Aim to keep new logic covered; flag gaps when coverage is not feasible. Use `npm run test -- --watch` during iterative work.

## Commit & Pull Request Guidelines
Keep commits focused and follow the `type: summary` format seen in history (for example, `refactor: decouple upload logic`). Reference issue IDs when available. Pull requests should describe motivation, link to relevant tickets, list test evidence, and include screenshots or recordings for UI-facing changes. Confirm lint, tests, and type checks pass before requesting review.

## Environment & Security Notes
Store secrets in `.env.local`; only prefix variables with `NEXT_PUBLIC_` when exposing them to the browser. Never commit generated keys or build artifacts. Rotate API tokens promptly if exposure is suspected.
