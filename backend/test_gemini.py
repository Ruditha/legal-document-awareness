#!/usr/bin/env python3
"""
Quick test script to verify Gemini API integration
Run this to test your API key before starting the full backend
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_gemini_api():
    """Test the Gemini API with your key."""
    print("🔍 Testing Gemini API Integration...")
    
    # Check if API key is set
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ No GEMINI_API_KEY found in environment")
        return False
    
    print(f"✅ API Key found: {api_key[:10]}...")
    
    try:
        # Test import
        import google.generativeai as genai
        print("✅ google.generativeai imported successfully")
        
        # Configure API
        genai.configure(api_key=api_key)
        print("✅ API configured")
        
        # Create model
        model = genai.GenerativeModel('gemini-1.5-flash')
        print("✅ Model created")
        
        # Test simple generation
        print("\n🧪 Testing document analysis...")
        test_text = """
        This Service Agreement is entered into between Company A and Company B.
        The term of this agreement is 12 months with automatic renewal.
        Payment is due within 30 days of invoice date.
        Either party may terminate with 30 days written notice.
        """
        
        prompt = f"""Analyze this legal document and provide a brief summary:
        
        {test_text}
        
        Focus on key terms, obligations, and important clauses."""
        
        response = model.generate_content(prompt)
        
        print("✅ API call successful!")
        print("\n📄 Sample Analysis Result:")
        print("-" * 50)
        print(response.text)
        print("-" * 50)
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Try: pip install google-generativeai")
        return False
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def test_backend_dependencies():
    """Test if all backend dependencies are available."""
    print("\n🔍 Testing Backend Dependencies...")
    
    dependencies = [
        ('fastapi', 'FastAPI web framework'),
        ('uvicorn', 'ASGI server'),
        ('python-multipart', 'File upload support'),
        ('PIL', 'Image processing'),
        ('pytesseract', 'OCR functionality'),
        ('google.generativeai', 'Gemini LLM integration'),
        ('python-dotenv', 'Environment variables')
    ]
    
    for dep, description in dependencies:
        try:
            __import__(dep)
            print(f"✅ {dep}: {description}")
        except ImportError:
            print(f"❌ {dep}: {description} - NOT INSTALLED")

if __name__ == "__main__":
    print("🚀 Legal Awareness App - LLM Integration Test")
    print("=" * 60)
    
    # Test dependencies
    test_backend_dependencies()
    
    print("\n" + "=" * 60)
    
    # Test Gemini API
    if test_gemini_api():
        print("\n🎉 SUCCESS! Your Gemini API integration is working!")
        print("\n📋 Next Steps:")
        print("1. Install missing dependencies (if any shown above)")
        print("2. Run: uvicorn main:app --reload --port 8000")
        print("3. Test frontend with real document upload")
        print("4. Check health endpoint: http://localhost:8000/health")
    else:
        print("\n⚠️ Issues found. Please check the errors above.")
        print("\n🔧 Troubleshooting:")
        print("- Verify your API key is correct")
        print("- Check internet connection")
        print("- Ensure google-generativeai is installed")
