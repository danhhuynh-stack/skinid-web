@echo off
cd /d "C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2"
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" add .
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" commit -m "Update DVAH and TWON official product data, INCI ingredients, Ministry of Health certification info, distributor FieldMan Co., and local image assets"
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" push origin main
powershell -Command "Compress-Archive -Path 'C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\*' -DestinationPath 'C:\Users\Danh Huynh\OneDrive\Desktop\SkinID_Web_Deploy_v9.zip' -Force"
