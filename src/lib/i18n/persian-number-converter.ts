// utils/persian-number-converter.ts

/**
 * تبدیل اعداد فارسی/عربی به انگلیسی
 */
export function convertPersianToEnglish(str: string | number): string | number {
  if (typeof str === 'number') return str;
  if (typeof str !== 'string') return str;

  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let result = str;

  // تبدیل فارسی
  persianNumbers.forEach((persian, index) => {
    result = result.replace(new RegExp(persian, 'g'), englishNumbers[index]);
  });

  // تبدیل عربی
  arabicNumbers.forEach((arabic, index) => {
    result = result.replace(new RegExp(arabic, 'g'), englishNumbers[index]);
  });

  // حذف جداکننده‌های هزارگان فارسی/عربی
  result = result.replace(/٬/g, ''); // جداکننده فارسی
  result = result.replace(/٫/g, '.'); // ممیز اعشار فارسی به نقطه انگلیسی
  result = result.replace(/،/g, ''); // کاما فارسی

  return result;
}

/**
 * تبدیل یک سطر داده (تمام مقادیر)
 */
export function normalizeDataRow(row: { [key: string]: any }): { [key: string]: any } {
  const normalized: { [key: string]: any } = {};

  Object.keys(row).forEach((key) => {
    const value = row[key];

    if (typeof value === 'string') {
      const converted = convertPersianToEnglish(value);
      // اگر بعد از تبدیل، عدد شد، پارس کن
      const trimmed = (converted as string).trim();
      const num = parseFloat(trimmed);
      normalized[key] = isNaN(num) ? converted : num;
    } else {
      normalized[key] = value;
    }
  });

  return normalized;
}

export function testConverter() {
  const tests = [
    '۹٬۹۰۰',
    '۸٬۳۰۰',
    '۱۲٬۸۵۰',
    '۱٫۵', 
    '۱۲۳۴', 
    'تهران', 
  ];

  console.log('=== Test Persian Number Converter ===');
  tests.forEach(test => {
    const converted = convertPersianToEnglish(test);
    const num = parseFloat(converted as string);
    console.log(`"${test}" → "${converted}" → ${isNaN(num) ? 'NaN' : num}`);
  });
}
