# Tech Stack

## Runtime / Lenguaje

- Lenguaje: JavaScript (ES2022, ES modules) + JSX
- Versión: Node.js 20.19+ o 22.12+ (requisito de Vite 8); desarrollo local con Node 24
- Package manager: pnpm (lockfile `pnpm-lock.yaml`)

## Frameworks y librerías core

| Librería | Versión | Propósito |
|----------|---------|-----------|
| react / react-dom | 18.3.1 | UI |
| react-bootstrap | 2.10.10 | Componentes de UI |
| bootstrap | 5.3.9 | Estilos |
| react-bootstrap-icons | 1.11.6 | Iconos |
| vite | 8.3.8 | Dev server y build (dev) |
| @vitejs/plugin-react | 6.3.0 | Soporte React en Vite (dev) |
| vitest | 5.1.0 | Runner de tests (dev) |
| jsdom | 31.0.1 | DOM para tests (dev) |
| @testing-library/react · jest-dom · user-event | 16.3.3 · 7.0.1 · 14.6.12 | Tests de componentes (dev) |

## Infraestructura

- Base de datos: ninguna; colección del usuario en `localStorage`
- APIs externas: Free Dictionary API (definiciones), Wikimedia Commons API (grabaciones de pronunciación)
- Deploy: Vercel (sitio estático) — se configura en HU-001
- CI/CD: GitHub Actions — se configura en HU-001
- Repositorio: GitHub `chaquen/DictionaryUIReact`, rama principal `master`

## Herramientas de desarrollo

- Editor / IDE: no especificado
- Agente de IA: Claude Code
- Linter / Formatter: ninguno configurado

## Dependencias críticas (no cambiar sin ADR)

- React 18 (react-bootstrap 2 depende de él)
- Free Dictionary API — fuente de definiciones
- Wikimedia Commons — fuente de audio humano
