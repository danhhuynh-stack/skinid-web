@echo off
cd /d "C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2"

echo ----------------------------------------------------
echo [1/3] Copying ORIGINAL DVAH PERFUME JPG PHOTOS from Drive NUOC HOA folder...
echo ----------------------------------------------------
copy /y "H:\Drive của tôi\9. Dự Án Mỹ Phẩm TWON - SIS\Thông tin dự án TWON\Thông tin dự án TWON\NUOC HOA\SARIKA.jpg" "C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\public\images\products\dvah-sarika.jpg"
copy /y "H:\Drive của tôi\9. Dự Án Mỹ Phẩm TWON - SIS\Thông tin dự án TWON\Thông tin dự án TWON\NUOC HOA\KAMAL.jpg" "C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\public\images\products\dvah-kamal.jpg"
copy /y "H:\Drive của tôi\9. Dự Án Mỹ Phẩm TWON - SIS\Thông tin dự án TWON\Thông tin dự án TWON\NUOC HOA\RAKTA.jpg" "C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\public\images\products\dvah-rakta.jpg"
copy /y "H:\Drive của tôi\9. Dự Án Mỹ Phẩm TWON - SIS\Thông tin dự án TWON\Thông tin dự án TWON\NUOC HOA\TANMAYA.jpg" "C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\public\images\products\dvah-tanmaya.jpg"
copy /y "H:\Drive của tôi\9. Dự Án Mỹ Phẩm TWON - SIS\Thông tin dự án TWON\Thông tin dự án TWON\NUOC HOA\MALINI.jpg" "C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\public\images\products\dvah-malini.jpg"

copy /y "H:\Drive của tôi\9. Dự Án Mỹ Phẩm TWON - SIS\Website TWON\twon-website\assets\twon-*.png" "C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\public\images\products\"

echo ----------------------------------------------------
echo [2/3] Committing and Pushing to skinid.vn (GitHub Main Branch)...
echo ----------------------------------------------------
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" add .
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" commit -m "FIXED: Overwrite DVAH perfume images with original JPG files from NUOC HOA Drive folder"
"C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\mingit\cmd\git.exe" push origin main

echo ----------------------------------------------------
echo [3/3] Creating ZIP Backup on Desktop...
echo ----------------------------------------------------
powershell -Command "Compress-Archive -Path 'C:\Users\Danh Huynh\.gemini\antigravity\scratch\skinid-v2\*' -DestinationPath 'C:\Users\Danh Huynh\OneDrive\Desktop\SkinID_Web_Deploy_v11.zip' -Force"

echo DEPLOYMENT SUCCESSFUL! Please refresh skinid.vn (Ctrl + F5).
pause
