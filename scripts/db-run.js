const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

// Load environment variables
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const index = trimmed.indexOf('=')
      if (index > 0) {
        const key = trimmed.slice(0, index).trim()
        let value = trimmed.slice(index + 1).trim()
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        process.env[key] = value
      }
    })
  }
}

loadEnv()

const dbUrl = process.env.LOCAL_DB_URL
if (!dbUrl) {
  console.error('Error: LOCAL_DB_URL is not defined in .env')
  process.exit(1)
}

const action = process.argv[2]
let cmdArgs = []

if (action === 'push') {
  cmdArgs = ['supabase', 'db', 'push', '--db-url', dbUrl]
} else if (action === 'list') {
  cmdArgs = ['supabase', 'migration', 'list', '--db-url', dbUrl]
} else {
  console.error('Unknown action. Use "push" or "list"')
  process.exit(1)
}

// Run supabase command via npx to ensure local installation is used
const result = spawnSync('npx', cmdArgs, { stdio: 'inherit', shell: true })
process.exit(result.status ?? 0)
