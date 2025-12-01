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
import { getDepartments } from '@/services/department-service';
import { getUser, updatePassword, updateUser } from '@/services/user-service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import z from 'zod';

const passwordFormSchema = z
  .object({
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Need to confirm password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const editUserFormSchema = z.object({
  fullName: z.string().min(1, 'Fullname is required'),
  departmentId: z.string().min(1, 'Department must be selected'),
  role: z.enum(['User', 'Admin']),
});

export default function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(Number(id)),
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
      confirmPassword: '',
    },
  });

  const onPasswordSubmit = ({
    password,
    confirmPassword,
  }: z.infer<typeof passwordFormSchema>) => {
    changePasswordMutation.mutate({
      id: Number(id),
      password,
      confirmPassword,
    });
  };

  useEffect(() => {
    if (user && departments) {
      editUserForm.reset({
        fullName: user.fullName,
        departmentId: String(user.departmentId),
        role: user.role,
      });
    }
  }, [user, departments, editUserForm]);

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
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : ''}
                  disabled={!departments || departments.length === 0}
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

          <Button type="submit">Submit</Button>
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
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={passwordForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field>
            <Button type="submit">Change Password</Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
