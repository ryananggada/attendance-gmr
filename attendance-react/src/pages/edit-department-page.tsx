import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  getDepartmentById,
  updateDepartment,
} from '@/services/department-service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import z from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Nama dibutuhkan'),
  isField: z.boolean(),
});

export default function EditDepartmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: department } = useQuery({
    queryKey: ['department', id],
    queryFn: () => getDepartmentById(Number(id)),
  });

  const mutation = useMutation({
    mutationFn: updateDepartment,
    onSuccess: () => {
      toast.success('Ubah department berhasil!');
      navigate('/departments');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      isField: false,
    },
  });

  const onSubmit = ({ name, isField }: { name: string; isField: boolean }) => {
    mutation.mutate({ id: Number(id!), name, isField });
  };

  useEffect(() => {
    if (department) {
      form.reset({
        name: department.name,
        isField: department.isField,
      });
    }
  }, [department, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nama</FieldLabel>
              <Input
                {...field}
                className="max-w-72"
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="isField"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
              />

              <FieldLabel htmlFor={field.name} className="text-sm font-normal">
                Lapangan
              </FieldLabel>
            </Field>
          )}
        />

        <Field orientation="horizontal">
          <Button type="submit">Edit</Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
