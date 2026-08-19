let faceMesh;
let cameraLoop;
let aiActive = false;
let autoCaptureTimeout = null;
let loopActive = false;

async function initFaceMesh() {
    faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });
    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });
    faceMesh.onResults(onFaceMeshResults);
}

const originalStartWebcam = window.startWebcam || async function() {};
window.startWebcam = async function() {
    const video = document.getElementById('webcam');
    document.getElementById('camera-loading').classList.remove('hidden');
    try {
        window.webcamStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } }, 
            audio: false 
        });
        video.srcObject = window.webcamStream;
        video.onloadedmetadata = async () => {
            document.getElementById('camera-loading').classList.add('hidden');
            
            if (!faceMesh) {
                await initFaceMesh();
            }
            aiActive = true;
            loopActive = true;
            
            async function processFrame() {
                if (!loopActive) return;
                
                if (aiActive && video.videoWidth > 0) {
                    await faceMesh.send({image: video});
                }
                
                if (loopActive) {
                    cameraLoop = requestAnimationFrame(processFrame);
                }
            }
            processFrame();
        };
    } catch (err) {
        console.error("Camera access denied or failed", err);
        document.getElementById('camera-loading').innerHTML = `
            <i data-feather="camera-off" class="w-8 h-8 mb-4 text-red-500"></i>
            <p class="text-center px-4">Không thể kết nối Camera.<br>Vui lòng cấp quyền truy cập Camera trong trình duyệt.</p>
        `;
        if (window.feather) feather.replace();
    }
};

const originalStopWebcam = window.stopWebcam || function() {};
window.stopWebcam = function() {
    aiActive = false;
    loopActive = false;
    if (cameraLoop) cancelAnimationFrame(cameraLoop);
    cancelAutoCapture();
    if (window.webcamStream) {
        window.webcamStream.getTracks().forEach(track => track.stop());
    }
};

function onFaceMeshResults(results) {
    if (!aiActive) return;
    
    const canvas = document.getElementById('ai-overlay');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const video = document.getElementById('webcam');
    
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const rx = canvas.width * 0.32;
    const ry = canvas.height * 0.42;
    const bSize = 40;
    
    const drawBrackets = (color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        
        ctx.beginPath(); ctx.moveTo(cx - rx + bSize, cy - ry); ctx.lineTo(cx - rx, cy - ry); ctx.lineTo(cx - rx, cy - ry + bSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + rx - bSize, cy - ry); ctx.lineTo(cx + rx, cy - ry); ctx.lineTo(cx + rx, cy - ry + bSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - rx + bSize, cy + ry); ctx.lineTo(cx - rx, cy + ry); ctx.lineTo(cx - rx, cy + ry - bSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + rx - bSize, cy + ry); ctx.lineTo(cx + rx, cy + ry); ctx.lineTo(cx + rx, cy + ry - bSize); ctx.stroke();
    };

    drawBrackets('rgba(255, 255, 255, 0.6)');
    
    const uiMsgAngle = document.getElementById('ai-msg-angle');
    const uiMsgLight = document.getElementById('ai-msg-light');
    const uiMsgExpr = document.getElementById('ai-msg-expr');
    const uiMsgBlur = document.getElementById('ai-msg-blur');
    const uiMsgPerfect = document.getElementById('ai-msg-perfect');
    
    const hideAllMsgs = () => {
        [uiMsgAngle, uiMsgLight, uiMsgExpr, uiMsgBlur, uiMsgPerfect].forEach(el => {
            if (el) {
                el.classList.remove('opacity-100');
                el.classList.add('opacity-0');
            }
        });
    };

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        window.currentLandmarks = landmarks; 
        
        // ---------------------------------------------------------
        // HEAD POSE ESTIMATION (True 3D Spatial Computation)
        // ---------------------------------------------------------
        const nose = landmarks[1];
        const chin = landmarks[152];
        const forehead = landmarks[10];
        const leftEar = landmarks[234];
        const rightEar = landmarks[454];
        
        // Vector H (Ngang): Trái -> Phải
        const hx = rightEar.x - leftEar.x;
        const hy = rightEar.y - leftEar.y;
        const hz = rightEar.z - leftEar.z;
        
        // Pitch calculation using 2D facial proportions (more reliable than Z depth)
        const eyeCenterY = (landmarks[33].y + landmarks[263].y) / 2;
        const mouthY = landmarks[13].y;
        const pitchRatio = (nose.y - eyeCenterY) / (mouthY - eyeCenterY); // ~0.45 to 0.55 when straight
        
        const roll = Math.atan2(hy, hx) * 180 / Math.PI; 
        const yaw = Math.atan2(hz, hx) * 180 / Math.PI;
        
        window.currentFaceRoll = roll;

        // Bounding box strictness (force user to center face)
        const inBox = (nose.x > 0.35 && nose.x < 0.65 && nose.y > 0.35 && nose.y < 0.65);
        
        let angleOk = false;
        if (window.currentCaptureStep === 1) {
            // Front: Yaw/Roll < 15 deg, Pitch ratio between 0.4 and 0.6 (relaxed a bit)
            angleOk = (Math.abs(roll) < 15 && Math.abs(yaw) < 15 && pitchRatio > 0.35 && pitchRatio < 0.65);
        } else if (window.currentCaptureStep === 2) {
            angleOk = (yaw > 15); // Turn Left
        } else {
            angleOk = (yaw < -15); // Turn Right
        }

        // VẼ ĐƯỜNG VIỀN KHUÔN MẶT ĐỘNG (Real-time Facial Contour)
        if (typeof FACEMESH_FACE_OVAL !== 'undefined') {
            ctx.beginPath();
            // Nếu các điều kiện đang tốt, viền màu hồng nhạt, nếu không thì trắng mờ
            ctx.strokeStyle = (!inBox || !angleOk) ? 'rgba(255, 255, 255, 0.5)' : 'rgba(232, 122, 144, 0.8)';
            ctx.lineWidth = 2;
            for (let i = 0; i < FACEMESH_FACE_OVAL.length; i++) {
                const connection = FACEMESH_FACE_OVAL[i];
                const pt1 = landmarks[connection[0]];
                const pt2 = landmarks[connection[1]];
                ctx.moveTo(pt1.x * canvas.width, pt1.y * canvas.height);
                ctx.lineTo(pt2.x * canvas.width, pt2.y * canvas.height);
            }
            ctx.stroke();
            
            // Vẽ thêm lưới 3D Tesselation mờ ảo cho xịn
            if (typeof FACEMESH_TESSELATION !== 'undefined') {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 0.5;
                for (let i = 0; i < FACEMESH_TESSELATION.length; i++) {
                    const conn = FACEMESH_TESSELATION[i];
                    ctx.moveTo(landmarks[conn[0]].x * canvas.width, landmarks[conn[0]].y * canvas.height);
                    ctx.lineTo(landmarks[conn[1]].x * canvas.width, landmarks[conn[1]].y * canvas.height);
                }
                ctx.stroke();
            }
        }

        if (!inBox || !angleOk) {
            hideAllMsgs();
            if (!inBox) {
                uiMsgAngle.innerText = "Vui lòng đưa mặt vào giữa khung";
            } else {
                uiMsgAngle.innerText = "Góc mặt chưa thẳng";
            }
            uiMsgAngle.classList.remove('opacity-0');
            uiMsgAngle.classList.add('opacity-100');
            drawBrackets('#f43f5e');
            cancelAutoCapture();
            return;
        }

        // BIỂU CẢM (Expression - Tránh mở miệng lớn)
        const upperLip = landmarks[13];
        const lowerLip = landmarks[14];
        const mouthOpen = Math.abs(upperLip.y - lowerLip.y) > 0.05;
        
        if (mouthOpen) {
            hideAllMsgs();
            uiMsgExpr.classList.remove('opacity-0');
            uiMsgExpr.classList.add('opacity-100');
            drawBrackets('#a855f7');
            cancelAutoCapture();
            return;
        }

        // ÁNH SÁNG (Symmetry Lighting Check)
        const leftCheek = landmarks[205]; // Điểm gò má trái
        const rightCheek = landmarks[425]; // Điểm gò má phải
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth; tempCanvas.height = video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(video, 0, 0);
        
        const getLux = (p) => {
            const x = Math.floor(p.x * tempCanvas.width);
            const y = Math.floor(p.y * tempCanvas.height);
            if (x<0 || x>=tempCanvas.width || y<0 || y>=tempCanvas.height) return 0;
            const data = tempCtx.getImageData(x, y, 1, 1).data;
            return 0.299 * data[0] + 0.587 * data[1] + 0.114 * data[2]; // Luminance formula
        };
        
        const lLux = getLux(leftCheek);
        const rLux = getLux(rightCheek);
        const luxDiff = Math.abs(lLux - rLux) / Math.max(lLux, rLux, 1);
        
        // Mức chênh lệch ánh sáng tối đa 45%
        if (luxDiff > 0.45) { 
            hideAllMsgs();
            uiMsgLight.classList.remove('opacity-0');
            uiMsgLight.classList.add('opacity-100');
            drawBrackets('#fbbf24'); 
            cancelAutoCapture();
            return;
        }
        
        // ALL PERFECT!
        if (!autoCaptureTimeout) {
            hideAllMsgs();
            uiMsgPerfect.classList.remove('opacity-0');
            uiMsgPerfect.classList.add('opacity-100');
            drawBrackets('#E87A90');
            startAutoCapture();
        }

    } else {
        hideAllMsgs();
        cancelAutoCapture();
    }
}

function startAutoCapture() {
    if (!autoCaptureTimeout) {
        if (window.feather) feather.replace();
        autoCaptureTimeout = setTimeout(() => {
            captureFrameAndPreProcess();
            autoCaptureTimeout = null;
        }, 800);
    }
}

function cancelAutoCapture() {
    if (autoCaptureTimeout) {
        clearTimeout(autoCaptureTimeout);
        autoCaptureTimeout = null;
    }
}

window.captureFrame = function() {
    captureFrameAndPreProcess();
};

function captureFrameAndPreProcess() {
    const video = document.getElementById('webcam');
    if (!video || !video.videoWidth) return;
    
    ['ai-msg-angle', 'ai-msg-light', 'ai-msg-expr', 'ai-msg-blur', 'ai-msg-perfect'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.classList.remove('opacity-100');
            el.classList.add('opacity-0');
        }
    });

    const videoWrapper = video.parentElement;
    const flash = document.createElement('div');
    flash.className = 'absolute inset-0 bg-white z-50';
    videoWrapper.appendChild(flash);
    setTimeout(() => flash.remove(), 150);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // ---------------------------------------------------------
    // AUTO-CALIBRATION (SMART PIE Deskewing)
    // ---------------------------------------------------------
    ctx.save();
    // Di chuyển gốc tọa độ về giữa
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Xoay canvas ngược lại góc Roll để bù trừ (Deskew)
    if (window.currentFaceRoll) {
        ctx.rotate(-window.currentFaceRoll * Math.PI / 180);
    }
    
    // Lật ảnh (vì camera trước bị ngược)
    ctx.scale(-1, 1);
    
    // Vẽ ảnh với tọa độ bù trừ
    ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    ctx.restore();
    
    // ---------------------------------------------------------
    // D-CNN ROI CROPPING
    // ---------------------------------------------------------
    let cropSize = Math.min(canvas.width, canvas.height) * 0.8;
    let sx = (canvas.width - cropSize) / 2;
    let sy = (canvas.height - cropSize) / 2;
    
    if (window.currentLandmarks) {
        const xs = window.currentLandmarks.map(l => l.x);
        const ys = window.currentLandmarks.map(l => l.y);
        const minX = Math.min(...xs) * canvas.width;
        const maxX = Math.max(...xs) * canvas.width;
        const minY = Math.min(...ys) * canvas.height;
        const maxY = Math.max(...ys) * canvas.height;
        
        const w = (maxX - minX) * 1.5;
        const h = (maxY - minY) * 1.5;
        cropSize = Math.max(w, h);
        
        sx = minX - (w - (maxX - minX)) / 2;
        sy = minY - (h - (maxY - minY)) / 2;
        
        sx = Math.max(0, Math.min(sx, canvas.width - cropSize));
        sy = Math.max(0, Math.min(sy, canvas.height - cropSize));
    }
    
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropSize;
    croppedCanvas.height = cropSize;
    const cCtx = croppedCanvas.getContext('2d');
    
    cCtx.drawImage(canvas, sx, sy, cropSize, cropSize, 0, 0, cropSize, cropSize);
    
    cCtx.fillStyle = 'rgba(255, 235, 220, 0.05)'; 
    cCtx.fillRect(0, 0, cropSize, cropSize);
    
    const dataUrl = croppedCanvas.toDataURL('image/jpeg', 0.9);
    const base64Data = dataUrl.split(',')[1];
    
    if(!window.capturedImages) window.capturedImages = [];
    window.capturedImages.push(base64Data);
    
    const thumb = document.getElementById('thumb-'+window.currentCaptureStep);
    if(thumb) thumb.innerHTML = `<img src="${dataUrl}" class="w-full h-full object-cover">`;
    
    window.currentCaptureStep++;
    
    if (window.currentCaptureStep > 3) {
        document.getElementById('capture-btn').classList.add('hidden');
        document.getElementById('analyze-action').classList.remove('hidden');
        stopWebcam();
        document.getElementById('instruction-text').innerText = "Đã chụp đủ 3 góc độ";
    } else {
        const texts = ["Chụp ảnh chính diện khuôn mặt", "Nghiêng trái 45 độ", "Nghiêng phải 45 độ"];
        document.getElementById('instruction-text').innerText = texts[window.currentCaptureStep-1];
        
        aiActive = false;
        setTimeout(() => { 
            aiActive = true; 
        }, 1500); 
    }
    
    if (typeof window.updateStepUI === 'function') {
        window.updateStepUI();
    }
}
