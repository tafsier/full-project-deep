import sys
import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

SCREENSHOTS_DIR = "screenshots"

def capture_screenshot(url):
    # إعداد متصفح Chrome بدون واجهة
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1200,800")
    
    # استخدام ChromeDriverManager لتثبيت السواق المناسب
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    
    try:
        # الانتقال إلى URL المطلوب
        driver.get(url)
        
        # الانتظار لتحميل الصفحة
        time.sleep(3)
        
        # إنشاء اسم ملف فريد بناءً على الوقت
        timestamp = int(time.time())
        filename = f"screenshot_{timestamp}.png"
        filepath = os.path.join(SCREENSHOTS_DIR, filename)
        
        # التقاط الشاشة وحفظها
        driver.save_screenshot(filepath)
        
        print(f"تم التقاط الشاشة وحفظها في: {filepath}")
        return filename
    except Exception as e:
        print(f"حدث خطأ أثناء التقاط الشاشة: {str(e)}")
        return None
    finally:
        driver.quit()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("الاستخدام: python screenshot_service.py <URL>")
        sys.exit(1)
    
    url = sys.argv[1]
    screenshot_file = capture_screenshot(url)
    
    if screenshot_file:
        print(screenshot_file)
    else:
        sys.exit(1)