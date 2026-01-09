import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { getDepartments } from '@/services/department-service';
import {
  getUserById,
  updatePassword,
  updateUser,
} from '@/services/user-service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import z from 'zod';

const passwordFormSchema = z.object({
  password: z
    .string()
    .min(1, 'Password dibutuhkan')
    .min(8, 'Password harus 8 karakter atau lebih'),
});

const editUserFormSchema = z.object({
  fullName: z.string().min(1, 'Nama dibutuhkan'),
  departmentId: z.string().min(1, 'Department harus dipilih'),
  role: z.enum(['User', 'Admin'], 'Role harus dipilih'),
});

export default function EditUserPage() {
  const [showPassword, setShowPassword] = useState(false);

  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { data: user } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(Number(id)),
  });
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const changePasswordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success('Ubah password berhasil!');
      navigate('/users');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isChangePasswordSubmitting = changePasswordMutation.isPending;

  const editUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      toast.success('Ubah informasi user berhasil!');
      navigate('/users');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isEditUserSubmitting = editUserMutation.isPending;

  const editUserForm = useForm<z.infer<typeof editUserFormSchema>>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      fullName: '',
      departmentId: undefined,
      role: 'User',
    },
  });

  const onEditUserSubmit = ({
    fullName,
    departmentId,
    role,
  }: z.infer<typeof editUserFormSchema>) => {
    editUserMutation.mutate({
      id: Number(id),
      fullName,
      departmentId: Number(departmentId),
      role,
    });
  };

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: '',
    },
  });

  const onPasswordSubmit = ({
    password,
  }: z.infer<typeof passwordFormSchema>) => {
    changePasswordMutation.mutate({
      id: Number(id),
      password: String(password),
    });
  };

  useEffect(() => {
    if (user && departments?.length) {
      editUserForm.reset({
        fullName: user.fullName,
        departmentId: String(user.departmentId),
        role: user.role,
      });
    }
  }, [user, departments, editUserForm]);

  if (currentUser!.id === Number(id)) {
    navigate('/users');
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h2 className="text-2xl font-bold">Ubah Informasi User</h2>

      <form onSubmit={editUserForm.handleSubmit(onEditUserSubmit)}>
        <FieldGroup>
          <Controller
            name="fullName"
            control={editUserForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="departmentId"
            control={editUserForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Department</FieldLabel>
                <Select
                  name={field.name}
                  key={editUserForm.watch('departmentId')}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!departments}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>

                  <SelectContent>
                    {departments?.map(
                      (department: { id: number; name: string }) => (
                        <SelectItem
                          key={department.id}
                          value={String(department.id)}
                        >
                          {department.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="role"
            control={editUserForm.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Role</FieldLabel>
                <Select
                  key={editUserForm.watch('role')}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Button
            type="submit"
            disabled={isEditUserSubmitting || isChangePasswordSubmitting}
          >
            {isEditUserSubmitting && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Ubah
          </Button>
        </FieldGroup>
      </form>

      <Separator />

      <h2 className="text-2xl font-bold">Ubah Password</h2>

      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
        <FieldGroup>
          <Controller
            name="password"
            control={passwordForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id={field.name}
                    type={showPassword ? 'text' : 'password'}
                    aria-invalid={fieldState.invalid}
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field>
            <Button
              type="submit"
              disabled={isChangePasswordSubmitting || isEditUserSubmitting}
            >
              {isChangePasswordSubmitting && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Ubah Password
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
