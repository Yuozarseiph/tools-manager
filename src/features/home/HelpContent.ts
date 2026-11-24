import {
  X,
  Pin,
  Download,
  Upload,
  FileJson,
  Copy,
  Trash2,
  Search,
  Grid,
  LayoutGrid,
} from "lucide-react";

export const helpContent = {
  fa: {
    pinned: {
      title: "راهنمای پین کردن ابزارها",
      sections: [
        {
          title: "پین کردن ابزار",
          icon: Pin,
          description:
            "برای پین کردن هر ابزار، روی آیکون ستاره در گوشه کارت ابزار کلیک کنید. ابزار به نوار پین‌ها اضافه می‌شود.",
        },
        {
          title: "حذف پین",
          icon: Trash2,
          description:
            "برای حذف پین، ابتدا دکمه «حالت حذف» را فعال کنید، سپس روی دکمه قرمز رنگ روی هر پین کلیک کنید.",
        },
        {
          title: "حالت حذف",
          icon: X,
          description:
            "دکمه «حالت حذف» در کنار عنوان پین‌ها قرار دارد. با فعال کردن آن، دکمه‌های حذف روی پین‌ها ظاهر می‌شوند.",
        },
      ],
    },
    export: {
      title: "راهنمای خروجی تنظیمات",
      sections: [
        {
          title: "خروجی فایل JSON",
          icon: Download,
          description:
            "لیست پین‌های شما به صورت فایل JSON دانلود می‌شود. می‌توانید این فایل را برای استفاده بعدی یا انتقال به دستگاه دیگر ذخیره کنید.",
        },
        {
          title: "خروجی متن",
          icon: Copy,
          description:
            "محتوای JSON به صورت متن نمایش داده می‌شود. می‌توانید آن را کپی کرده و در جای دیگری ذخیره کنید.",
        },
        {
          title: "ساختار فایل",
          icon: FileJson,
          description:
            "فایل شامل شناسه ابزارهای پین شده، تاریخ خروجی و نسخه است. این فایل فقط برای بازیابی پین‌ها کاربرد دارد.",
        },
      ],
    },
    import: {
      title: "راهنمای وارد کردن تنظیمات",
      sections: [
        {
          title: "آپلود فایل",
          icon: Upload,
          description:
            "فایل JSON که قبلاً خروجی گرفته‌اید را انتخاب کنید. پین‌های ذخیره شده جایگزین پین‌های فعلی می‌شوند.",
        },
        {
          title: "وارد کردن متن",
          icon: Copy,
          description:
            "متن JSON را در کادر مربوطه پیست کنید و دکمه «وارد کردن» را بزنید. فرمت باید دقیقاً مشابه خروجی باشد.",
        },
        {
          title: "نکته مهم",
          icon: FileJson,
          description:
            "پین‌های تکراری به طور خودکار حذف می‌شوند. فقط شناسه ابزارهای معتبر ذخیره می‌شوند.",
        },
      ],
    },
    general: {
      title: "راهنمای عمومی",
      sections: [
        {
          title: "جستجو",
          icon: Search,
          description:
            "می‌توانید ابزارها را بر اساس نام یا توضیحات جستجو کنید.",
        },
        {
          title: "دسته‌بندی",
          icon: Grid,
          description:
            "ابزارها در دسته‌های مختلف سازماندهی شده‌اند. با کلیک روی هر دسته، فقط ابزارهای آن دسته نمایش داده می‌شوند.",
        },
        {
          title: "چیدمان",
          icon: LayoutGrid,
          description:
            "می‌توانید نحوه نمایش ابزارها و پین‌ها را از منوی چیدمان تغییر دهید.",
        },
      ],
    },
  },
  en: {
    pinned: {
      title: "Pinning Tools Help",
      sections: [
        {
          title: "Pin a Tool",
          icon: Pin,
          description:
            "Click the star icon on any tool card to pin it. The tool will be added to the pinned bar.",
        },
        {
          title: "Remove Pin",
          icon: Trash2,
          description:
            'Enable "Delete Mode" first, then click the red button on any pinned item to remove it.',
        },
        {
          title: "Delete Mode",
          icon: X,
          description:
            'The "Delete Mode" button is next to the pinned title. When enabled, delete buttons appear on pinned items.',
        },
      ],
    },
    export: {
      title: "Export Settings Help",
      sections: [
        {
          title: "Export JSON File",
          icon: Download,
          description:
            "Your pinned tools list is downloaded as a JSON file. Save it for later use or transfer to another device.",
        },
        {
          title: "Export as Text",
          icon: Copy,
          description:
            "The JSON content is displayed as text. You can copy and save it elsewhere.",
        },
        {
          title: "File Structure",
          icon: FileJson,
          description:
            "The file contains pinned tool IDs, export date, and version. It is only used to restore pins.",
        },
      ],
    },
    import: {
      title: "Import Settings Help",
      sections: [
        {
          title: "Upload File",
          icon: Upload,
          description:
            "Select a previously exported JSON file. Saved pins will replace your current pins.",
        },
        {
          title: "Import Text",
          icon: Copy,
          description:
            'Paste the JSON text in the box and click "Import". Format must match the exported structure.',
        },
        {
          title: "Important Note",
          icon: FileJson,
          description:
            "Duplicate pins are automatically removed. Only valid tool IDs are saved.",
        },
      ],
    },
    general: {
      title: "General Help",
      sections: [
        {
          title: "Search",
          icon: Search,
          description: "Search tools by name or description.",
        },
        {
          title: "Categories",
          icon: Grid,
          description:
            "Tools are organized in categories. Click a category to filter tools.",
        },
        {
          title: "Layout",
          icon: LayoutGrid,
          description:
            "Change how tools and pins are displayed using the layout menu.",
        },
      ],
    },
  },
};
