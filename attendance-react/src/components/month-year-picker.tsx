import { Field, FieldLabel } from './ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

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

export function MonthYearPicker({
  value,
  onChange,
}: {
  value: { month: number; year: number };
  onChange: (v: { month: number; year: number }) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex gap-2">
      <Field className="w-32">
        <FieldLabel>Bulan</FieldLabel>
        <Select
          value={value?.month?.toString() ?? ''}
          onValueChange={(m) => onChange({ ...value, month: Number(m) })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m, i) => (
              <SelectItem key={i} value={(i + 1).toString()}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field className="w-20">
        <FieldLabel>Tahun</FieldLabel>
        <Select
          value={value?.year?.toString() ?? ''}
          onValueChange={(y) => onChange({ ...value, year: Number(y) })}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
