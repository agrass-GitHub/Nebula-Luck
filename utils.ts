import { User } from './types';
import * as XLSX from 'xlsx';
import { FACE_EMOJIS } from './constants';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const parseExcel = async (file: File): Promise<User[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Assuming Row 1 is header, finding '姓名' and '部门' columns
        const headers = jsonData[0];
        const nameIdx = headers.findIndex((h: any) => String(h).includes('姓名') || String(h).includes('Name'));
        const deptIdx = headers.findIndex((h: any) => String(h).includes('部门') || String(h).includes('Dept'));

        if (nameIdx === -1) {
          reject('Excel must contain a "姓名" column');
          return;
        }

        const users: User[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row[nameIdx]) {
            users.push({
              id: generateId(),
              name: String(row[nameIdx]),
              department: deptIdx !== -1 ? String(row[deptIdx]) : '', // Default to empty if no department
            });
          }
        }
        resolve(users);
      } catch (error) {
        reject('Error parsing Excel file');
      }
    };
    reader.onerror = () => reject('File read error');
    reader.readAsArrayBuffer(file);
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Deterministic emoji picker based on string hash
export const getDeterministicEmoji = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FACE_EMOJIS.length;
  return FACE_EMOJIS[index];
};