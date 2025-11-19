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
import { createDepartment } from '@/services/department-service';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

export default function AddDepartmentPage() {
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      name: '',
      isField: false,
    },
  });

  const mutation = useMutation({ mutationFn: createDepartment });

  const onSubmit = ({ name, isField }: { name: string; isField: boolean }) => {
    mutation.mutate({ name, isField });
    navigate('/departments');
  };

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

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
