import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  getDepartmentById,
  updateDepartment,
} from '@/services/department-service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-4 p-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex items-center">
              <FormLabel className="mr-2">Nama</FormLabel>
              <FormControl>
                <Input className="max-w-56" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isField"
          render={({ field }) => (
            <FormItem className="flex items-center">
              <FormControl>
                <Checkbox
                  id="isField"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel htmlFor="isField" className="text-sm font-normal">
                Lapangan
              </FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit">Edit</Button>
      </form>
    </Form>
  );
}
