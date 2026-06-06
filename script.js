const uploadState = document.getElementById('uploadState');
const editorState = document.getElementById('editorState');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const resizedPreview = document.getElementById('resizedPreview');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const aspectRatioCheckbox = document.getElementById('aspectRatioCheckbox');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const formatSelect = document.getElementById('formatSelect');
const resizeBtn = document.getElementById('resizeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const imageInfo = document.getElementById('imageInfo');
const processedImageInfo = document.getElementById('processedImageInfo');
const targetSizeInput = document.getElementById('targetSizeInput');

// Advanced Filters
const brightnessSlider = document.getElementById('brightnessSlider');
const contrastSlider = document.getElementById('contrastSlider');
const saturationSlider = document.getElementById('saturationSlider');
const grayscaleSlider = document.getElementById('grayscaleSlider');
const sepiaSlider = document.getElementById('sepiaSlider');
const blurSlider = document.getElementById('blurSlider');
const hueRotateSlider = document.getElementById('hueRotateSlider');
const invertSlider = document.getElementById('invertSlider');
const fineRotateSlider = document.getElementById('fineRotateSlider');

const brightnessValue = document.getElementById('brightnessValue');
const contrastValue = document.getElementById('contrastValue');
const saturationValue = document.getElementById('saturationValue');
const grayscaleValue = document.getElementById('grayscaleValue');
const sepiaValue = document.getElementById('sepiaValue');
const blurValue = document.getElementById('blurValue');
const hueRotateValue = document.getElementById('hueRotateValue');
const invertValue = document.getElementById('invertValue');
const fineRotateValue = document.getElementById('fineRotateValue');

// Transform Buttons
const rotateLeftBtn = document.getElementById('rotateLeftBtn');
const rotateRightBtn = document.getElementById('rotateRightBtn');
const flipHBtn = document.getElementById('flipHBtn');
const flipVBtn = document.getElementById('flipVBtn');
const autoEnhanceBtn = document.getElementById('autoEnhanceBtn');

// Crop Buttons
const crop11Btn = document.getElementById('crop11Btn');
const crop43Btn = document.getElementById('crop43Btn');
const crop169Btn = document.getElementById('crop169Btn');

// Transform State
let currentRotation = 0;
let flipH = 1;
let flipV = 1;
let cropMode = null; // null, '1:1', '4:3', '16:9'
let cropPanX = 50;
let cropPanY = 50;

let originalImage = null;
let originalFileName = '';
let processedBlobUrl = '';

// Drag & Drop Handlers
dropZone.onclick = () => fileInput.click();

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-active');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-active');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-active');
    fileInput.files = e.dataTransfer.files;
    handleImageUpload();
});

fileInput.onchange = handleImageUpload;

function handleImageUpload() {
    const file = fileInput.files[0];
    if (!file || !file.type.startsWith('image/')) return alert('Please upload a valid image file.');

    originalFileName = file.name.split('.').slice(0, -1).join('.');

    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.src = e.target.result;
        originalImage.onload = () => {
            // Reset Transform State
            currentRotation = 0;
            flipH = 1;
            flipV = 1;
            cropMode = null;
            cropPanX = 50;
            cropPanY = 50;
            preview.style.cursor = 'default';
            preview.style.objectPosition = '50% 50%';

            // Reset Filter Sliders
            brightnessSlider.value = 0;
            contrastSlider.value = 0;
            saturationSlider.value = 100;
            grayscaleSlider.value = 0;
            sepiaSlider.value = 0;
            blurSlider.value = 0;
            hueRotateSlider.value = 0;
            invertSlider.value = 0;
            fineRotateSlider.value = 0;
            targetSizeInput.value = '';
            
            updateLivePreview(); // will reset visual
            updateFilterValues();

            // Toggle UI State
            uploadState.style.display = 'none';
            editorState.style.display = 'grid';
            
            // Display Preview
            preview.src = originalImage.src;
            preview.style.display = 'block';
            imageInfo.style.display = 'block';
            
            // Set initial inputs
            widthInput.value = originalImage.width;
            heightInput.value = originalImage.height;

            // Clear previous results
            resizedPreview.style.display = 'none';
            processedImageInfo.style.display = 'none';
            downloadBtn.style.display = 'none';
            
            if(processedBlobUrl) URL.revokeObjectURL(processedBlobUrl);

            imageInfo.innerHTML = `
                <strong>Original Details</strong><br>
                Resolution: ${originalImage.width} × ${originalImage.height} px<br>
                Size: ${(file.size / 1024).toFixed(2)} KB<br>
                Format: ${file.type.split('/')[1].toUpperCase()}
            `;
        };
    };
    reader.readAsDataURL(file);
}

// Aspect Ratio Logic
widthInput.addEventListener('input', () => {
    cropMode = null;
    if (aspectRatioCheckbox.checked && originalImage && widthInput.value) {
        const ratio = originalImage.height / originalImage.width;
        heightInput.value = Math.round(widthInput.value * ratio);
    }
});

heightInput.addEventListener('input', () => {
    cropMode = null;
    if (aspectRatioCheckbox.checked && originalImage && heightInput.value) {
        const ratio = originalImage.width / originalImage.height;
        widthInput.value = Math.round(heightInput.value * ratio);
    }
});

function applyCrop(ratioW, ratioH, modeName) {
    cropMode = modeName;
    cropPanX = 50;
    cropPanY = 50;
    const currentW = originalImage.width;
    const currentH = originalImage.height;
    
    // Calculate maximum box fitting in original while maintaining target ratio
    let targetW = currentW;
    let targetH = Math.round((currentW / ratioW) * ratioH);
    
    if (targetH > currentH) {
        targetH = currentH;
        targetW = Math.round((currentH / ratioH) * ratioW);
    }

    widthInput.value = targetW;
    heightInput.value = targetH;
    aspectRatioCheckbox.checked = true;
    updateLivePreview();
}

crop11Btn.onclick = () => applyCrop(1, 1, '1:1');
crop43Btn.onclick = () => applyCrop(4, 3, '4:3');
crop169Btn.onclick = () => applyCrop(16, 9, '16:9');

// Transformations Handlers
rotateLeftBtn.onclick = () => { currentRotation -= 90; updateLivePreview(); };
rotateRightBtn.onclick = () => { currentRotation += 90; updateLivePreview(); };
flipHBtn.onclick = () => { flipH = flipH === 1 ? -1 : 1; updateLivePreview(); };
flipVBtn.onclick = () => { flipV = flipV === 1 ? -1 : 1; updateLivePreview(); };

autoEnhanceBtn.onclick = () => {
    brightnessSlider.value = 10;
    contrastSlider.value = 15;
    saturationSlider.value = 125;
    updateFilterValues();
    updateLivePreview();
};

// Live Preview function
function updateLivePreview() {
    if (!originalImage) return;
    const brightness = parseInt(brightnessSlider.value, 10) || 0;
    const contrast = parseInt(contrastSlider.value, 10) || 0;
    const saturation = parseInt(saturationSlider.value, 10) || 0;
    const grayscale = parseInt(grayscaleSlider.value, 10) || 0;
    const sepia = parseInt(sepiaSlider.value, 10) || 0;
    const blur = parseInt(blurSlider.value, 10) || 0;
    const hue = parseInt(hueRotateSlider.value, 10) || 0;
    const invert = parseInt(invertSlider.value, 10) || 0;
    const fineRot = parseInt(fineRotateSlider.value, 10) || 0;

    preview.style.filter = `
        brightness(${100 + brightness}%) 
        contrast(${100 + contrast}%) 
        saturate(${saturation}%)
        grayscale(${grayscale}%)
        sepia(${sepia}%)
        blur(${blur}px)
        hue-rotate(${hue}deg)
        invert(${invert}%)
    `;

    const totalRotation = currentRotation + fineRot;
    preview.style.transform = `rotate(${totalRotation}deg) scale(${flipH}, ${flipV})`;
    
    if (cropMode) {
        preview.style.borderRadius = '0';
        preview.style.objectFit = 'cover';
        preview.style.objectPosition = `${cropPanX}% ${cropPanY}%`;
        if (!isPanningCrop) preview.style.cursor = 'grab';
        if (cropMode === '1:1') preview.style.aspectRatio = '1/1';
        if (cropMode === '4:3') preview.style.aspectRatio = '4/3';
        if (cropMode === '16:9') preview.style.aspectRatio = '16/9';
    } else {
        preview.style.objectFit = 'contain';
        preview.style.aspectRatio = 'auto';
        preview.style.cursor = 'default';
        preview.style.objectPosition = '50% 50%';
    }
}

// UI Updaters
function updateFilterValues() {
    qualityValue.textContent = qualitySlider.value + '%';
    brightnessValue.textContent = brightnessSlider.value;
    contrastValue.textContent = contrastSlider.value;
    saturationValue.textContent = saturationSlider.value + '%';
    grayscaleValue.textContent = grayscaleSlider.value + '%';
    sepiaValue.textContent = sepiaSlider.value + '%';
    blurValue.textContent = blurSlider.value;
    hueRotateValue.textContent = hueRotateSlider.value;
    invertValue.textContent = invertSlider.value + '%';
    fineRotateValue.textContent = fineRotateSlider.value + '°';
}

const sliders = [qualitySlider, brightnessSlider, contrastSlider, saturationSlider, grayscaleSlider, sepiaSlider, blurSlider, hueRotateSlider, invertSlider, fineRotateSlider];
sliders.forEach(slider => {
    slider.addEventListener('input', () => {
        updateFilterValues();
        updateLivePreview();
    });
});

// Optimizer Logic
function generateBlob(quality, format, width, height, sx, sy, sWidth, sHeight) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const fineRot = parseInt(fineRotateSlider.value, 10) || 0;
        const totalRotation = currentRotation + fineRot;
        
        // Handle Rotation Canvas Size
        if (totalRotation % 180 !== 0) {
            // For fine rotations, bounding box gets larger, but we'll keep it simple
            // and swap W/H only for 90/270 degree snaps
            if (currentRotation % 180 !== 0 && fineRot === 0) {
                canvas.width = height;
                canvas.height = width;
            } else {
                canvas.width = width;
                canvas.height = height;
            }
        } else {
            canvas.width = width;
            canvas.height = height;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(totalRotation * Math.PI / 180);
        ctx.scale(flipH, flipV);

        const brightness = parseInt(brightnessSlider.value, 10) || 0;
        const contrast = parseInt(contrastSlider.value, 10) || 0;
        const saturation = parseInt(saturationSlider.value, 10) || 0;
        const grayscale = parseInt(grayscaleSlider.value, 10) || 0;
        const sepia = parseInt(sepiaSlider.value, 10) || 0;
        const blur = parseInt(blurSlider.value, 10) || 0;
        const hue = parseInt(hueRotateSlider.value, 10) || 0;
        const invert = parseInt(invertSlider.value, 10) || 0;

        ctx.filter = `
            brightness(${100 + brightness}%) 
            contrast(${100 + contrast}%) 
            saturate(${saturation}%)
            grayscale(${grayscale}%)
            sepia(${sepia}%)
            blur(${blur}px)
            hue-rotate(${hue}deg)
            invert(${invert}%)
        `;

        if (currentRotation % 180 !== 0 && fineRot === 0) {
            ctx.drawImage(originalImage, sx, sy, sWidth, sHeight, -height / 2, -width / 2, height, width);
        } else {
            ctx.drawImage(originalImage, sx, sy, sWidth, sHeight, -width / 2, -height / 2, width, height);
        }

        canvas.toBlob((blob) => resolve({blob, canvas}), format, quality);
    });
}

resizeBtn.onclick = async () => {
    if (!originalImage) {
        alert('Please upload an image first!');
        return;
    }

    const width = parseInt(widthInput.value) || originalImage.width;
    const height = parseInt(heightInput.value) || originalImage.height;
    const format = formatSelect.value;
    const targetSizeKB = parseFloat(targetSizeInput.value);
    
    resizeBtn.textContent = "Processing...";
    resizeBtn.disabled = true;

    // Calculate Cropping Source
    let sx = 0, sy = 0, sWidth = originalImage.width, sHeight = originalImage.height;
    
    if (cropMode) {
        // We need to crop the original image from the center
        let cropRatio = width / height;
        let origRatio = sWidth / sHeight;
        
        if (cropRatio > origRatio) {
            sHeight = sWidth / cropRatio;
            sy = (originalImage.height - sHeight) * (cropPanY / 100);
        } else {
            sWidth = sHeight * cropRatio;
            sx = (originalImage.width - sWidth) * (cropPanX / 100);
        }
    }

    let finalBlob = null;
    let finalCanvas = null;

    if (targetSizeKB > 0 && format !== 'image/png') {
        // Binary search for Target File Size
        let minQ = 0.01;
        let maxQ = 1.0;
        let currentQ = 0.8; // Start at 80%
        let bestBlob = null;
        let iterations = 0;

        while (iterations < 7) { // max 7 steps binary search
            const result = await generateBlob(currentQ, format, width, height, sx, sy, sWidth, sHeight);
            const sizeKB = result.blob.size / 1024;
            
            if (sizeKB <= targetSizeKB) {
                bestBlob = result;
                minQ = currentQ; // try higher quality
            } else {
                maxQ = currentQ; // try lower quality
            }
            currentQ = (minQ + maxQ) / 2;
            iterations++;
        }
        
        // If we couldn't hit it, fallback to lowest possible or best found
        if (bestBlob) {
            finalBlob = bestBlob.blob;
            finalCanvas = bestBlob.canvas;
        } else {
            const res = await generateBlob(0.01, format, width, height, sx, sy, sWidth, sHeight);
            finalBlob = res.blob;
            finalCanvas = res.canvas;
        }
    } else {
        // Standard Processing
        const quality = parseInt(qualitySlider.value) / 100;
        const res = await generateBlob(quality, format, width, height, sx, sy, sWidth, sHeight);
        finalBlob = res.blob;
        finalCanvas = res.canvas;
    }

    resizeBtn.textContent = "Process Image";
    resizeBtn.disabled = false;

    if (!finalBlob) return alert('Error processing image');
    
    const fileExt = format.split('/')[1] === 'jpeg' ? 'jpg' : format.split('/')[1];
    const fileName = `studio_${originalFileName}.${fileExt}`;
    
    if (processedBlobUrl) URL.revokeObjectURL(processedBlobUrl);
    processedBlobUrl = URL.createObjectURL(finalBlob);

    resizedPreview.src = processedBlobUrl;
    resizedPreview.style.display = 'block';

    processedImageInfo.style.display = 'block';
    processedImageInfo.innerHTML = `
        <strong>Optimized Details</strong><br>
        Resolution: ${finalCanvas.width} × ${finalCanvas.height} px<br>
        Size: ${(finalBlob.size / 1024).toFixed(2)} KB<br>
        Format: ${fileExt.toUpperCase()}
    `;

    // Setup Download Button
    downloadBtn.style.display = 'block';
    downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = processedBlobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // Scroll to results
    downloadBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// --- Sidebar Resizer Logic ---
const dragResizer = document.getElementById('dragResizer');
let isResizing = false;

dragResizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
});

window.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const containerWidth = editorState.getBoundingClientRect().width;
    let newSidebarWidth = containerWidth - e.clientX;
    
    // Constrain the sidebar width
    if (newSidebarWidth < 250) newSidebarWidth = 250;
    if (newSidebarWidth > 800) newSidebarWidth = 800;
    
    editorState.style.gridTemplateColumns = `1fr 5px ${newSidebarWidth}px`;
});

window.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
    }
});

// --- Crop Panning Logic ---
let isPanningCrop = false;

preview.addEventListener('mousedown', (e) => {
    if (!cropMode) return;
    isPanningCrop = true;
    preview.style.cursor = 'grabbing';
    e.preventDefault();
});

window.addEventListener('mousemove', (e) => {
    if (!isPanningCrop) return;
    
    // Using movementX/Y directly; negative movement means we push the image inside the box
    cropPanX -= (e.movementX / preview.clientWidth) * 100;
    cropPanY -= (e.movementY / preview.clientHeight) * 100;
    
    cropPanX = Math.max(0, Math.min(100, cropPanX));
    cropPanY = Math.max(0, Math.min(100, cropPanY));
    
    updateLivePreview();
});

window.addEventListener('mouseup', () => {
    if (isPanningCrop) {
        isPanningCrop = false;
        preview.style.cursor = cropMode ? 'grab' : 'default';
    }
});
