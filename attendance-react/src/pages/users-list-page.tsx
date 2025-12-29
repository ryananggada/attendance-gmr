import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import { deleteUser, getUsers } from '@/services/user-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router';
import { toast } from 'sonner';

type User = {
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  };
  department: { name: string };
};

export default function UsersListPage() {
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const mutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      });

      toast.success('User berhasil dihapus');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onDeleteSubmit = async (userId: number) => {
    mutation.mutate(userId);
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
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const userId = row.getValue<number>('userId');
        const isSelf = userId === user?.id;

        return (
          <div className="text-right">
            {isSelf ? (
              <div className="flex justify-end gap-2">
                <Button disabled>Ubah</Button>
                <Button variant="destructive" disabled>
                  Hapus
                </Button>
              </div>
            ) : (
              <div className="flex justify-end gap-2">
                <Button asChild>
                  <Link to={`/users/${userId}/edit`}>Ubah</Link>
                </Button>

                <Dialog>
                  <DialogTrigger>
                    <Button variant="destructive">Hapus</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yakin mau hapus user?</DialogTitle>
                    </DialogHeader>

                    <DialogDescription>
                      Aksi ini tidak bisa diubah.
                    </DialogDescription>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          variant="destructive"
                          onClick={() => onDeleteSubmit(userId)}
                        >
                          Hapus
                        </Button>
                      </DialogClose>

                      <DialogClose asChild>
                        <Button variant="secondary">Batal</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Button asChild className="max-w-[200px]">
        <Link to="/users/create">Tambah User</Link>
      </Button>

      <DataTable columns={columns} data={users} isLoading={isLoading} />
    </div>
  );
}
