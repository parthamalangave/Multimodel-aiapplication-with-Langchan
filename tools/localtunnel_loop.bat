@echo off
:loop
echo Starting localtunnel...
"C:\Users\workp\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64\node.exe" "C:\Users\workp\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64\node_modules\localtunnel\bin\lt.js" --port 3000 --subdomain multimodal-ai-assistant
echo Connection interrupted. Reconnecting in 3 seconds...
timeout /t 3 /nobreak >nul
goto loop
