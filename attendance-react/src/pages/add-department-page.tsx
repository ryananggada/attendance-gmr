import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { createDepartment } from '@/services/department-service';
import { useMutation } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function AddDepartmentPage() {
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      name: '',
      isField: false,
    },
  });

  const mutation = useMutation({ 
    mutationFn: createDepartment,
    onSuccess: () => {
      toast.success('Tambah department berhasil!');
      navigate('/departments');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const isSubmitting = mutation.isPending;

  const onSubmit = ({ name, isField }: { name: string; isField: boolean }) => {
    mutation.mutate({ name, isField });
  };

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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
            )}
            {isSubmitting ? 'Memproses...' : 'Submit'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
