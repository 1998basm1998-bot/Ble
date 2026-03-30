// مصفوفة لتخزين الرحلات، نقوم بجلبها من التخزين المحلي إن وُجدت
let rides = JSON.parse(localStorage.getItem('myRides')) || [];

// 1. وظيفة التبديل بين التبويبات
function switchTab(tabId) {
    // إخفاء جميع الأقسام
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // إزالة اللون النشط من جميع أزرار التنقل
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // تفعيل القسم المطلوب
    document.getElementById(tabId).classList.add('active');

    // تفعيل زر التنقل المطابق للقسم
    // نبحث عن الزر الذي يستدعي الدالة بنفس الـ tabId
    const activeBtn = Array.from(navItems).find(btn => btn.getAttribute('onclick').includes(tabId));
    if (activeBtn) activeBtn.classList.add('active');

    // إذا انتقلنا لقسم رحلاتي، نقوم بتحديث العرض
    if (tabId === 'rides') {
        renderRides();
    }
}

// 2. وظيفة جلب الموقع الحالي باستخدام GPS
function getCurrentLocation() {
    const pickupInput = document.getElementById('pickup');
    pickupInput.value = "جاري تحديد الموقع...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // في التطبيقات الحقيقية، نستخدم خطوط الطول والعرض مع خرائط جوجل لتحويلها لعنوان.
                // هنا سنكتب إحداثيات وهمية أو نص كبديل تعليمي.
                const lat = position.coords.latitude.toFixed(4);
                const lng = position.coords.longitude.toFixed(4);
                pickupInput.value = `موقعي الحالي (Lat: ${lat}, Lng: ${lng})`;
            },
            (error) => {
                pickupInput.value = "";
                alert("تعذر الوصول إلى الموقع. تأكد من تفعيل الـ GPS.");
            }
        );
    } else {
        alert("متصفحك لا يدعم تحديد الموقع.");
    }
}

// متغير لتخزين الكلفة المحسوبة
let currentCalculatedCost = 0;

// 3. وظيفة حساب التكلفة (عملية حسابية وهمية كأمثلة)
function calculateCost() {
    const pickup = document.getElementById('pickup').value;
    const dropoff = document.getElementById('dropoff').value;
    const carType = document.getElementById('car-type').value;

    if (!pickup || !dropoff) {
        alert("يرجى تحديد موقع الانطلاق والوجهة أولاً.");
        return;
    }

    // تسعير وهمي بناءً على نوع السيارة
    let basePrice = 3000; // 3000 دينار مثلاً
    if (carType === 'عائلي') basePrice += 2000;
    if (carType === 'VIP') basePrice += 5000;
    if (carType === 'فان') basePrice += 4000;

    // إضافة قيمة عشوائية للمسافة كتقريب
    const distanceCost = Math.floor(Math.random() * 4000) + 1000;
    currentCalculatedCost = basePrice + distanceCost;

    document.getElementById('cost-display').innerText = `التكلفة التقديرية: ${currentCalculatedCost} د.ع`;
}

// 4. وظيفة تأكيد الطلب
function confirmRide() {
    const pickup = document.getElementById('pickup').value;
    const dropoff = document.getElementById('dropoff').value;
    const carType = document.getElementById('car-type').value;
    const notes = document.getElementById('notes').value;

    if (!pickup || !dropoff) {
        alert("الرجاء ملء حقلي الانطلاق والوجهة.");
        return;
    }

    if (currentCalculatedCost === 0) {
        alert("الرجاء حساب الكلفة أولاً.");
        return;
    }

    // إنشاء كائن (Object) يمثل الرحلة
    const newRide = {
        id: Date.now(), // رقم تعريفي فريد يعتمد على الوقت
        pickup: pickup,
        dropoff: dropoff,
        carType: carType,
        cost: currentCalculatedCost,
        notes: notes,
        status: 'جاري البحث عن سائق',
        date: new Date().toLocaleString('ar-EG')
    };

    // إضافة الرحلة للمصفوفة وحفظها في التخزين المحلي
    rides.push(newRide);
    localStorage.setItem('myRides', JSON.stringify(rides));

    alert("تم تأكيد طلبك بنجاح!");
    
    // تصفير الحقول
    document.getElementById('pickup').value = '';
    document.getElementById('dropoff').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('cost-display').innerText = '';
    currentCalculatedCost = 0;

    // الانتقال إلى قسم رحلاتي
    switchTab('rides');
}

// 5. وظيفة عرض الرحلات المحفوظة
function renderRides() {
    const ridesList = document.getElementById('rides-list');
    ridesList.innerHTML = ''; // تفريغ القائمة قبل إعادة بنائها

    if (rides.length === 0) {
        ridesList.innerHTML = '<p style="text-align:center; color:#ccc;">لا توجد رحلات سابقة.</p>';
        return;
    }

    // ترتيب الرحلات بحيث تظهر الأحدث أولاً
    const reversedRides = [...rides].reverse();

    reversedRides.forEach(ride => {
        // إنشاء بطاقة الرحلة
        const rideCard = document.createElement('div');
        rideCard.className = 'ride-card';
        rideCard.innerHTML = `
            <div class="ride-status">${ride.status}</div>
            <p><strong>من:</strong> ${ride.pickup}</p>
            <p><strong>إلى:</strong> ${ride.dropoff}</p>
            <p><strong>السيارة:</strong> ${ride.carType}</p>
            <p><strong>التكلفة:</strong> ${ride.cost} د.ع</p>
            <p style="font-size:0.8em; color:#ccc; margin-top:10px;">🕒 ${ride.date}</p>
        `;
        ridesList.appendChild(rideCard);
    });
}

// 6. وظيفة مسح البيانات (في قسم حسابي)
function clearData() {
    if(confirm("هل أنت متأكد من مسح جميع سجلات الرحلات؟")) {
        rides = [];
        localStorage.removeItem('myRides');
        alert("تم مسح البيانات.");
        renderRides();
    }
}

// عرض الرحلات عند تحميل الصفحة لأول مرة (في حال كان هناك بيانات محفوظة)
renderRides();
