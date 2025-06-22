from flask import Flask, render_template, request, jsonify, send_file
import os
import subprocess
import threading
from datetime import datetime

app = Flask(__name__, static_folder='public', static_url_path='')

# مسار مؤقت لصور الشاشات
SCREENSHOTS_DIR = "screenshots"
if not os.path.exists(SCREENSHOTS_DIR):
    os.makedirs(SCREENSHOTS_DIR)

# حالة التقاط الشاشة
capture_in_progress = False
last_capture_time = None

@app.route('/')
def index():
    return send_file('public/index.html')

@app.route('/capture', methods=['POST'])
def capture_screen():
    global capture_in_progress, last_capture_time
    
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    # التحقق من أن عملية التقاط جديدة ليست جارية
    if capture_in_progress:
        return jsonify({"error": "Capture in progress. Please try again later."}), 429
    
    # التحقق من عدم تكرار الطلبات بسرعة كبيرة
    if last_capture_time and (datetime.now() - last_capture_time).total_seconds() < 5:
        return jsonify({"error": "Please wait before requesting another capture"}), 429
    
    capture_in_progress = True
    last_capture_time = datetime.now()
    
    # بدء عملية التقاط في خلفية
    threading.Thread(target=run_capture, args=(url,)).start()
    
    return jsonify({"message": "Capture started. Please check back in a few seconds."})

def run_capture(url):
    global capture_in_progress
    
    try:
        # تشغيل خدمة التقاط الشاشة
        result = subprocess.run(
            ["python", "screenshot_service.py", url],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"Error capturing screen: {result.stderr}")
    finally:
        capture_in_progress = False

@app.route('/screenshots/<path:filename>')
def serve_screenshot(filename):
    return send_file(os.path.join(SCREENSHOTS_DIR, filename))

@app.route('/tutorials')
def get_tutorials():
    tutorials = [
        {
            "id": "github",
            "name": "جيت هب (GitHub)",
            "steps": [
                {
                    "title": "إنشاء مستودع جديد",
                    "description": "اضغط على علامة (+) في الزاوية العلوية اليمنى واختر 'مستودع جديد' من القائمة المنسدلة.",
                    "point": {"x": 180, "y": 85}
                },
                {
                    "title": "تسمية المستودع",
                    "description": "أدخل اسمًا للمستودع الجديد في حقل 'اسم المستودع'، واختر ما إذا سيكون عامًا أو خاصًا.",
                    "point": {"x": 280, "y": 210}
                },
                {
                    "title": "إنشاء المستودع",
                    "description": "اضغط على زر 'إنشاء مستودع' الأخضر في أسفل الصفحة. انتظر حتى ينتهي النظام من إنشاء المستودع الجديد.",
                    "point": {"x": 420, "y": 300}
                }
            ]
        },
        {
            "id": "youtube",
            "name": "يوتيوب (YouTube)",
            "steps": [
                {
                    "title": "رفع فيديو جديد",
                    "description": "اضغط على أيقونة الكاميرا مع علامة (+) في الزاوية العلوية اليمنى واختر 'رفع فيديو'.",
                    "point": {"x": 920, "y": 85}
                },
                {
                    "title": "اختيار الفيديو",
                    "description": "اسحب ملف الفيديو إلى المنطقة المحددة أو اضغط على 'اختيار ملفات' لاختيار الفيديو من جهازك.",
                    "point": {"x": 550, "y": 300}
                },
                {
                    "title": "إضافة التفاصيل",
                    "description": "أدخل عنوان الفيديو ووصفه وعلاماته الوصفية في الحقول المخصصة، ثم اضغط على 'نشر'.",
                    "point": {"x": 780, "y": 650}
                }
            ]
        }
    ]
    return jsonify(tutorials)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)