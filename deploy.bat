@echo off
cd /d "C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2"
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" add .
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" commit -m "Add official TWON and DVAH products with full ingredients, images, and prices"
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" push origin main
powershell -Command "Compress-Archive -Path 'C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\*' -DestinationPath 'C:\Users\Danh Huynh\OneDrive\Desktop\SkinID_Web_Deploy_v6.zip' -Force"
