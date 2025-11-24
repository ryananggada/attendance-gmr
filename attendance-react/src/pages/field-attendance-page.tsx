import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/auth-context';
import { getFieldAttendances } from '@/services/field-attendance-service';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Waktu</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Person in Charge</TableHead>
            <TableHead>Keterangan</TableHead>
            <TableHead>Gambar</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {fieldAttendances &&
            fieldAttendances.map(
              (fieldAttendance: {
                id: number;
                time: string;
                customer: string;
                personInCharge: string;
                remarks: string;
                image: string;
              }) => (
                <TableRow key={fieldAttendance.id}>
                  <TableCell>{fieldAttendance.time}</TableCell>
                  <TableCell>{fieldAttendance.customer}</TableCell>
                  <TableCell>{fieldAttendance.personInCharge}</TableCell>
                  <TableCell>{fieldAttendance.remarks}</TableCell>
                  <TableCell>
                    {fieldAttendance.image ? (
                      <img
                        src={`${import.meta.env.VITE_IMAGE_URL}/${
                          fieldAttendance.image
                        }`}
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
                  </TableCell>
                </TableRow>
              ),
            )}
        </TableBody>
      </Table>
    </div>
  );
}
