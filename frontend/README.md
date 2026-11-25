# Frontend (React + Vite + Tailwind)

## Connecting to the API

```bash
cp .env.example .env.local   # pick the real backend or the Prism mock
npm install
npm run dev                  # http://localhost:5173
```

`VITE_API_BASE_URL` decides where requests go: `http://localhost:3000` for the real backend, `http://localhost:4010` for the Prism mock. Restart `npm run dev` after changing it.

Call the backend only through `src/api/client.js`:

```js
import { api, ApiError } from './api/client'

try {
  const { token, role, name } = await api.login(email, password)
} catch (err) {
  if (err instanceof ApiError && err.status === 401) {
    // wrong email or password
  }
}
```

Branch on `err.status` and `err.code` (for example `409` / `EMAIL_ALREADY_EXISTS`), not on the message text. `status: 0` with `code: 'NETWORK_ERROR'` means the API could not be reached. The backend allows `http://localhost:5173` through CORS by default.

---

## About the template

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
