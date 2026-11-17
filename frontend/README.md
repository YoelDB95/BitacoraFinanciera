# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## URL de la API por entorno

Las URLs se definen en `frontend/.env` y los comandos exponen la correspondiente a Vite como `VITE_API_URL`:

| Comando | Variable en `.env` |
| --- | --- |
| `pnpm run dev` | `VITE_API_URL_DEV` |
| `pnpm run build` | `VITE_API_URL_PROD` |

```dotenv
VITE_API_URL_DEV=http://localhost:3000/api
VITE_API_URL_PROD=https://bitacorafinanciera.onrender.com/api
```

Si la variable correspondiente no está definida en `.env`, el comando falla con un mensaje indicando cuál falta.
