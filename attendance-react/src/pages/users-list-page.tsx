import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getUsers } from '@/services/user-service';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

export default function UsersListPage() {
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: getUsers });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Button asChild className="max-w-[200px]">
        <Link to="/users/create">Tambah User</Link>
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users &&
            users.map(
              (item: {
                user: {
                  id: number;
                  username: string;
                  fullName: string;
                  role: string;
                };
                department: { name: string };
              }) => (
                <TableRow key={item.user.id}>
                  <TableCell className="font-medium">
                    {item.user.username}
                  </TableCell>
                  <TableCell>{item.user.fullName}</TableCell>
                  <TableCell>{item.department.name}</TableCell>
                  <TableCell>{item.user.role}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild>
                      <Link to={`/users/${item.user.id}/edit`}>Ubah</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ),
            )}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
