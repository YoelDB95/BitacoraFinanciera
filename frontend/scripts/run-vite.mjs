import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { loadEnv } from 'vite'

const require = createRequire(import.meta.url)
const vitePackage = require.resolve('vite/package.json')
const viteBin = path.join(path.dirname(vitePackage), 'bin', 'vite.js')

const CONFIGS = {
  dev: {
    mode: 'development',
    envVar: 'VITE_API_URL_DEV',
    args: [],
  },
  build: {
    mode: 'production',
    envVar: 'VITE_API_URL_PROD',
    args: ['build'],
  },
}

const command = process.argv[2]
const config = CONFIGS[command]

if (!config) {
  console.error(`Comando no soportado: ${command ?? '(ninguno)'}`)
  console.error('Uso: node scripts/run-vite.mjs <dev|build> [args de Vite]')
  process.exit(1)
}

const env = loadEnv(config.mode, process.cwd(), '')
const apiUrl = String(env[config.envVar] ?? '').trim()

if (!apiUrl) {
  console.error(`Falta ${config.envVar} en frontend/.env.`)
  console.error(`Definila antes de ejecutar pnpm run ${command}.`)
  process.exit(1)
}

const child = spawn(
  process.execPath,
  [viteBin, ...config.args, ...process.argv.slice(3)],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_API_URL: apiUrl,
    },
  },
)

child.on('error', (error) => {
  console.error('No se pudo iniciar Vite:', error)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})
