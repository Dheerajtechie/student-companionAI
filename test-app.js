import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🚀 Starting Study Companion App...')
console.log('📁 Working directory:', __dirname)

// Start the development server
const devServer = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'pipe',
  shell: true
})

let serverStarted = false

devServer.stdout.on('data', (data) => {
  const output = data.toString()
  console.log(output)
  
  if (output.includes('Local:') || output.includes('localhost:5173')) {
    serverStarted = true
    console.log('\n🎉 SUCCESS! Study Companion is running!')
    console.log('🌐 Open your browser and go to: http://localhost:5173')
    console.log('\n✨ Your world-class AI-powered Study Companion is ready!')
    console.log('\n📚 Features available:')
    console.log('   ✅ User Authentication (Login/Register)')
    console.log('   ✅ AI Question Generation (OpenAI, Groq, Gemini)')
    console.log('   ✅ Study Session Timer')
    console.log('   ✅ Subject Management')
    console.log('   ✅ Goals Tracking')
    console.log('   ✅ Analytics Dashboard')
    console.log('   ✅ Spaced Repetition')
    console.log('   ✅ Offline PWA Support')
    console.log('   ✅ Beautiful UI with Animations')
    console.log('   ✅ Dark/Light Mode')
    console.log('   ✅ Mobile Responsive')
    console.log('\n🔧 To stop the server: Press Ctrl+C')
  }
})

devServer.stderr.on('data', (data) => {
  const error = data.toString()
  console.error('Error:', error)
})

devServer.on('close', (code) => {
  if (!serverStarted) {
    console.log(`\n❌ Server exited with code ${code}`)
    console.log('🔧 Try running: npm run dev')
  }
})

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...')
  devServer.kill()
  process.exit(0)
})

// Timeout after 30 seconds if server doesn't start
setTimeout(() => {
  if (!serverStarted) {
    console.log('\n⏰ Server startup timeout. Check for errors above.')
    devServer.kill()
    process.exit(1)
  }
}, 30000)
