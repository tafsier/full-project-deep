// عناصر DOM
const tutorialSection = document.getElementById('tutorial-section');
const appMockup = document.getElementById('app-mockup');
const stepPointer = document.getElementById('step-pointer');
const currentStepEl = document.getElementById('current-step');
const totalStepsEl = document.getElementById('total-steps');
const stepTitleEl = document.getElementById('step-title');
const stepDescriptionEl = document.getElementById('step-description');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const appOptions = document.getElementById('app-options');
const searchInput = document.getElementById('app-search');
const searchBtn = document.getElementById('search-btn');

// حالة التطبيق
let currentTutorial = null;
let currentStep = 0;
let tutorialsData = [];

// تهيئة التطبيق
async function initApp() {
    try {
        // جلب البيانات التعليمية من الخادم
        const response = await fetch('/tutorials');
        tutorialsData = await response.json();
        
        // عرض خيارات التطبيقات
        renderAppOptions();
        
        // إظهار أول تطبيق بشكل افتراضي
        if (tutorialsData.length > 0) {
            loadTutorial(tutorialsData[0].id);
        }
    } catch (error) {
        console.error('فشل في جلب البيانات التعليمية:', error);
        alert('حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.');
    }
}

// عرض خيارات التطبيقات
function renderAppOptions() {
    appOptions.innerHTML = '';
    
    tutorialsData.forEach(tutorial => {
        const option = document.createElement('div');
        option.className = 'app-option';
        option.dataset.app = tutorial.id;
        
        option.innerHTML = `
            <div class="app-icon" style="background-image: url('https://via.placeholder.com/200x120?text=${tutorial.name}')"></div>
            <div class="app-name">${tutorial.name}</div>
        `;
        
        option.addEventListener('click', () => {
            loadTutorial(tutorial.id);
        });
        
        appOptions.appendChild(option);
    });
}

// تحميل البرنامج التعليمي
async function loadTutorial(tutorialId) {
    // إظهار مؤشر التحميل
    showLoading(true);
    
    try {
        // العثور على البرنامج التعليمي المحدد
        currentTutorial = tutorialsData.find(t => t.id === tutorialId);
        
        if (!currentTutorial) {
            throw new Error('البرنامج التعليمي غير موجود');
        }
        
        // إعادة تعيين الخطوة الحالية
        currentStep = 0;
        
        // تحديث واجهة المستخدم
        updateTutorialUI();
        
        // التقاط شاشة جديدة للموقع (يمكن تعطيلها للاستخدام المنتظم)
        // await captureNewScreenshot('https://github.com');
        
        // استخدام صورة افتراضية للموقع
        appMockup.style.backgroundImage = "url('https://via.placeholder.com/800x450?text=واجهة+" + currentTutorial.name + "')";
        
        // إظهار قسم التعليمات
        tutorialSection.classList.add('active-tutorial');
    } catch (error) {
        console.error('فشل في تحميل البرنامج التعليمي:', error);
        alert('حدث خطأ أثناء تحميل البرنامج التعليمي. يرجى المحاولة مرة أخرى.');
    } finally {
        // إخفاء مؤشر التحميل
        showLoading(false);
    }
}

// التقاط شاشة جديدة للموقع
async function captureNewScreenshot(url) {
    try {
        const response = await fetch('/capture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // الانتظار لبضع ثوانٍ لالتقاط الشاشة
            setTimeout(() => {
                // استخدام أحدث صورة متاحة
                const timestamp = new Date().getTime();
                appMockup.style.backgroundImage = `url('/screenshots/screenshot_${timestamp}.png?${timestamp}')`;
            }, 5000);
        } else {
            console.error('فشل في التقاط الشاشة:', result.error);
        }
    } catch (error) {
        console.error('فشل في طلب التقاط الشاشة:', error);
    }
}

// تحديث واجهة المستخدم بناءً على الخطوة الحالية
function updateTutorialUI() {
    if (!currentTutorial || !currentTutorial.steps) return;
    
    const totalSteps = currentTutorial.steps.length;
    const step = currentTutorial.steps[currentStep];
    
    // تحديث المعلومات
    stepTitleEl.textContent = step.title;
    stepDescriptionEl.textContent = step.description;
    currentStepEl.textContent = currentStep + 1;
    totalStepsEl.textContent = totalSteps;
    
    // تحديث موضع المؤشر
    stepPointer.style.display = 'flex';
    stepPointer.style.left = `${step.point.x}px`;
    stepPointer.style.top = `${step.point.y}px`;
    
    // تحديث حالة الأزرار
    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep === totalSteps - 1;
}

// الانتقال إلى الخطوة التالية
function nextStep() {
    if (!currentTutorial || !currentTutorial.steps) return;
    
    if (currentStep < currentTutorial.steps.length - 1) {
        currentStep++;
        updateTutorialUI();
    }
}

// الرجوع إلى الخطوة السابقة
function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        updateTutorialUI();
    }
}

// إظهار/إخفاء مؤشر التحميل
function showLoading(show) {
    if (show) {
        let loading = document.querySelector('.loading');
        if (!loading) {
            loading = document.createElement('div');
            loading.className = 'loading';
            loading.innerHTML = '<div class="spinner"></div>';
            tutorialSection.appendChild(loading);
        }
    } else {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }
}

// البحث عن تطبيق
function searchForApp() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        alert('الرجاء إدخال اسم تطبيق أو موقع للبحث');
        return;
    }
    
    // البحث في قائمة التطبيقات
    const foundApp = tutorialsData.find(app => 
        app.name.toLowerCase().includes(searchTerm) || 
        app.id.toLowerCase().includes(searchTerm)
    );
    
    if (foundApp) {
        loadTutorial(foundApp.id);
    } else {
        alert('لم يتم العثور على تطبيق بهذا الاسم. الرجاء المحاولة مرة أخرى.');
    }
}

// تهيئة الأحداث
function initEvents() {
    nextBtn.addEventListener('click', nextStep);
    prevBtn.addEventListener('click', prevStep);
    searchBtn.addEventListener('click', searchForApp);
    
    // البحث عند الضغط على Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchForApp();
        }
    });
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    initApp();
});