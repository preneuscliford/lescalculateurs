declare module "https://cdn.sheetjs.com/xlsx-latest/xlsx.mjs" {
  const XLSX: any;
  export default XLSX;
  export const utils: any;
  export function write(...args: any[]): any;
  export function read(...args: any[]): any;
  export function book_new(...args: any[]): any;
}