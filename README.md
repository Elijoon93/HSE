# SafetyManage Mobile — Mining v4.1.1

این نسخه بدون ثبت‌نام و بدون فعال‌سازی باز می‌شود.

## حالت مهمان

- همه منوهای اصلی دیده می‌شوند.
- کاربر می‌تواند معدن/مجتمع و سایت را برای پیش‌نمایش تغییر دهد.
- منوهای تخصصی معدن، کارخانه یا اکتشاف مطابق سایت انتخاب‌شده نمایش داده می‌شوند.
- ثبت، ارسال، مجوز کار، بازرسی، ارزیابی ریسک و حادثه قفل هستند.
- سوابق، اقدامات اصلاحی و KPIهای واقعی نمایش داده نمی‌شوند.
- دکمه «ثبت‌نام / فعال‌سازی» فرم درخواست حساب را باز می‌کند.
- پس از ثبت درخواست، محیط به‌صورت Pending Preview باز می‌ماند.
- پس از دریافت Access Token، قفل عملیات برداشته می‌شود.

## Web App

https://script.google.com/macros/s/AKfycby2F772UBGmJOmnOvwrzmlFYd1DNvbucufvo7IGtRiEGK3qz0dRSlHeTSSPSrl1gGpgdw/exec

رشته URL ارسالی شامل دو نشانی چسبیده بود. نسخه معتبر و درج‌شده در `config.js` فقط URL منفرد بالا است.

## Commit

feat: enable guest preview with locked HSE modules and update Apps Script endpoint
