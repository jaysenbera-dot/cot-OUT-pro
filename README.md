# Cut OUT Pro AI 🎯

> Professional AI-Powered Background Removal Tool

A full-stack web application for automated image background removal using advanced AI technology. Built with Python/Flask backend and vanilla JavaScript frontend.

## 🌟 Features

- ✂️ **Automated Background Removal**: High-speed removal powered by AI
- 🎨 **Intuitive Interface**: User-friendly design with drag-and-drop support
- ⚡ **Fast Processing**: Optimized backend for rapid response times
- 🔒 **Secure**: API keys stored in environment variables (never exposed)
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- 🖼️ **Multiple Formats**: Support for PNG, JPG, GIF, WebP
- 📥 **Easy Download**: One-click image download

## 🛠️ Technologies

**Backend:**
- Python 3.8+
- Flask - Web framework
- Flask-CORS - Cross-origin support
- Requests - HTTP client
- python-dotenv - Environment management

**Frontend:**
- HTML5
- CSS3 (Modern styling with gradients & animations)
- Vanilla JavaScript (No dependencies)

**API:**
- [remove.bg](https://www.remove.bg/api) - Professional background removal

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- A remove.bg API key (get one for free at https://www.remove.bg/api)
- Modern web browser

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jaysenbera-dot/cut-OUT-pro.git
cd cut-OUT-pro
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your remove.bg API key:

```env
REMOVE_BG_API_KEY=your_api_key_here
FLASK_ENV=production
FLASK_DEBUG=False
```

**Get your API key:**
1. Visit https://www.remove.bg/api
2. Sign up for a free account
3. Copy your API key
4. Paste it in `.env`

### 3. Run the Application

#### Start the Backend Server

```bash
cd backend
python app.py
```

The backend will be available at `http://localhost:5000`

#### Open the Frontend

Open `frontend/index.html` in your web browser or serve it with a local server:

```bash
# Using Python 3
python -m http.server 8000 --directory frontend

# Or using Node.js http-server
npx http-server frontend
```

Then visit `http://localhost:8000`

## 📖 API Documentation

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "api_key_configured": true
}
```

### Remove Background

```
POST /api/remove-background
Content-Type: multipart/form-data
```

**Parameters:**
- `image_file` (file, required): Image file to process

**Success Response (200):**
```
Content-Type: image/png
[PNG image data with transparent background]
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

**Error Cases:**
- No file provided
- Invalid file type
- File too large (> 10MB)
- API key not configured
- Network error

## 🔒 Security Features

✅ **Environment Variables**: API key stored securely, never exposed in code
✅ **Input Validation**: File type and size validation on backend
✅ **CORS Protection**: Cross-origin requests properly configured
✅ **Error Handling**: Safe error messages (no sensitive data leaked)
✅ **No Hardcoded Secrets**: All credentials in .env (git ignored)

## 📁 Project Structure

```
cut-OUT-pro/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Environment variables (git ignored)
│   └── .env.example        # Example environment file
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # Styling
│   └── script.js           # Frontend logic
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🚢 Deployment

### Deploy Backend to Heroku

```bash
# Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

heroku login
heroku create your-app-name
git push heroku main
heroku config:set REMOVE_BG_API_KEY=your_api_key
```

### Deploy Backend to PythonAnywhere

1. Sign up at https://www.pythonanywhere.com
2. Upload your backend files
3. Configure a WSGI file
4. Set environment variables in web app settings
5. Reload web app

### Deploy Frontend to GitHub Pages

```bash
# Push frontend files to gh-pages branch
git subtree push --prefix frontend origin gh-pages
```

Then update `API_BASE_URL` in `script.js` to point to your deployed backend.

## 🐛 Troubleshooting

### "Backend server is not accessible"
- Make sure the Flask server is running on port 5000
- Check that `API_BASE_URL` in `script.js` matches your backend URL
- Check browser console for CORS errors

### "Invalid API Key"
- Verify your remove.bg API key is correct
- Check that `.env` file is in the `backend/` directory
- Restart Flask server after updating `.env`

### "File too large"
- Maximum file size is 10MB
- Compress your image before uploading

### "Invalid file type"
- Supported formats: PNG, JPG, JPEG, GIF, WebP
- Try converting your image to PNG

## 📊 API Limits

**remove.bg Free Plan:**
- 50 API calls/month
- Up to 625x625 pixels

**remove.bg Pro Plan:**
- Unlimited API calls
- Up to 25MP resolution

See [pricing](https://www.remove.bg/pricing) for more details.

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [remove.bg](https://www.remove.bg/) for the powerful background removal API
- All contributors and users

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review the troubleshooting section

---

**Made with ❤️ by the Cut OUT Pro Team**
