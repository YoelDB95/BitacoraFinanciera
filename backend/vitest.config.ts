import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,js}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,js}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,js}',
        'src/**/*.d.ts',
        'src/prisma/**',
        'src/**/*.routes.ts',
        'src/**/*.controller.ts',
        'src/**/index.ts',
      ],
      // Opcional: hace fallar el run si no se llega al mínimo
      // thresholds: { lines: 60, functions: 60, branches: 60, statements: 60 },
    },
  },
})