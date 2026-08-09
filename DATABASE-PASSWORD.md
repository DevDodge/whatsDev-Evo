# تعليمات تحديث Password الداتابيز

**⚠️ مهم جداً:**

قبل تشغيل المشاريع، محتاج تعدل password الداتابيز في:

## ملف: `evolution-api/.env`

**السطر رقم 13:**
```env
DATABASE_CONNECTION_URI=postgresql://postgres:password@localhost:10034/evolution?schema=public&sslmode=disable
```

**غير `password` بالباسورد الحقيقي للـ PostgreSQL**

مثال:
```env
DATABASE_CONNECTION_URI=postgresql://postgres:YourRealPassword123@localhost:10034/evolution?schema=public&sslmode=disable
```

---

## بعد تحديث الباسورد:

### الخطوة 1: إنشاء Database
```bash
cd evolution-api
npm run db:deploy:win
```

### الخطوة 2: تشغيل Evolution API
```bash
npm start
```

---

## إذا Database موجود مسبقاً:

فقط شغل:
```bash
cd evolution-api
npm start
```

---

**ملاحظة:** البورت الصحيح هو **10034** وتم تعديله في الإعدادات ✅
