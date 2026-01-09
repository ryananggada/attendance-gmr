import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { reverseGeocode } from './geolocation-service';
import { format } from 'date-fns';

function autoFitColumn(data: Record<string, any>[]) {
  const keys = Object.keys(data[0] ?? {});

  return keys.map((key) => {
    const maxLength = Math.max(
      key.length,
      ...data.map((row) => (row[key] ? String(row[key]).length : 0)),
    );

    return {
      wch: Math.min(maxLength + 2, 40),
    };
  });
}

export function exportMonthlyAttendanceToExcel(
  rows: any[],
  departmentMap: Record<number, string>,
  monthDate: { month: number; year: number },
) {
  const excelData = rows.map((row) => {
    const events = row.events ?? {};

    return {
      Department: departmentMap[row.departmentId] ?? '-',
      Nama: row.name,
      Tanggal: format(row.date, 'dd/MM/yyyy'),
      'Check In': events.CheckIn?.time ?? '-',
      Field: events.FieldCheckIn?.time ?? '-',
      Return: events.FieldCheckOut?.time ?? '-',
      'Check Out': events.CheckOut?.time ?? '-',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  worksheet['!cols'] = autoFitColumn(excelData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Absen');

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  XLSX.writeFile(
    workbook,
    `Absen_${months[monthDate.month - 1]}-${monthDate.year}.xlsx`,
  );
}

async function resolveLocations(rows: any[]) {
  const cache: Record<string, string> = {};

  for (const row of rows) {
    if (!row.location) continue;

    const key = row.location.join(',');
    if (cache[key]) continue;

    try {
      const address = await reverseGeocode(row.location[0], row.location[1]);

      cache[key] = address ?? '-';

      await new Promise((r) => setTimeout(r, 1100));
    } catch (err) {
      console.error('Reverse geocode failed:', err);
      cache[key] = '-';
    }
  }

  return cache;
}

export async function exportFieldAttendanceToExcel({
  name,
  date,
  rows,
}: {
  name: string;
  date: string;
  rows: any[];
}) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Absen Lapangan');

  sheet.addRow(['Nama', name]);
  sheet.addRow(['Tanggal', date]);
  sheet.addRow([]);

  const headerRows = sheet.addRow([
    'Waktu',
    'Lokasi',
    'Customer',
    'Person in Charge',
    'Keterangan',
    'Foto',
  ]);

  headerRows.font = { bold: true };
  sheet.columns = [
    { width: 15 },
    { width: 40 },
    { width: 20 },
    { width: 20 },
    { width: 30 },
    { width: 18 },
  ];

  const geoCache = await resolveLocations(rows);

  for (const row of rows) {
    const excelRow = sheet.addRow([
      row.time,
      geoCache[row.location?.join(',')] ?? '-',
      row.customer,
      row.personInCharge,
      row.remarks ?? '-',
      '',
    ]);

    excelRow.height = 90;

    if (row.image) {
      const imageResponse = await fetch(
        `${import.meta.env.VITE_IMAGE_URL}/${row.image}`,
      );

      const buffer = await imageResponse.arrayBuffer();

      const imageId = workbook.addImage({
        buffer,
        extension: 'jpeg',
      });

      sheet.addImage(imageId, {
        tl: { col: 5, row: excelRow.number - 1 },
        ext: { width: 120, height: 80 },
      });
    }
  }

  const fileBuffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([fileBuffer]), `Absen_Lapangan-${name}-${date}.xlsx`);
}
