import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { getFieldAttendances } from '@/services/field-attendance-service';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { format } from 'date-fns';
import { useReverseGeocode } from '@/hooks/use-reverse-geocode';

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
    header: 'Gambar',
    cell: ({ row }) => {
      const image = row.getValue('image');

      return (
        <img
          src={`${import.meta.env.VITE_IMAGE_URL}/${image}`}
          alt="Image"
          className="aspect-3/4 w-24 object-cover rounded-md"
        />
      );
    },
  },
];

export default function FieldAttendancePage() {
  const { user } = useAuth();
  const date = format(new Date(), 'yyyy-MM-dd');
  const { data: fieldAttendances = [], isLoading } = useQuery({
    queryKey: ['fieldAttendances'],
    queryFn: () => getFieldAttendances(user!.id, date),
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Button asChild className="mx-auto min-w-[256px]">
        <Link to="/field-attendance/create">Tambah Absen Lapangan</Link>
      </Button>

      <DataTable
        columns={columns}
        data={fieldAttendances}
        isLoading={isLoading}
      />
    </div>
  );
}
