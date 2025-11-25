import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { getFieldAttendances } from '@/services/field-attendance-service';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';

type FieldAttendance = {
  id: number;
  time: string;
  customer: string;
  personInCharge: string;
  remarks: string;
  image: string;
};

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
        <>
          {image ? (
            <img
              src={`${import.meta.env.VITE_IMAGE_URL}/${image}`}
              alt="Image"
              className="mt-2 w-36 h-36 object-cover rounded-md"
            />
          ) : (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png"
              alt="No image"
              className="mt-2 w-36 h-36 object-cover rounded-md"
            />
          )}
        </>
      );
    },
  },
];

export default function FieldAttendancePage() {
  const { user } = useAuth();
  const date = new Date().toISOString().split('T')[0];
  const { data: fieldAttendances } = useQuery({
    queryKey: ['fieldAttendances'],
    queryFn: () => getFieldAttendances(user!.id, date),
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Button asChild className="mx-auto min-w-[256px]">
        <Link to="/field-attendance/create">Tambah Absen Lapangan</Link>
      </Button>

      <DataTable columns={columns} data={fieldAttendances ?? []} />
    </div>
  );
}
