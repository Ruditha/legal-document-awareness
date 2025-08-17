# Legal Awareness App - LLM Integration Setup

## Overview
This guide helps you set up the Legal Awareness App with Google Gemini LLM integration for advanced document analysis.

## Prerequisites

1. **Google Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Keep the key secure - you'll need it for setup

2. **Python Environment**
   - Python 3.8 or higher
   - pip package manager

3. **Node.js/Expo Environment**
   - Node.js 16 or higher
   - Expo CLI installed

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your API key
# Replace 'your_gemini_api_key_here' with your actual Gemini API key
```

**Example .env file:**
```
GEMINI_API_KEY=AIzaSyABC123...your_actual_key_here
ENV=development
DEBUG=True
MAX_FILE_SIZE_MB=5
ALLOWED_FILE_TYPES=png,jpg,jpeg,tiff,bmp
```

### 3. Install OCR Dependencies

**For Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

**For macOS:**
```bash
brew install tesseract
```

**For Windows:**
- Download Tesseract from [GitHub releases](https://github.com/UB-Mannheim/tesseract/wiki)
- Add Tesseract to your PATH

### 4. Start the Backend Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 5. Test Backend Health

Open your browser and visit: `http://localhost:8000/health`

**Expected response:**
```json
{
  "status": "healthy",
  "message": "Legal Awareness App Backend is running",
  "llm_available": true,
  "version": "2.0.0"
}
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Frontend

```bash
npm start
```

### 3. Platform-Specific URLs

The app automatically configures the backend URL based on platform:

- **Web/iOS Simulator:** `http://localhost:8000`
- **Android Emulator:** `http://10.0.2.2:8000`

## Testing the Integration

### 1. End-to-End Test

1. **Start both servers** (backend and frontend)
2. **Open the app** in your browser or mobile device
3. **Upload a legal document image** (contract, agreement, etc.)
4. **Click "Process Document"**
5. **Verify the response** contains:
   - AI-generated summary
   - Key legal points
   - No demo mode indicators

### 2. Test Scenarios

#### Scenario A: LLM Success
- **Setup:** Valid Gemini API key in .env
- **Expected:** Real AI analysis with detailed summary and key points
- **Response metadata:** `"processing_method": "LLM-enhanced"`

#### Scenario B: LLM Fallback
- **Setup:** Invalid/missing API key
- **Expected:** Local model analysis (basic functionality)
- **Response metadata:** `"processing_method": "Local models"`

#### Scenario C: Backend Offline
- **Setup:** Backend server not running
- **Expected:** Demo mode activated with fallback content
- **UI:** Demo mode banner visible

### 3. API Testing with cURL

```bash
# Health check
curl http://localhost:8000/health

# Document processing (replace with actual image file)
curl -X POST "http://localhost:8000/process_document" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@sample_contract.jpg"
```

## Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY environment variable is required"**
   - Ensure your .env file exists in the backend directory
   - Check that your API key is correctly set
   - Restart the backend server after changing .env

2. **"Failed to fetch" errors in frontend**
   - Verify backend server is running on port 8000
   - Check that your device/emulator can reach the backend URL
   - For Android emulator, ensure you're using `http://10.0.2.2:8000`

3. **OCR processing failed**
   - Ensure Tesseract is installed and in PATH
   - Try with a clearer, higher-resolution image
   - Check that the image format is supported

4. **LLM requests timing out**
   - Check your internet connection
   - Verify your Gemini API key has sufficient quota
   - Try with a shorter document

### Debug Mode

Enable detailed logging by setting `DEBUG=True` in your .env file:

```bash
# Backend logs will show detailed processing steps
tail -f backend_logs.txt

# Frontend network requests can be seen in browser console
```

## Production Deployment

### Security Considerations

1. **Never commit .env files** to version control
2. **Use environment variables** in production (not .env files)
3. **Implement rate limiting** for the API endpoints
4. **Add authentication** for production use
5. **Use HTTPS** for all communications

### Environment Variables for Production

```bash
export GEMINI_API_KEY="your_production_key"
export ENV="production"
export DEBUG="False"
export ALLOWED_ORIGINS="https://yourdomain.com"
```

### Performance Optimization

1. **Use proper caching** for model loading
2. **Implement request queuing** for high traffic
3. **Monitor API usage** and costs
4. **Set up error tracking** (Sentry integration available)

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Support

For technical issues:
1. Check the troubleshooting section above
2. Review backend logs for error details
3. Test with the health endpoint first
4. Verify environment configuration

The app now provides sophisticated legal document analysis using Google's Gemini LLM, with robust fallback mechanisms for reliability.
