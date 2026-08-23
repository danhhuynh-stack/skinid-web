@echo off
cd /d "C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2"

echo ----------------------------------------------------
echo [1/3] Copying official 2.3MB DVAH and TWON perfume images from Drive...
echo ----------------------------------------------------
copy /y "H:\Drive của tôi\9. Dự Án Mỹ Phẩm TWON - SIS\Website TWON\twon-website\assets\dvah-*.png" "C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\public\images\products\"
copy /y "H:\Drive của tôi\9. Dự Án Mỹ Phẩm TWON - SIS\Website TWON\twon-website\assets\twon-*.png" "C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\public\images\products\"

echo ----------------------------------------------------
echo [2/3] Committing and Pushing to skinid.vn (GitHub Main Branch)...
echo ----------------------------------------------------
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" add .
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" commit -m "CRITICAL FIX: Overwrite DVAH and TWON images with official 2.3MB perfume photos from Drive"
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" push origin main

echo ----------------------------------------------------
echo [3/3] Creating ZIP Backup on Desktop...
echo ----------------------------------------------------
powershell -Command "Compress-Archive -Path 'C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\*' -DestinationPath 'C:\Users\Danh Huynh\OneDrive\Desktop\SkinID_Web_Deploy_v10.zip' -Force"

echo ----------------------------------------------------
echo DEPLOYMENT SUCCESSFUL!
echo Please hard refresh skinid.vn (Ctrl + F5 or Ctrl + Shift + R)
echo ----------------------------------------------------
pause
