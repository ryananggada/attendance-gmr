import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { getDepartments } from '@/services/department-service';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router';

type Department = {
  id: number;
  name: string;
  isField: boolean;
};

const columns: ColumnDef<Department>[] = [
  {
    accessorKey: 'name',
    header: 'Nama',
  },
  {
    accessorKey: 'isField',
    header: 'Ada Lapangan?',
    cell: ({ row }) => {
      const isField = row.getValue('isField');

      return isField ? <>Iya</> : <>Tidak</>;
    },
  },
  {
    accessorKey: 'id',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const departmentId = row.getValue('id');

      return (
        <div className="text-right">
          <Button asChild>
            <Link to={`/departments/${departmentId}/edit`}>Edit</Link>
          </Button>
        </div>
      );
    },
  },
];

export default function DepartmentsListPage() {
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Button asChild className="max-w-[200px]">
        <Link to="/departments/create">Tambah Department</Link>
      </Button>

      <DataTable columns={columns} data={departments} isLoading={isLoading} />
    </div>
  );
}
