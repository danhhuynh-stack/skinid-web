@echo off
cd /d "C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2"
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" add .
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" commit -m "Fix imgSrc URL resolution bug so official DVAH perfume images load 100% correctly from worker site"
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" push origin main
powershell -Command "Compress-Archive -Path 'C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\*' -DestinationPath 'C:\Users\Danh Huynh\OneDrive\Desktop\SkinID_Web_Deploy_v8.zip' -Force"
