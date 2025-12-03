'use client';

import { useState, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { useThemeColors } from '@/hooks/useThemeColors';
import { 
  UploadCloud, 
  Save, 
  Plus, 
  Trash2, 
  Download, 
  FileSpreadsheet,
  Edit3,
  Undo
} from 'lucide-react';

type DataRow = { [key: string]: string | number | boolean | null };

export default function ExcelEditorTool() {
  const theme = useThemeColors();
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<DataRow[]>([]);
  const [fileName, setFileName] = useState<string>('edited-file.xlsx');
  const [history, setHistory] = useState<DataRow[][]>([]); // برای Undo

  // --- آپلود فایل ---
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const wb = XLSX.read(data, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const dataJson: DataRow[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

      if (dataJson.length > 0) {
        setHeaders(Object.keys(dataJson[0]));
        setRows(dataJson);
        setHistory([dataJson]); // ذخیره وضعیت اولیه
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- ویرایش سلول ---
  const handleCellChange = (rowIndex: number, header: string, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [header]: value };
    setRows(newRows);
  };

  // --- ذخیره در تاریخچه (قبل از تغییرات بزرگ) ---
  const saveToHistory = () => {
    if (history.length > 10) {
      setHistory([...history.slice(1), rows]);
    } else {
      setHistory([...history, rows]);
    }
  };

  // --- افزودن ردیف جدید ---
  const addRow = () => {
    saveToHistory();
    const newRow: DataRow = {};
    headers.forEach(h => newRow[h] = "");
    setRows([...rows, newRow]);
  };

  // --- حذف ردیف ---
  const deleteRow = (index: number) => {
    saveToHistory();
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  // --- بازگشت (Undo) ---
  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setRows(previousState);
      setHistory(history.slice(0, -1));
    }
  };

  // --- دانلود فایل ویرایش شده ---
  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `edited_${fileName}`);
  };

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${theme.card} ${theme.border} shadow-sm`}>
      
      {/* Toolbar */}
      <div className={`p-4 sm:p-6 border-b flex flex-col sm:flex-row justify-between items-center gap-4 ${theme.border}`}>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {rows.length === 0 ? (
            <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl cursor-pointer hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 w-full sm:w-auto">
              <UploadCloud size={20} />
              <span>آپلود فایل اکسل</span>
              <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
            </label>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <Save size={18} />
                <span>دانلود فایل جدید</span>
              </button>
              
              <button 
                onClick={handleUndo}
                disabled={history.length === 0}
                className={`p-2 rounded-lg border transition-colors ${
                  history.length === 0 ? 'opacity-50 cursor-not-allowed' : `hover:bg-black/5 dark:hover:bg-white/10 ${theme.text}`
                } ${theme.border}`}
                title="بازگشت (Undo)"
              >
                <Undo size={18} />
              </button>
            </div>
          )}
        </div>

        {rows.length > 0 && (
          <div className={`text-sm font-medium ${theme.textMuted} flex items-center gap-2`}>
            <Edit3 size={16} />
            <span>حالت ویرایش فعال است</span>
          </div>
        )}
      </div>

      {/* Editor Area */}
      <div className={`bg-gray-50/50 dark:bg-black/20 min-h-[400px] flex flex-col`}>
        {headers.length > 0 ? (
          <div className="overflow-auto flex-1 max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            <table className="w-full min-w-max text-sm text-left border-collapse">
              <thead className={`sticky top-0 z-10 shadow-sm ${theme.secondary} ${theme.text}`}>
                <tr>
                  <th className="p-3 font-bold border-b w-12 text-center opacity-50">#</th>
                  {headers.map(header => (
                    <th key={header} className="p-3 font-bold border-b border-r last:border-r-0 min-w-[120px]">
                      {header}
                    </th>
                  ))}
                  <th className="p-3 font-bold border-b w-12 text-center opacity-50">عملیات</th>
                </tr>
              </thead>
              <tbody className={`${theme.text}`}>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={`group border-b last:border-b-0 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors`}>
                    <td className={`p-3 border-r text-center text-xs font-mono opacity-40 bg-black/5 dark:bg-white/5`}>
                      {rowIndex + 1}
                    </td>
                    {headers.map((header, colIndex) => (
                      <td key={`${rowIndex}-${colIndex}`} className="p-0 border-r last:border-r-0">
                        <input 
                          type="text" 
                          value={String(row[header] ?? "")}
                          onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                          onFocus={saveToHistory} // ذخیره تاریخچه قبل از ادیت
                          className={`w-full h-full px-3 py-3 bg-transparent outline-none focus:bg-blue-50 dark:focus:bg-blue-900/30 focus:shadow-inner transition-colors ${theme.text}`}
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center">
                      <button 
                        onClick={() => deleteRow(rowIndex)}
                        className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        title="حذف سطر"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Add Row Button */}
                <tr>
                  <td colSpan={headers.length + 2} className="p-2 text-center border-t border-dashed border-gray-300 dark:border-gray-700">
                    <button 
                      onClick={addRow}
                      className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-dashed hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${theme.textMuted} hover:text-blue-500`}
                    >
                      <Plus size={18} />
                      <span>افزودن سطر جدید</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 animate-in zoom-in-95 duration-500">
            <div className={`w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 ${theme.border} border-4 border-white dark:border-gray-800 shadow-xl`}>
              <FileSpreadsheet size={40} className="text-green-600 dark:text-green-400" />
            </div>
            <h4 className={`font-bold text-xl mb-2 ${theme.text}`}>ویرایشگر فایل‌های اکسل</h4>
            <p className={`text-sm max-w-md leading-relaxed ${theme.textMuted}`}>
              فایل خود را آپلود کنید، داده‌ها را مستقیماً در جدول ویرایش کنید و نسخه جدید را با فرمت XLSX دانلود نمایید.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
