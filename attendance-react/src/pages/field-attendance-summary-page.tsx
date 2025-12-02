import { Datepicker } from '@/components/date-picker';
import { DataTable } from '@/components/ui/data-table';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getFieldAttendances } from '@/services/field-attendance-service';
import { getUsers } from '@/services/user-service';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

type FieldAttendance = {
  id: number;
  time: string;
  customer: string;
  personInCharge: string;
  remarks: string;
  image: string;
};

export default function FieldAttendanceSummaryPage() {
  const [date, setDate] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState('');

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
      header: 'Gambar',
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

      <DataTable
        columns={columns}
        data={fieldAttendances}
        isLoading={isLoading}
      />
    </div>
  );
}
