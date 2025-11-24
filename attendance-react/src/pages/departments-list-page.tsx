import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getDepartments } from '@/services/department-service';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

export default function DepartmentsListPage() {
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Button asChild className="max-w-[200px]">
        <Link to="/departments/create">Tambah Department</Link>
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Ada Lapangan?</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments &&
            departments.map(
              (department: { id: number; name: string; isField: boolean }) => (
                <TableRow key={department.id}>
                  <TableCell>{department.name}</TableCell>
                  <TableCell>{department.isField ? 'Iya' : 'Tidak'}</TableCell>
                  <TableCell>
                    <Button asChild>
                      <Link to={`/departments/${department.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ),
            )}
        </TableBody>
      </Table>
    </div>
  );
}
