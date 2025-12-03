'use client';

import { useState, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { useThemeColors } from '@/hooks/useThemeColors';
import { 
  UploadCloud, 
  Sheet, 
  Search, 
  FileJson, 
  FileText, // برای آیکون CSV
  FileSpreadsheet, 
  Database, 
  Download,
  Table as TableIcon
} from 'lucide-react';

type DataRow = { [key: string]: any };

export default function ExcelViewerTool() {
  const theme = useThemeColors();
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<DataRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<DataRow[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileName, setFileName] = useState<string>('');

  // --- 1. آپلود و پردازش فایل ---
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const wb = XLSX.read(data, { type: 'binary' });
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      
      // نمایش شیت اول به صورت پیش‌فرض
      const firstSheet = wb.SheetNames[0];
      setActiveSheet(firstSheet);
      processSheet(wb, firstSheet);
    };
    reader.readAsBinaryString(file);
  };

  // --- 2. خواندن داده‌های شیت ---
  const processSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    // defval: "" باعث می‌شود سلول‌های خالی هم خوانده شوند
    const data: DataRow[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
    
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      setHeaders(keys);
      setRows(data);
      setFilteredRows(data);
    } else {
      setHeaders([]);
      setRows([]);
      setFilteredRows([]);
    }
    setSearchQuery(''); // پاک کردن سرچ قبلی
  };

  // --- 3. تغییر شیت ---
  const handleSheetChange = (sheetName: string) => {
    if (workbook) {
      setActiveSheet(sheetName);
      processSheet(workbook, sheetName);
    }
  };

  // --- 4. جستجو ---
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      setFilteredRows(rows);
      return;
    }

    const filtered = rows.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(query)
      )
    );
    setFilteredRows(filtered);
  };

  // --- 5. دانلود JSON ---
  const downloadJSON = () => {
    if (!filteredRows.length) return;
    const jsonString = JSON.stringify(filteredRows, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.split('.')[0]}_${activeSheet}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 6. دانلود CSV ---
  const downloadCSV = () => {
    if (!filteredRows.length) return;

    // ساخت هدر
    const csvHeaders = headers.join(",");
    
    // ساخت ردیف‌ها با مدیریت کاراکترهای خاص (کاما و کوتیشن)
    const csvRows = filteredRows.map(row => {
      return headers.map(header => {
        const val = row[header] !== undefined ? String(row[header]) : "";
        // اگر مقدار شامل کاما، خط جدید یا دابل کوتیشن باشد، باید در کوتیشن قرار گیرد
        if (val.includes(",") || val.includes('"') || val.includes("\n")) {
          return `"${val.replace(/"/g, '""')}"`; // Escape double quotes
        }
        return val;
      }).join(",");
    });

    const csvString = [csvHeaders, ...csvRows].join("\n");
    
    // اضافه کردن BOM (\uFEFF) برای پشتیبانی صحیح از فارسی در اکسل
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvString], { type: "text/csv;charset=utf-8;" });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.split('.')[0]}_${activeSheet}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${theme.card} ${theme.border} shadow-sm`}>
      
      {/* --- Toolbar --- */}
      <div className={`p-4 sm:p-6 border-b flex flex-col gap-6 ${theme.border}`}>
        
        {/* ردیف بالا: آپلود و آمار */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl cursor-pointer hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20">
              <UploadCloud size={20} />
              <span>انتخاب فایل</span>
              <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
            </label>
            {rows.length > 0 && (
              <div className={`hidden sm:flex items-center gap-4 text-xs ${theme.textMuted} px-4`}>
                <span className="flex items-center gap-1"><Database size={14} /> {filteredRows.length} سطر</span>
                <span className="flex items-center gap-1"><FileSpreadsheet size={14} /> {headers.length} ستون</span>
              </div>
            )}
          </div>

          {/* فیلد جستجو */}
          {rows.length > 0 && (
            <div className={`relative w-full sm:w-64 group`}>
              <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted} group-focus-within:text-blue-500 transition-colors`} />
              <input 
                type="text" 
                placeholder="جستجو در جدول..." 
                value={searchQuery}
                onChange={handleSearch}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border bg-transparent outline-none transition-all ${theme.border} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${theme.text}`}
              />
            </div>
          )}
        </div>

        {/* ردیف پایین: تب‌های شیت و دکمه‌های دانلود */}
        {sheetNames.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-2">
            
            {/* لیست شیت‌ها */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full sm:max-w-[60%] no-scrollbar mask-linear-fade">
              <Sheet size={18} className={`${theme.textMuted} flex-shrink-0`} />
              {sheetNames.map(name => (
                <button
                  key={name}
                  onClick={() => handleSheetChange(name)}
                  className={`text-xs sm:text-sm px-4 py-1.5 rounded-full whitespace-nowrap transition-all font-medium border ${
                    activeSheet === name
                      ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20'
                      : `${theme.secondary} border-transparent ${theme.text} hover:bg-black/5 dark:hover:bg-white/10`
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* دکمه‌های دانلود */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button 
                onClick={downloadCSV}
                disabled={!filteredRows.length}
                className={`flex-1 sm:flex-none justify-center flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg border transition-colors ${
                  !filteredRows.length 
                    ? 'opacity-50 cursor-not-allowed' 
                    : `hover:bg-black/5 dark:hover:bg-white/5 ${theme.text}`
                } ${theme.border}`}
                title="دانلود CSV"
              >
                <FileText size={16} className="text-green-600 dark:text-green-400" />
                <span>CSV</span>
              </button>

              <button 
                onClick={downloadJSON}
                disabled={!filteredRows.length}
                className={`flex-1 sm:flex-none justify-center flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg border transition-colors ${
                  !filteredRows.length 
                    ? 'opacity-50 cursor-not-allowed' 
                    : `hover:bg-black/5 dark:hover:bg-white/5 ${theme.text}`
                } ${theme.border}`}
                title="دانلود JSON"
              >
                <FileJson size={16} className="text-amber-500" />
                <span>JSON</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- Table Area --- */}
      <div className={`bg-gray-50/50 dark:bg-black/20 min-h-[400px] flex flex-col`}>
        {headers.length > 0 ? (
          <div className="overflow-auto flex-1 max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            <table className="w-full min-w-max text-sm text-left border-collapse">
              <thead className={`sticky top-0 z-10 shadow-sm ${theme.secondary} ${theme.text}`}>
                <tr>
                  <th className="p-3 font-bold border-b w-16 text-center text-xs opacity-50">#</th>
                  {headers.map(header => (
                    <th key={header} className="p-3 font-bold border-b border-r last:border-r-0 text-xs uppercase tracking-wider opacity-80">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`${theme.text}`}>
                {filteredRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={`group border-b last:border-b-0 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors`}>
                    <td className={`p-3 border-r text-center text-xs font-mono opacity-40 bg-black/5 dark:bg-white/5`}>
                      {rowIndex + 1}
                    </td>
                    {headers.map((header, colIndex) => (
                      <td key={`${rowIndex}-${colIndex}`} className="p-3 border-r last:border-r-0 max-w-xs truncate group-hover:whitespace-normal" title={String(row[header])}>
                        {row[header] !== undefined ? String(row[header]) : <span className="opacity-20 italic">null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 animate-in zoom-in-95 duration-500">
            <div className={`w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 ${theme.border} border-4 border-white dark:border-gray-800 shadow-xl`}>
              <TableIcon size={40} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className={`font-bold text-xl mb-2 ${theme.text}`}>هنوز فایلی انتخاب نشده</h4>
            <p className={`text-sm max-w-md leading-relaxed ${theme.textMuted}`}>
              فایل اکسل (XLSX) یا CSV خود را آپلود کنید تا داده‌ها را به صورت جدول ببینید، جستجو کنید و خروجی بگیرید.
            </p>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      {rows.length > 0 && (
        <div className={`px-4 py-2 text-[10px] text-right border-t ${theme.border} ${theme.textMuted} bg-black/5 dark:bg-white/5`}>
          نمایش {filteredRows.length} از {rows.length} رکورد
        </div>
      )}
    </div>
  );
}
