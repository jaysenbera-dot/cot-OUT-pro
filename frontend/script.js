// Configuration
const API_BASE_URL = 'http://localhost:5000';
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
        console.log('Starting background removal for:', file.name);
        
        // Prepare form data
        const formData = new FormData();
        formData.append('image_file', file);
        
        // Send request to backend
        console.log('Sending request to:', `${API_BASE_URL}/api/remove-background`);
        const response = await fetch(`${API_BASE_URL}/api/remove-background`, {
            method: 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status);
        
        // Hide loading spinner
        loadingSpinner.classList.add('hidden');
        
        if (response.ok) {
            console.log('✅ Successfully received image from backend');
            // Get blob from response
            const blob = await response.blob();
            console.log('Blob size:', blob.size, 'Type:', blob.type);
            const url = URL.createObjectURL(blob);
            
            // Display result
            displayResult(url);
        } else {
            // Handle error response
            console.error('API returned error status:', response.status);
            try {
                const errorData = await response.json();
                console.error('Error details:', errorData);
                showError(errorData.error || 'Failed to remove background. Please try again.');
            } catch {
                showError(`Server error (${response.status}). Check backend console for details.`);
            }
        }
    } catch (error) {
        loadingSpinner.classList.add('hidden');
        console.error('Fetch error:', error);
        showError(`Error: ${error.message}\n\nMake sure:\n1. Backend server is running on http://localhost:5000\n2. Your remove.bg API key is valid\n3. You have internet connection`);
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
        <img src="${imageUrl}" alt="Result" style="border-radius: 8px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);">
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
        console.error('Clipboard error:', error);
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
    resultDiv.innerHTML = `<div class="error" style="white-space: pre-wrap;">❌ ${message}</div>`;
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
        console.log('Checking backend connectivity...');
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend is connected', data);
            if (!data.api_key_configured) {
                showError('⚠️ WARNING: API key not configured! Set REMOVE_BG_API_KEY in backend/.env');
            }
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        showError('⚠️ Backend server is not running on http://localhost:5000. Please start it with: cd backend && python app.py');
    }
});
