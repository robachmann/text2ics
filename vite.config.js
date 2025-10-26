/// <reference types="vitest" />
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: '/text2ics/',
    test: {
        environment: 'node',
        globals: true,
    },
})
