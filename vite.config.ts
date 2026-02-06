import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for Figma environment file
// In the Figma Make environment, Supabase constants are provided in a system file.
// We extract these values and inject them into import.meta.env so the same code works everywhere.
const supabaseInfoPath = path.resolve(__dirname, './utils/supabase/info.tsx');
const hasSystemSupabaseInfo = fs.existsSync(supabaseInfoPath);

let supabaseDefines = {};

if (hasSystemSupabaseInfo) {
  try {
    const content = fs.readFileSync(supabaseInfoPath, 'utf-8');
    const projectIdMatch = content.match(/export const projectId = "([^"]+)"/);
    const anonKeyMatch = content.match(/export const publicAnonKey = "([^"]+)"/);

    if (projectIdMatch && anonKeyMatch) {
      supabaseDefines = {
        'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify(projectIdMatch[1]),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(anonKeyMatch[1]),
      };
    }
  } catch (e) {
    console.error("Failed to read Supabase info", e);
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // In Figma: This injects the extracted values.
  // In Local/Vercel: This object is empty, so Vite automatically reads from .env files.
  define: {
    ...supabaseDefines
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
