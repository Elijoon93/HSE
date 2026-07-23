# SafetyManage Mobile — Mining v4.1

نسخه Corporate Branding, Preview Access & Dedicated Admin Key.

## تغییرات اصلی

- لوگوی سطح هلدینگ: **هلدینگ صنعتی معدنی فولاد یزد**
- لوگوی سطح شرکت عملیاتی: **مجتمع صنعت و معدن ذوب‌آهن جنوب شرق ایرانیان / SISOO**
- هر دو پروفایل در `BrandProfiles` قفل شده‌اند.
- حساب Pending همه منوها را در حالت پیش‌نمایش می‌بیند، اما ثبت، ارسال و سوابق واقعی قفل هستند.
- هفت تم حرفه‌ای قابل انتخاب است.
- پاک‌کردن رکوردهای محلی از بازنشانی کامل دستگاه جدا شده است.
- مسیر اختصاصی شش‌رقمی برای حساب رزروشده دکتر میثم کوهساری اضافه شده است.
- کلید خام در GitHub، HTML، config.js یا Apps Script قرار ندارد.
- کلید پس از نخستین استفاده به RequestID و DeviceID همان حساب متصل می‌شود.
- پنج تلاش ناموفق باعث قفل موقت ۳۰ دقیقه‌ای می‌شود.

## Web App

`https://script.google.com/macros/s/AKfycbzvrVe9q3m4RMil5ZtjvXTQwhIWHmzxgFjJ7wtdMt2fAQs3pMQ6mVutoAhDJtTdHFttUA/exec`

## استقرار

1. `Code.gs` را با `apps-script/SafetyManage_Corporate_Access_Gateway_v4_1.gs` جایگزین کنید.
2. تابع `initializeCorporateAccessV41` را اجرا کنید.
3. Deployment موجود را با New version به‌روزرسانی کنید.
4. محتوای این بسته را در GitHub جایگزین کنید.

## پیام Commit

`feat: add locked corporate branding pending preview themes and dedicated co-owner key`
