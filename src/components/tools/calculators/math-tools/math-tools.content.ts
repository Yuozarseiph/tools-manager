import { useLanguage } from "@/context/LanguageContext";

export const mathToolsUIContent = {
  fa: {
    tools: {
      calculator: { name: "ماشین حساب", desc: "ماشین حساب ساده و پیشرفته" },
      percentage: { name: "محاسبه درصد", desc: "انواع محاسبات درصدی" },
      statistics: {
        name: "شاخص‌های آماری",
        desc: "میانگین، میانه، واریانس و...",
      },
      powerRoot: { name: "توان و جذر", desc: "محاسبه توان و جذر" },
      geometry2d: { name: "اشکال هندسی", desc: "محیط، مساحت، قطر و شعاع" },
      geometry3d: { name: "اشکال سه‌بعدی", desc: "حجم و مساحت سطح" },
      factor: { name: "فاکتور", desc: "مقسوم‌علیه‌های یک عدد" },
      random: { name: "اعداد تصادفی", desc: "تولید اعداد رندوم" },
      prime: { name: "عدد اول", desc: "تشخیص اول بودن" },
      equation: { name: "معادلات", desc: "حل معادلات درجه یک و دو" },
      logarithm: { name: "لگاریتم", desc: "محاسبه لگاریتم" },
      decimalFraction: { name: "اعشاری به کسری", desc: "تبدیل اعشاری و کسری" },
      baseConverter: { name: "تبدیل مبنا", desc: "تبدیل بین مبناها" },
      fibonacci: { name: "فیبوناچی", desc: "دنباله فیبوناچی" },
      factorial: { name: "فاکتوریل", desc: "محاسبه فاکتوریل" },
    },
    common: {
      calculate: "محاسبه",
      result: "نتیجه",
      clear: "پاک کردن",
      copy: "کپی",
      copied: "کپی شد!",
      error: "خطا در محاسبه",
      enterNumber: "عدد را وارد کنید",
      enterNumbers: "اعداد را وارد کنید (با کاما جدا کنید)",
      selectTool: "انتخاب ابزار",
    },
    calculator: {
      display: "نمایشگر",
    },
    percentage: {
      modes: {
        percentOf: "درصد از عدد",
        whatPercent: "چند درصد است؟",
        increase: "افزایش درصدی",
        decrease: "کاهش درصدی",
      },
      labels: {
        percent: "درصد",
        number: "عدد",
        firstNumber: "عدد اول",
        secondNumber: "عدد دوم (کل)",
      },
      results: {
        percentOf: "{percent}% از {number} برابر است با {result}",
        whatPercent: "{num1} از {num2} برابر است با {result}%",
        increase: "{number} با {percent}% افزایش: {result}",
        decrease: "{number} با {percent}% کاهش: {result}",
      },
    },
    statistics: {
      labels: {
        count: "تعداد",
        sum: "مجموع",
        mean: "میانگین",
        median: "میانه",
        mode: "مد",
        variance: "واریانس",
        stdDev: "انحراف معیار",
        min: "کمترین",
        max: "بیشترین",
        range: "دامنه",
      },
    },
    powerRoot: {
      modes: {
        power: "توان",
        root: "جذر / ریشه",
      },
      labels: {
        base: "پایه",
        exponent: "توان",
        number: "عدد",
        degree: "درجه ریشه",
      },
      results: {
        power: "{base}^{exp} = {result}",
        root: "ریشه {degree}ام {number} = {result}",
      },
    },
    geometry2d: {
      shapes: {
        circle: "دایره",
        rectangle: "مستطیل",
        triangle: "مثلث",
        square: "مربع",
      },
      labels: {
        radius: "شعاع",
        width: "عرض",
        height: "ارتفاع",
        sideA: "ضلع a",
        sideB: "ضلع b",
        sideC: "ضلع c",
        side: "ضلع",
        perimeter: "محیط",
        area: "مساحت",
        diameter: "قطر",
      },
    },
    geometry3d: {
      shapes: {
        sphere: "کره",
        cube: "مکعب",
        cylinder: "استوانه",
        cone: "مخروط",
      },
      labels: {
        radius: "شعاع",
        side: "ضلع",
        height: "ارتفاع",
        volume: "حجم",
        surfaceArea: "مساحت سطح",
        spaceDiagonal: "قطر فضایی",
      },
    },
    factor: {
      labels: {
        factors: "مقسوم‌علیه‌ها",
        primeFactors: "تجزیه به اعداد اول",
        count: "{count} عدد",
      },
    },
    random: {
      labels: {
        min: "حداقل",
        max: "حداکثر",
        count: "تعداد",
        unique: "اعداد یکتا (بدون تکرار)",
        results: "نتایج",
      },
      button: "تولید اعداد تصادفی",
      error: "تعداد درخواستی بیشتر از بازه ممکن است",
    },
    prime: {
      labels: {
        enterNumber: "عدد را وارد کنید",
        check: "بررسی",
        nearPrimes: "اعداد اول نزدیک:",
      },
      results: {
        isPrime: "{number} یک عدد اول است ✓",
        isNotPrime: "{number} عدد اول نیست ✗",
      },
    },
    equation: {
      degrees: {
        linear: "معادله درجه یک (ax + b = 0)",
        quadratic: "معادله درجه دو (ax² + bx + c = 0)",
      },
      labels: {
        coefficientA: "a (ضریب {var})",
        coefficientB: "b {type}",
        coefficientC: "c (عدد ثابت)",
        constant: "(عدد ثابت)",
        coefficientX: "(ضریب x)",
      },
      results: {
        invalid: "معادله نامعتبر است (a نمی‌تواند صفر باشد)",
        linearToQuadratic: "این یک معادله درجه یک است، a نمی‌تواند صفر باشد",
        delta: "دلتا",
        negative: "(منفی)",
        doubleRoot: "(ریشه مضاعف)",
      },
      button: "حل معادله",
    },
    logarithm: {
      modes: {
        log10: "log₁₀ (لگاریتم دهدهی)",
        ln: "ln (لگاریتم طبیعی)",
        custom: "پایه دلخواه",
      },
      labels: {
        number: "عدد",
        base: "پایه لگاریتم",
        importantValues: "مقادیر مهم:",
      },
      errors: {
        positiveNumber: "عدد باید مثبت باشد",
        validBase: "پایه باید عدد مثبت و غیر از 1 باشد",
      },
    },
    decimalFraction: {
      modes: {
        toFraction: "اعشاری → کسری",
        toDecimal: "کسری → اعشاری",
      },
      labels: {
        decimal: "عدد اعشاری",
        numerator: "صورت",
        denominator: "مخرج",
        commonFractions: "کسرهای رایج:",
      },
      button: "تبدیل",
      errors: {
        invalid: "عدد نامعتبر",
        invalidValues: "مقادیر نامعتبر",
      },
    },
    baseConverter: {
      bases: {
        binary: "باینری (2)",
        octal: "اکتال (8)",
        decimal: "دسیمال (10)",
        hexadecimal: "هگزادسیمال (16)",
      },
      labels: {
        inputBase: "مبنای ورودی",
        numberInBase: "عدد در مبنای {base}",
        referenceTable: "جدول مرجع:",
      },
      hints: {
        hex: "برای هگزادسیمال از 0-9 و A-F استفاده کنید",
        binary: "فقط 0 و 1",
        octal: "فقط 0-7",
      },
      errors: {
        invalid: "عدد نامعتبر برای این مبنا",
        conversion: "خطا در تبدیل",
      },
      button: "تبدیل",
    },
    fibonacci: {
      modes: {
        sequence: "تولید دنباله",
        nthTerm: "جمله nام",
        check: "بررسی عدد",
      },
      labels: {
        count: "تعداد جملات (1-50)",
        nthTerm: "شماره جمله (n)",
        checkNumber: "عدد مورد بررسی",
        sequence: "دنباله فیبوناچی ({count} جمله)",
        formula: "فرمول فیبوناچی:",
      },
      results: {
        nthTerm: "جمله {n}ام فیبوناچی = {result}",
        isFibonacci: "✓ {number} یک عدد فیبوناچی است",
        isNotFibonacci: "✗ {number} عدد فیبوناچی نیست",
        countRange: "تعداد باید بین 1 تا 50 باشد",
      },
      errors: {
        invalid: "عدد نامعتبر",
      },
    },
    factorial: {
      labels: {
        input: "عدد صحیح مثبت (0-170)",
        steps: "مراحل:",
        result: "نتیجه:",
        digits: "تعداد ارقام: {count}",
        commonFactorials: "فاکتوریل‌های رایج:",
        definition: "تعریف فاکتوریل:",
        convention: "0! = 1 (طبق قرارداد)",
      },
      button: "محاسبه فاکتوریل",
      errors: {
        invalid: "عدد نامعتبر",
        negative: "فاکتوریل برای اعداد منفی تعریف نشده",
        tooLarge: "عدد خیلی بزرگ است (حداکثر 170)",
      },
    },
  },
  en: {
    tools: {
      calculator: {
        name: "Calculator",
        desc: "Simple and advanced calculator",
      },
      percentage: {
        name: "Percentage",
        desc: "Various percentage calculations",
      },
      statistics: {
        name: "Statistics",
        desc: "Mean, median, variance and more",
      },
      powerRoot: { name: "Power & Root", desc: "Calculate power and root" },
      geometry2d: { name: "2D Geometry", desc: "Perimeter, area, diameter" },
      geometry3d: { name: "3D Geometry", desc: "Volume and surface area" },
      factor: { name: "Factors", desc: "Divisors of a number" },
      random: { name: "Random Numbers", desc: "Generate random numbers" },
      prime: { name: "Prime Check", desc: "Check if number is prime" },
      equation: { name: "Equations", desc: "Solve linear and quadratic" },
      logarithm: { name: "Logarithm", desc: "Calculate logarithm" },
      decimalFraction: {
        name: "Decimal/Fraction",
        desc: "Convert decimal and fraction",
      },
      baseConverter: { name: "Base Converter", desc: "Convert between bases" },
      fibonacci: { name: "Fibonacci", desc: "Fibonacci sequence" },
      factorial: { name: "Factorial", desc: "Calculate factorial" },
    },
    common: {
      calculate: "Calculate",
      result: "Result",
      clear: "Clear",
      copy: "Copy",
      copied: "Copied!",
      error: "Calculation error",
      enterNumber: "Enter a number",
      enterNumbers: "Enter numbers (comma separated)",
      selectTool: "Select Tool",
    },
    calculator: {
      display: "Display",
    },
    percentage: {
      modes: {
        percentOf: "Percent of number",
        whatPercent: "What percent?",
        increase: "Percentage increase",
        decrease: "Percentage decrease",
      },
      labels: {
        percent: "Percent",
        number: "Number",
        firstNumber: "First number",
        secondNumber: "Second number (total)",
      },
      results: {
        percentOf: "{percent}% of {number} equals {result}",
        whatPercent: "{num1} of {num2} equals {result}%",
        increase: "{number} with {percent}% increase: {result}",
        decrease: "{number} with {percent}% decrease: {result}",
      },
    },
    statistics: {
      labels: {
        count: "Count",
        sum: "Sum",
        mean: "Mean",
        median: "Median",
        mode: "Mode",
        variance: "Variance",
        stdDev: "Std Dev",
        min: "Min",
        max: "Max",
        range: "Range",
      },
    },
    powerRoot: {
      modes: {
        power: "Power",
        root: "Root",
      },
      labels: {
        base: "Base",
        exponent: "Exponent",
        number: "Number",
        degree: "Root degree",
      },
      results: {
        power: "{base}^{exp} = {result}",
        root: "{degree}th root of {number} = {result}",
      },
    },
    geometry2d: {
      shapes: {
        circle: "Circle",
        rectangle: "Rectangle",
        triangle: "Triangle",
        square: "Square",
      },
      labels: {
        radius: "Radius",
        width: "Width",
        height: "Height",
        sideA: "Side a",
        sideB: "Side b",
        sideC: "Side c",
        side: "Side",
        perimeter: "Perimeter",
        area: "Area",
        diameter: "Diameter",
      },
    },
    geometry3d: {
      shapes: {
        sphere: "Sphere",
        cube: "Cube",
        cylinder: "Cylinder",
        cone: "Cone",
      },
      labels: {
        radius: "Radius",
        side: "Side",
        height: "Height",
        volume: "Volume",
        surfaceArea: "Surface Area",
        spaceDiagonal: "Space Diagonal",
      },
    },
    factor: {
      labels: {
        factors: "Factors",
        primeFactors: "Prime Factorization",
        count: "{count} numbers",
      },
    },
    random: {
      labels: {
        min: "Minimum",
        max: "Maximum",
        count: "Count",
        unique: "Unique numbers (no duplicates)",
        results: "Results",
      },
      button: "Generate Random Numbers",
      error: "Count exceeds available range",
    },
    prime: {
      labels: {
        enterNumber: "Enter a number",
        check: "Check",
        nearPrimes: "Nearby primes:",
      },
      results: {
        isPrime: "{number} is a prime number ✓",
        isNotPrime: "{number} is not a prime number ✗",
      },
    },
    equation: {
      degrees: {
        linear: "Linear equation (ax + b = 0)",
        quadratic: "Quadratic equation (ax² + bx + c = 0)",
      },
      labels: {
        coefficientA: "a (coefficient of {var})",
        coefficientB: "b {type}",
        coefficientC: "c (constant)",
        constant: "(constant)",
        coefficientX: "(coefficient of x)",
      },
      results: {
        invalid: "Invalid equation (a cannot be zero)",
        linearToQuadratic: "This is a linear equation, a cannot be zero",
        delta: "Delta",
        negative: "(negative)",
        doubleRoot: "(double root)",
      },
      button: "Solve Equation",
    },
    logarithm: {
      modes: {
        log10: "log₁₀ (common logarithm)",
        ln: "ln (natural logarithm)",
        custom: "Custom base",
      },
      labels: {
        number: "Number",
        base: "Logarithm base",
        importantValues: "Important values:",
      },
      errors: {
        positiveNumber: "Number must be positive",
        validBase: "Base must be positive and not equal to 1",
      },
    },
    decimalFraction: {
      modes: {
        toFraction: "Decimal → Fraction",
        toDecimal: "Fraction → Decimal",
      },
      labels: {
        decimal: "Decimal number",
        numerator: "Numerator",
        denominator: "Denominator",
        commonFractions: "Common fractions:",
      },
      button: "Convert",
      errors: {
        invalid: "Invalid number",
        invalidValues: "Invalid values",
      },
    },
    baseConverter: {
      bases: {
        binary: "Binary (2)",
        octal: "Octal (8)",
        decimal: "Decimal (10)",
        hexadecimal: "Hexadecimal (16)",
      },
      labels: {
        inputBase: "Input base",
        numberInBase: "Number in base {base}",
        referenceTable: "Reference table:",
      },
      hints: {
        hex: "Use 0-9 and A-F for hexadecimal",
        binary: "Only 0 and 1",
        octal: "Only 0-7",
      },
      errors: {
        invalid: "Invalid number for this base",
        conversion: "Conversion error",
      },
      button: "Convert",
    },
    fibonacci: {
      modes: {
        sequence: "Generate sequence",
        nthTerm: "Nth term",
        check: "Check number",
      },
      labels: {
        count: "Number of terms (1-50)",
        nthTerm: "Term number (n)",
        checkNumber: "Number to check",
        sequence: "Fibonacci sequence ({count} terms)",
        formula: "Fibonacci formula:",
      },
      results: {
        nthTerm: "{n}th Fibonacci term = {result}",
        isFibonacci: "✓ {number} is a Fibonacci number",
        isNotFibonacci: "✗ {number} is not a Fibonacci number",
        countRange: "Count must be between 1 and 50",
      },
      errors: {
        invalid: "Invalid number",
      },
    },
    factorial: {
      labels: {
        input: "Positive integer (0-170)",
        steps: "Steps:",
        result: "Result:",
        digits: "Number of digits: {count}",
        commonFactorials: "Common factorials:",
        definition: "Factorial definition:",
        convention: "0! = 1 (by convention)",
      },
      button: "Calculate Factorial",
      errors: {
        invalid: "Invalid number",
        negative: "Factorial is not defined for negative numbers",
        tooLarge: "Number is too large (max 170)",
      },
    },
  },
};

export type MathToolsContent = typeof mathToolsUIContent.fa;

export function useMathToolsUIContent() {
  const { locale } = useLanguage();
  return mathToolsUIContent[locale];
}
