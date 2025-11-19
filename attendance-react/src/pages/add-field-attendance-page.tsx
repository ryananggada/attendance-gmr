import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { useGeolocation } from '@/hooks/use-geolocation';
import { usePermissions } from '@/hooks/use-permissions';
import { createFieldAttendance } from '@/services/field-attendance-service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import z from 'zod';

const formSchema = z.object({
  image: z
    .instanceof(File, { message: 'Please upload an image' })
    .refine((file) => file.size > 0, 'Image cannot be empty'),
  customer: z.string().min(1, 'Customer is required'),
  personInCharge: z.string().min(1, 'Person in Charge is required'),
  remarks: z.string().optional().default(''),
});

export default function AddFieldAttendancePage() {
  const { user } = useAuth();
  const { getLocation } = useGeolocation();
  const { locationStatus, requestLocation } = usePermissions();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: createFieldAttendance,
    onSuccess: () => navigate('/field-attendance'),
    onError: (err) => console.log(err),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: undefined,
      customer: '',
      personInCharge: '',
      remarks: '',
    },
  });

  const onSubmit = async ({
    image,
    customer,
    personInCharge,
    remarks,
  }: z.infer<typeof formSchema>) => {
    const coords = await getLocation();

    mutation.mutate({
      userId: user!.id,
      date: new Date(),
      customer,
      personInCharge,
      image,
      remarks: remarks ?? null,
      time: new Date().toLocaleTimeString('en-GB'),
      location: coords,
    });
  };

  useEffect(() => {
    if (locationStatus !== 'granted') {
      requestLocation();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationStatus]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-4 p-4"
      >
        {form.watch('image') ? (
          <img
            src={URL.createObjectURL(form.watch('image'))}
            alt="Preview"
            className="mt-2 w-40 h-40 object-cover rounded-md"
          />
        ) : (
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png"
            alt="No image"
            className="mt-2 w-40 h-40 object-cover rounded-md"
          />
        )}

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gambar</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    field.onChange(file);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personInCharge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Person in Charge</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan</FormLabel>
              <FormControl>
                <Textarea className="resize-none" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="max-w-[256px]">
          Tambah Lapangan
        </Button>
      </form>
    </Form>
  );
}
