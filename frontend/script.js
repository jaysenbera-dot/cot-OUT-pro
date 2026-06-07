// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// DOM Elements
const imageInput = document.getElementById('imageInput');
const removeBgBtn = document.getElementById('removeBgBtn');
const resultDiv = document.getElementById('result');
const loadingSpinner = document.getElementById('loadingSpinner');
const fileLabel = document.querySelector('.file-label');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');

// Event Listeners
imageInput.addEventListener('change', handleFileSelect);
fileLabel.addEventListener('dragover', handleDragOver);
fileLabel.addEventListener('dragleave', handleDragLeave);
fileLabel.addEventListener('drop', handleDrop);

/**
 * Handle file selection
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        validateAndPreviewFile(file);
    }
}

/**
 * Handle drag over
 */
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    fileLabel.classList.add('dragover');
}

/**
 * Handle drag leave
 */
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    fileLabel.classList.remove('dragover');
}

/**
 * Handle file drop
 */
function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    fileLabel.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        imageInput.files = files;
        validateAndPreviewFile(files[0]);
    }
}

/**
 * Validate and preview file
 */
function validateAndPreviewFile(file) {
    // Reset previous results
    resultDiv.innerHTML = '';
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        showError(`File too large! Maximum size is 10MB (Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        imageInput.value = '';
        removeBgBtn.disabled = true;
        imagePreview.classList.add('hidden');
        return;
    }
    
    // Validate file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        showError(`Invalid file type! Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`);
        imageInput.value = '';
        removeBgBtn.disabled = true;
        imagePreview.classList.add('hidden');
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        imagePreview.classList.remove('hidden');
        removeBgBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

/**
 * Remove background from image
 */
async function removeBg() {
    const file = imageInput.files[0];
    
    if (!file) {
        showError('Please select an image first');
        return;
    }
    
    // Show loading spinner
    loadingSpinner.classList.remove('hidden');
    resultDiv.innerHTML = '';
    removeBgBtn.disabled = true;
    
    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('image_file', file);
        
        // Send request to backend
        const response = await fetch(`${API_BASE_URL}/api/remove-background`, {
            method: 'POST',
            body: formData
        });
        
        // Hide loading spinner
        loadingSpinner.classList.add('hidden');
        
        if (response.ok) {
            // Get blob from response
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            // Display result
            displayResult(url);
        } else {
            // Handle error response
            const errorData = await response.json();
            showError(errorData.error || 'Failed to remove background. Please try again.');
        }
    } catch (error) {
        loadingSpinner.classList.add('hidden');
        showError(`Error: ${error.message}. Make sure the backend server is running.`);
    } finally {
        removeBgBtn.disabled = false;
    }
}

/**
 * Display result with download options
 */
function displayResult(imageUrl) {
    resultDiv.innerHTML = `
        <h3>✨ Background Removed Successfully!</h3>
        <img src="${imageUrl}" alt="Result">
        <div class="download-buttons">
            <a href="${imageUrl}" download="cutout.png" class="btn btn-primary">⬇️ Download PNG</a>
            <button onclick="copyImageUrl('${imageUrl}')" class="btn btn-secondary">📋 Copy Image</button>
            <button onclick="resetForm()" class="btn btn-secondary">🔄 Process Another</button>
        </div>
    `;
}

/**
 * Copy image to clipboard
 */
async function copyImageUrl(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
        ]);
        showSuccess('Image copied to clipboard!');
    } catch (error) {
        showError('Failed to copy image to clipboard');
    }
}

/**
 * Reset form
 */
function resetForm() {
    imageInput.value = '';
    resultDiv.innerHTML = '';
    imagePreview.classList.add('hidden');
    removeBgBtn.disabled = true;
}

/**
 * Show error message
 */
function showError(message) {
    resultDiv.innerHTML = `<div class="error">❌ ${message}</div>`;
}

/**
 * Show success message
 */
function showSuccess(message) {
    // Create temporary success message
    const tempDiv = document.createElement('div');
    tempDiv.className = 'success';
    tempDiv.innerHTML = `✅ ${message}`;
    document.body.appendChild(tempDiv);
    
    setTimeout(() => {
        tempDiv.remove();
    }, 3000);
}

/**
 * Check backend connectivity on page load
 */
window.addEventListener('load', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
            console.log('Backend is connected');
        }
    } catch (error) {
        console.warn('Backend server is not accessible:', error.message);
    }
});
