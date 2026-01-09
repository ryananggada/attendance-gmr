import { Datepicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReverseGeocode } from '@/hooks/use-reverse-geocode';
import { exportFieldAttendanceToExcel } from '@/services/excel-service';
import { getFieldAttendances } from '@/services/field-attendance-service';
import { getUsers } from '@/services/user-service';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type FieldAttendance = {
  id: number;
  time: string;
  customer: string;
  personInCharge: string;
  remarks: string;
  image: string;
};

type LocationCellProps = {
  location: [number, number];
};

const LocationCell = ({ location }: LocationCellProps) => {
  const { data, isLoading } = useReverseGeocode(location[0], location[1]);

  return (
    <div className="max-w-56 break-words whitespace-normal">
      {isLoading ? 'Memuat...' : data}
    </div>
  );
};

export default function FieldAttendanceSummaryPage() {
  const [date, setDate] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const fieldUsers = useMemo(() => {
    return users.filter(
      (data: { department: { isField: boolean } }) =>
        data.department?.isField === true,
    );
  }, [users]);

  const selectedUser = useMemo(() => {
    return fieldUsers.find(
      (data: { user: { id: number } }) =>
        String(data.user.id) === selectedUserId,
    );
  }, [fieldUsers, selectedUserId]);

  const selectedUserName = selectedUser?.user.fullName ?? '';

  const { data: fieldAttendances = [], isLoading } = useQuery({
    queryKey: ['fieldAttendances', selectedUserId, date],
    queryFn: () =>
      getFieldAttendances(Number(selectedUserId), format(date, 'yyyy-MM-dd')),
    enabled: !!selectedUserId,
  });

  const columns: ColumnDef<FieldAttendance>[] = [
    {
      accessorKey: 'time',
      header: 'Waktu',
    },
    {
      accessorKey: 'location',
      header: 'Lokasi',
      cell: ({ getValue }) => {
        const location = getValue<[number, number]>();

        if (!location) return '-';

        return <LocationCell location={location} />;
      },
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
    },
    {
      accessorKey: 'personInCharge',
      header: 'Person in Change',
    },
    {
      accessorKey: 'remarks',
      header: 'Keterangan',
      cell: ({ row }) => {
        const remarks = row.getValue('remarks');

        return remarks ?? '-';
      },
    },
    {
      accessorKey: 'image',
      header: 'Foto',
      cell: ({ row }) => {
        const image = row.getValue('image');

        return (
          <img
            src={`${import.meta.env.VITE_IMAGE_URL}/${image}`}
            alt="Image"
            className="w-24 object-cover rounded-md"
          />
        );
      },
    },
  ];

  const handleExport = async () => {
    try {
      setIsExporting(true);

      await new Promise((r) => setTimeout(r, 0));

      exportFieldAttendanceToExcel({
        name: selectedUserName,
        date: format(date, 'dd/MM/yyyy'),
        rows: fieldAttendances,
      });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (fieldUsers.length > 0) {
      setSelectedUserId(String(fieldUsers[0].user.id));
    }
  }, [fieldUsers]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Datepicker label="Tanggal" value={date} onChange={setDate} />

      <Field className="w-64">
        <FieldLabel>User</FieldLabel>
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fieldUsers.map(
              (data: { user: { id: number; fullName: string } }) => (
                <SelectItem key={data.user.id} value={String(data.user.id)}>
                  {data.user.fullName}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </Field>

      <Button
        className="max-w-2xs"
        onClick={handleExport}
        disabled={isExporting || fieldAttendances.length === 0}
      >
        {isExporting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
        Export ke Excel
      </Button>

      <DataTable
        columns={columns}
        data={fieldAttendances}
        isLoading={isLoading}
      />
    </div>
  );
}
