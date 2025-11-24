import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { useGeolocation } from '@/hooks/use-geolocation';
import { usePermissions } from '@/hooks/use-permissions';
import { createFieldAttendance } from '@/services/field-attendance-service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
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

        <Controller
          name="image"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Gambar</FieldLabel>
              <Input
                id={field.name}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  field.onChange(file);
                }}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="customer"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Customer</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="personInCharge"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Person in Charge</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="remarks"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Keterangan</FieldLabel>
              <Textarea id={field.name} className="resize-none" {...field} />
            </Field>
          )}
        />

        <Field orientation="horizontal">
          <Button type="submit" className="max-w-[256px]">
            Tambah Lapangan
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
