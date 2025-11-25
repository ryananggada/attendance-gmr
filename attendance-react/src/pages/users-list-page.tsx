import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { getUsers } from '@/services/user-service';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router';

type User = {
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  };
  department: { name: string };
};

const columns: ColumnDef<User>[] = [
  {
    accessorFn: (row) => row.user.username,
    id: 'username',
    header: 'Username',
  },
  {
    accessorFn: (row) => row.user.fullName,
    id: 'fullName',
    header: 'Full Name',
  },
  {
    accessorFn: (row) => row.department.name,
    id: 'departmentName',
    header: 'Department',
  },
  {
    accessorFn: (row) => row.user.role,
    id: 'role',
    header: 'Role',
  },
  {
    accessorFn: (row) => row.user.id,
    id: 'userId',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const userId = row.getValue('userId');

      return (
        <div className="text-right">
          <Button asChild>
            <Link to={`/users/${userId}/edit`}>Ubah</Link>
          </Button>
        </div>
      );
    },
  },
];

export default function UsersListPage() {
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: getUsers });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Button asChild className="max-w-[200px]">
        <Link to="/users/create">Tambah User</Link>
      </Button>

      <DataTable columns={columns} data={users ?? []} />
    </div>
  );
}
