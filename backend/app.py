from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import io
from werkzeug.utils import secure_filename

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Get API key from environment variables
REMOVE_BG_API_KEY = os.getenv('REMOVE_BG_API_KEY')

if not REMOVE_BG_API_KEY:
    print("WARNING: REMOVE_BG_API_KEY environment variable not set!")

def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Cut OUT Pro API is running'
    }), 200

@app.route('/api/remove-background', methods=['POST'])
def remove_background():
    """
    Remove background from uploaded image
    
    Expected: multipart/form-data with 'image_file' field
    Returns: PNG image with transparent background
    """
    
    try:
        # Check if file is in request
        if 'image_file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided'
            }), 400
        
        file = request.files['image_file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Validate file extension
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': f'Invalid file type. Allowed types: {(", ".join(ALLOWED_EXTENSIONS))}'
            }), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({
                'success': False,
                'error': f'File too large. Maximum size: 10MB'
            }), 400
        
        # Read file content
        file_content = file.read()
        
        print(f"Processing image: {file.filename} (Size: {file_size} bytes)")
        print(f"API Key configured: {bool(REMOVE_BG_API_KEY)}")
        
        # Call remove.bg API
        headers = {
            'X-Api-Key': REMOVE_BG_API_KEY
        }
        
        files = {
            'image_file': (file.filename, file_content, file.content_type)
        }
        
        print("Sending request to remove.bg API...")
        response = requests.post(
            'https://api.remove.bg/v1.0/removebg',
            headers=headers,
            files=files,
            timeout=30
        )
        
        print(f"API Response Status: {response.status_code}")
        
        # Handle API response
        if response.status_code == 200:
            print("✅ Background removal successful!")
            return send_file(
                io.BytesIO(response.content),
                mimetype='image/png',
                as_attachment=False
            )
        else:
            error_details = response.text
            print(f"❌ API Error: {error_details}")
            try:
                error_data = response.json()
                error_message = error_data.get('errors', [{}])[0].get('title', 'Unknown error')
            except:
                error_message = error_details[:200]
            
            return jsonify({
                'success': False,
                'error': f'Remove.bg API error: {error_message}',
                'status_code': response.status_code
            }), response.status_code
    
    except requests.exceptions.Timeout:
        print("❌ API request timeout")
        return jsonify({
            'success': False,
            'error': 'API request timeout. Please try again.'
        }), 500
    
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Network error: Cannot connect to remove.bg API. Check your internet connection.'
        }), 500
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Network error: {str(e)}'
        }), 500
    
    except Exception as e:
        print(f"❌ Server error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    api_key_configured = bool(REMOVE_BG_API_KEY)
    return jsonify({
        'status': 'healthy',
        'api_key_configured': api_key_configured
    }), 200

if __name__ == '__main__':
    print("🚀 Cut OUT Pro API starting...")
    print(f"✅ API Key configured: {bool(REMOVE_BG_API_KEY)}")
    print("📍 Running on http://0.0.0.0:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
