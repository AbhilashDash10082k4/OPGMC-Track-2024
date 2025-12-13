/**
 * Optimized PDF Fragment Parser
 * Efficiently parses pdf_fragments.js and extracts admission data
 */

import * as fs from 'fs';
import * as path from 'path';

interface TextFragment {
  text: string;
  x0: number;
  x1: number;
  top: number;
  bottom: number;
  y_center: number;
  page: number;
}

interface AdmissionRecord {
  admission_status: string;
  admitted_course: string;
  admitted_college: string;
  admitted_subject: string;
}

// Column boundaries - adjust these based on your PDF layout
const COLUMNS = {
  admission_status: { min: 472, max: 540 },
  admitted_course: { min: 540, max: 598 },
  admitted_college: { min: 598, max: 648 },
  admitted_subject: { min: 648, max: 698 },
} as const;

const Y_TOLERANCE = 3; // Pixels tolerance for grouping text in same row

/**
 * Determines which column a text fragment belongs to based on x0 coordinate
 */
function identifyColumn(x0: number): keyof typeof COLUMNS | null {
  for (const [columnName, range] of Object.entries(COLUMNS)) {
    if (x0 >= range.min && x0 < range.max) {
      return columnName as keyof typeof COLUMNS;
    }
  }
  return null;
}

/**
 * Groups text fragments by row (y_center) and column
 * Returns a map of row_id -> column_name -> fragments
 */
function groupFragments(fragments: TextFragment[]): Map<number, Map<string, TextFragment[]>> {
  const rowMap = new Map<number, Map<string, TextFragment[]>>();
  
  for (const fragment of fragments) {
    const columnName = identifyColumn(fragment.x0);
    if (!columnName) continue;
    
    // Find existing row within tolerance or create new
    let rowY = fragment.y_center;
    for (const existingY of rowMap.keys()) {
      if (Math.abs(existingY - fragment.y_center) <= Y_TOLERANCE) {
        rowY = existingY;
        break;
      }
    }
    
    // Initialize row if needed
    if (!rowMap.has(rowY)) {
      rowMap.set(rowY, new Map());
    }
    
    const row = rowMap.get(rowY)!;
    
    // Initialize column if needed
    if (!row.has(columnName)) {
      row.set(columnName, []);
    }
    
    row.get(columnName)!.push(fragment);
  }
  
  return rowMap;
}

/**
 * Concatenates text fragments in correct order (left to right)
 */
function concatenateText(fragments: TextFragment[]): string {
  return fragments
    .sort((a, b) => a.x0 - b.x0)
    .map(f => f.text)
    .join(' ')
    .trim();
}

/**
 * Converts grouped fragments into structured admission records
 */
function extractRecords(groupedData: Map<number, Map<string, TextFragment[]>>): AdmissionRecord[] {
  const records: AdmissionRecord[] = [];
  
  // Sort rows by y_center (top to bottom)
  const sortedRows = Array.from(groupedData.entries())
    .sort((a, b) => a[0] - b[0]);
  
  for (const [_, columns] of sortedRows) {
    const record: AdmissionRecord = {
      admission_status: '',
      admitted_course: '',
      admitted_college: '',
      admitted_subject: '',
    };
    
    // Extract text for each column
    for (const [columnName, fragments] of columns) {
      if (columnName in record) {
        record[columnName as keyof AdmissionRecord] = concatenateText(fragments);
      }
    }
    
    // Only include records with at least one populated field
    if (Object.values(record).some(v => v.length > 0)) {
      records.push(record);
    }
  }
  
  return records;
}

/**
 * Main parser function
 */
export function parsePdfFragments(filePath: string): AdmissionRecord[] {
  console.log(`Reading file: ${filePath}`);
  
  // Read and parse the JavaScript file
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract data array using eval (ensure the file is trusted)
  let data: TextFragment[][];
  try {
    // Remove any module.exports or export statements
    const cleanedContent = content
      .replace(/module\.exports\s*=\s*/, 'data = ')
      .replace(/export\s+(default\s+)?/, '');
    
    eval(cleanedContent);
    // @ts-ignore - data is set by eval
    data = typeof data !== 'undefined' ? data : [];
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data found in file');
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    throw error;
  }
  
  console.log(`Found ${data.length} page(s) of data`);
  
  const allRecords: AdmissionRecord[] = [];
  
  // Process each page
  for (let pageNum = 0; pageNum < data.length; pageNum++) {
    const pageFragments = data[pageNum];
    console.log(`Processing page ${pageNum + 1}: ${pageFragments.length} fragments`);
    
    // Group fragments by row and column
    const groupedData = groupFragments(pageFragments);
    
    // Extract records from grouped data
    const pageRecords = extractRecords(groupedData);
    allRecords.push(...pageRecords);
    
    console.log(`  Extracted ${pageRecords.length} records from page ${pageNum + 1}`);
  }
  
  return allRecords;
}

/**
 * Utility function to save records to JSON file
 */
export function saveRecords(records: AdmissionRecord[], outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(records, null, 2), 'utf-8');
  console.log(`\n✓ Saved ${records.length} records to ${outputPath}`);
}

/**
 * Main execution
 */
if (require.main === module) {
  const inputFile = path.join(__dirname, 'pdf_fragments.js');
  const outputFile = path.join(__dirname, 'parsed_admissions.json');
  
  try {
    console.log('=== PDF Fragment Parser ===\n');
    
    // Parse the file
    const records = parsePdfFragments(inputFile);
    
    // Display sample records
    console.log('\n=== Sample Records ===\n');
    records.slice(0, 3).forEach((record, i) => {
      console.log(`Record ${i + 1}:`);
      console.log(JSON.stringify(record, null, 2));
      console.log();
    });
    
    // Save results
    saveRecords(records, outputFile);
    
    console.log('\n✓ Parsing complete!');
  } catch (error) {
    console.error('\n✗ Error:', error);
    process.exit(1);
  }
}
