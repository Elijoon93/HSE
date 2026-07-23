# معماری SafetyManage Portfolio v4.0

## لایه ۱ — GitHub Pages / PWA

برنامه موبایل عمومی است، اما هیچ دیتاشیت یا توکن کاربر را در سورس عمومی نگهداری نمی‌کند.

## لایه ۲ — Apps Script Gateway

وظایف:

- ثبت درخواست حساب
- تأیید یا فعال‌سازی با کد
- اعتبارسنجی نشست و دستگاه
- تعیین محدوده سازمان، سایت و واحد
- دریافت ماژول‌های مجاز
- مسیریابی رکورد عملیاتی به دیتاشیت مستقل
- ارائه داشبورد تجمیعی فقط برای نقش‌های مدیریتی
- ثبت AuditLog در مرکز کنترل

## لایه ۳ — مرکز کنترل

تب‌های اصلی:

- Organizations
- Sites
- Units
- Users
- Roles
- AccessRequests
- ActivationCodes
- Sessions
- AuditLog
- BrandProfiles
- OrganizationModules
- DataPartitions
- PortfolioDashboard

مرکز کنترل داده خام عملیاتی مجموعه‌ها را به‌عنوان دیتابیس اصلی نگهداری نمی‌کند.

## لایه ۴ — دیتاشیت‌های عملیاتی مستقل

هر فایل مستقل دارای:

- README
- Records
- Actions
- ChecklistTemplates
- ChecklistItems
- InspectionRuns
- InspectionResponses
- RiskAssessments
- Permits
- Incidents
- DailyReports
- Dashboard

## قاعده مسیریابی

`UnitCode → OrganizationCode → DataPartitions → SpreadsheetId`

شناسه دیتاشیت فقط در مرکز کنترل خصوصی نگهداری می‌شود و از `publicBootstrap` حذف شده است.

## سطوح دسترسی

- Reporter / Inspector / Supervisor: مجموعه و واحد خود
- MineHSEManager / FactoryHSEManager: مجموعه خود
- HoldingHSEManager: پرتفوی مجاز
- SystemAdmin / SystemOwner: همه مجموعه‌ها و تنظیمات

## محدودیت پایلوت

Google Sheets و Apps Script برای پایلوت و استقرار محدود مناسب‌اند. در مقیاس سازمانی بزرگ، Backend و دیتابیس SQL باید جایگزین لایه ذخیره‌سازی شوند.
