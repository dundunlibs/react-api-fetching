import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "prismjs",
              {
                "languages": ["tsx"],
                "plugins": ["line-numbers"],
                "theme": "okaidia",
                "css": true
              }
          ]
        ]
      }
    }),
  ],
})
