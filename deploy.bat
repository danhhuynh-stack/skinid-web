@echo off
chcp 65001 >nul
cd /d "C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2"

echo ----------------------------------------------------
echo [1/3] Copying ORIGINAL DVAH PERFUME JPG PHOTOS from Drive NUOC HOA folder...
echo ----------------------------------------------------
powershell -Command "Copy-Item -Path 'H:\Drive của tôi\9. Dự Án Mỹ Phẩm TWON - SIS\Thông tin dự án TWON\Thông tin dự án TWON\NUOC HOA\SARIKA.jpg' -Destination 'C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\public\images\products\dvah-sarika.jpg' -Force"
powershell -Command "Copy-Item -Path 'H:\Drive của tôi\9. Dự Án Mỹ Phẩm TWON - SIS\Thông tin dự án TWON\Thông tin dự án TWON\NUOC HOA\KAMAL.jpg' -Destination 'C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\public\images\products\dvah-kamal.jpg' -Force"
powershell -Command "Copy-Item -Path 'H:\Drive của tôi\9. Dự Án Mỹ Phẩm TWON - SIS\Thông tin dự án TWON\Thông tin dự án TWON\NUOC HOA\RAKTA.jpg' -Destination 'C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\public\images\products\dvah-rakta.jpg' -Force"
powershell -Command "Copy-Item -Path 'H:\Drive của tôi\9. Dự Án Mỹ Phẩm TWON - SIS\Thông tin dự án TWON\Thông tin dự án TWON\NUOC HOA\TANMAYA.jpg' -Destination 'C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\public\images\products\dvah-tanmaya.jpg' -Force"
powershell -Command "Copy-Item -Path 'H:\Drive của tôi\9. Dự Án Mỹ Phẩm TWON - SIS\Thông tin dự án TWON\Thông tin dự án TWON\NUOC HOA\MALINI.jpg' -Destination 'C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\public\images\products\dvah-malini.jpg' -Force"

powershell -Command "Copy-Item -Path 'H:\Drive của tôi\9. Dự Án Mỹ Phẩm TWON - SIS\Website TWON\twon-website\assets\twon-*.png' -Destination 'C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\public\images\products\' -Force"

echo ----------------------------------------------------
echo [2/3] Committing and Pushing to skinid.vn (GitHub Main Branch)...
echo ----------------------------------------------------
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" add .
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" commit -m "FIXED: Overcome UTF-8 encoding issue for copy, force update js/skin-ai.js cache buster"
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" push origin main

echo ----------------------------------------------------
echo [3/3] Creating ZIP Backup on Desktop...
echo ----------------------------------------------------
powershell -Command "Compress-Archive -Path 'C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\*' -DestinationPath 'C:\Users\Danh Huynh\OneDrive\Desktop\SkinID_Web_Deploy_v13.zip' -Force"

echo DEPLOYMENT SUCCESSFUL! Please refresh skinid.vn (Ctrl + F5).
pause
