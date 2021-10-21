if (Test-Path '.\dist') {
    rm -Force -Recurse '.\dist'
}

Set-Location '.\converter'
.\package.ps1

Set-Location '..\gui'
npm run pack

Set-Location '..'