import Camera from '@/components/camera';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { format } from 'date-fns';
import { AlertCircleIcon, Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import z from 'zod';

const formSchema = z.object({
  customer: z.string().min(1, 'Customer dibutuhkan'),
  personInCharge: z.string().min(1, 'Person in Charge dibutuhkan'),
  remarks: z.string().optional().default(''),
});

export default function AddFieldAttendancePage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { getLocation } = useGeolocation();
  const {
    isLoading: isPermissionsLoading,
    isGranted,
    cameraStatus,
    locationStatus,
    requestCamera,
    requestLocation,
  } = usePermissions();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createFieldAttendance,
    onSuccess: () => {
      setOpenDialog(false);
      toast.success('Tambah lapangan kehadiran berhasil!');
      navigate('/field-attendance');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer: '',
      personInCharge: '',
      remarks: '',
    },
  });

  const onSubmit = async ({
    customer,
    personInCharge,
    remarks,
  }: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(capturedImage!);
      const blob = await response.blob();
      const file = new File([blob], `attendance-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      const coords = await getLocation();

      const currentDate = format(new Date(), 'yyyy-MM-dd');
      const currentTime = format(new Date(), 'HH:mm:ss');

      mutation.mutate({
        userId: user!.id,
        date: currentDate,
        customer,
        personInCharge,
        image: file,
        remarks: remarks ?? null,
        time: currentTime,
        location: coords,
      });
    } catch (error) {
      toast.error(error.message || 'Gagal submit absen lapangan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (cameraStatus !== 'granted') {
      requestCamera();
    }

    if (locationStatus !== 'granted') {
      requestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraStatus, locationStatus]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
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

        {isPermissionsLoading ? (
          <Alert>
            <Loader2Icon className="h-4 w-4 animate-spin" />
            <AlertTitle>Mengecek izin</AlertTitle>
            <AlertDescription>
              Memastikan kamera sama lokasi dinyalakan...
            </AlertDescription>
          </Alert>
        ) : isGranted ? (
          <>
            <Dialog
              open={openDialog}
              onOpenChange={(isOpen) => {
                setOpenDialog(isOpen);

                if (!isOpen) {
                  setCapturedImage('');
                }
              }}
            >
              <Button
                type="button"
                className="mx-auto min-w-[156px]"
                onClick={async () => {
                  const isValid = await form.trigger([
                    'customer',
                    'personInCharge',
                  ]);

                  if (isValid) {
                    setOpenDialog(true);
                  }
                }}
              >
                Ambil foto
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ambil foto</DialogTitle>
                </DialogHeader>

                {!capturedImage && (
                  <Camera setCapturedImage={setCapturedImage} />
                )}
                {capturedImage && (
                  <>
                    <div className="w-full max-w-md mx-auto">
                      <div className="aspect-[3/4] bg-black rounded overflow-hidden">
                        <img
                          src={capturedImage}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="mt-4"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={!capturedImage || isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Tambah Lapangan
                    </Button>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Izin dibutuhkan</AlertTitle>
            <AlertDescription>
              Mohon nyalain izin lokasi dan kamera di perangkat anda.
            </AlertDescription>
          </Alert>
        )}
      </FieldGroup>
    </form>
  );
}
