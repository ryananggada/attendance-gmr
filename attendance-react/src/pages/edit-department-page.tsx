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
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';

export default function EditDepartmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: department } = useQuery({
    queryKey: ['department', id],
    queryFn: () => getDepartmentById(Number(id)),
  });

  const mutation = useMutation({ mutationFn: updateDepartment });

  const form = useForm({
    defaultValues: {
      name: '',
      isField: false,
    },
  });

  const onSubmit = ({ name, isField }: { name: string; isField: boolean }) => {
    mutation.mutate({ id: Number(id!), name, isField });
    navigate('/departments');
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
