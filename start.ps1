Write-Host "🚀 Starting Study Companion App..." -ForegroundColor Green
Write-Host ""
Write-Host "Make sure you have:" -ForegroundColor Yellow
Write-Host "1. Created .env.local file with your Supabase credentials" -ForegroundColor Yellow
Write-Host "2. Set up your Supabase database with the schema" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Cyan
Write-Host ""

try {
    npm run dev
} catch {
    Write-Host "Error starting the development server. Make sure you're in the correct directory and have run 'npm install'." -ForegroundColor Red
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
