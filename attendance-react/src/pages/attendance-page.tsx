import Camera from '@/components/camera';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/auth-context';
import { useGeolocation } from '@/hooks/use-geolocation';
import { usePermissions } from '@/hooks/use-permissions';
import { haversineDistance } from '@/lib/distance';
import {
  checkIn,
  checkOut,
  fieldCheckIn,
  fieldCheckOut,
  getSingleAttendance,
  submitEarlyLeave,
  submitLeave,
} from '@/services/attendance-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

type AttendanceType =
  | 'CheckIn'
  | 'FieldCheckIn'
  | 'FieldCheckOut'
  | 'CheckOut'
  | null;

export default function AttendancePage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [attendanceType, setAttendanceType] = useState<AttendanceType>(null);

  const openAttendanceDialog = (type: AttendanceType) => {
    setAttendanceType(type);
    setOpenDialog(true);
  };

  const { getLocation } = useGeolocation();
  const {
    isLoading: isPermissionsLoading,
    isGranted,
    cameraStatus,
    locationStatus,
    requestCamera,
    requestLocation,
  } = usePermissions();
  const { user } = useAuth();
  const date = format(new Date(), 'yyyy-MM-dd');

  const [openDialog, setOpenDialog] = useState(false);
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [earlyLeaveDialog, setEarlyLeaveDialog] = useState(false);

  const [leaveType, setLeaveType] = useState('');
  const [leaveRemarks, setLeaveRemarks] = useState('');
  const [earlyLeaveType, setEarlyLeaveType] = useState('');
  const [earlyLeaveRemarks, setEarlyLeaveRemarks] = useState('');

  const [distance, setDistance] = useState<number | null>(null);
  const [distanceLoading, setDistanceLoading] = useState(true);
  const isOutOfOffice =
    !distanceLoading &&
    distance !== null &&
    distance >= import.meta.env.VITE_MAX_DISTANCE;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const { data: attendanceData, isLoading: isAttendanceLoading } = useQuery({
    queryKey: ['attendance', user!.id, date],
    queryFn: () => getSingleAttendance(user!.id, date),
  });

  const { attendance, checkEvent, earlyLeave, leave } = attendanceData ?? {};

  const events = useMemo(() => {
    if (!checkEvent) return [];
    return Array.isArray(checkEvent) ? checkEvent : [checkEvent];
  }, [checkEvent]);
  const checkInEvent = events.find((ev) => ev.type === 'CheckIn');
  const fieldCheckInEvent = events.find((ev) => ev.type === 'FieldCheckIn');
  const fieldCheckOutEvent = events.find((ev) => ev.type === 'FieldCheckOut');
  const checkOutEvent = events.find((ev) => ev.type === 'CheckOut');

  const attendanceState = {
    checkInDone: !!checkInEvent,
    fieldCheckInDone: !!fieldCheckInEvent,
    fieldCheckOutDone: !!fieldCheckOutEvent,
    checkOutDone: !!checkOutEvent,
  };

  const attendanceLocked =
    !isGranted || isOutOfOffice || distanceLoading || isSubmitting || !!leave;

  const canCheckIn =
    !attendanceLocked &&
    !attendanceState.checkInDone &&
    !attendanceState.checkOutDone;
  const canFieldCheckIn =
    !attendanceLocked &&
    attendanceState.checkInDone &&
    !attendanceState.fieldCheckInDone &&
    !attendanceState.checkOutDone;
  const canFieldCheckOut =
    !attendanceLocked &&
    attendanceState.checkInDone &&
    !attendanceState.fieldCheckOutDone &&
    !attendanceState.checkOutDone;
  const canCheckOut =
    !attendanceLocked &&
    attendanceState.checkInDone &&
    !attendanceState.checkOutDone;

  const hasCheckedIn = events?.some(
    (e: { type: string }) => e.type === 'CheckIn',
  );
  const hasCheckedOut = events?.some(
    (e: { type: string }) => e.type === 'CheckOut',
  );

  const checkInMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', user!.id, date],
      });

      toast.success('Check in berhasil!');
      setCapturedImage(null);
      setOpenDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const fieldCheckInMutation = useMutation({
    mutationFn: fieldCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', user!.id, date],
      });

      toast.success('Check in lapangan berhasil!');
      setCapturedImage(null);
      setOpenDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const fieldCheckOutMutation = useMutation({
    mutationFn: fieldCheckOut,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', user!.id, date],
      });

      toast.success('Check out lapangan berhasil!');
      setCapturedImage(null);
      setOpenDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', user!.id, date],
      });

      toast.success('Check out berhasil!');
      setCapturedImage(null);
      setOpenDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const earlyLeaveMutation = useMutation({
    mutationFn: submitEarlyLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', user!.id, date],
      });

      toast.success('Izin berhasil!');
      setEarlyLeaveDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const leaveMutation = useMutation({
    mutationFn: submitLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', user!.id, date],
      });

      toast.success('Tidak hadir berhasil!');
      setLeaveDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch(capturedImage!);
      const blob = await response.blob();
      const file = new File([blob], `attendance-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      const coords = await getLocation();

      const payload = {
        userId: user!.id,
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm:ss'),
        location: coords,
        image: file,
      };

      if (attendanceType === 'CheckIn') {
        await checkInMutation.mutateAsync(payload);
      }

      if (attendanceType === 'FieldCheckIn') {
        await fieldCheckInMutation.mutateAsync(payload);
      }

      if (attendanceType === 'FieldCheckOut') {
        await fieldCheckOutMutation.mutateAsync(payload);
      }

      if (attendanceType === 'CheckOut') {
        await checkOutMutation.mutateAsync(payload);
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onLeaveSubmit = async () => {
    leaveMutation.mutate({
      userId: user!.id,
      date: format(new Date(), 'yyyy-MM-dd'),
      type: leaveType,
      time: format(new Date(), 'HH:mm:ss'),
      remarks: leaveRemarks,
    });
  };

  const onEarlyLeaveSubmit = async () => {
    earlyLeaveMutation.mutate({
      userId: user!.id,
      date: format(new Date(), 'yyyy-MM-dd'),
      type: earlyLeaveType,
      time: format(new Date(), 'HH:mm:ss'),
      remarks: earlyLeaveRemarks,
    });
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

  useEffect(() => {
    let cancelled = false;

    const checkDistance = async () => {
      try {
        setDistanceLoading(true);

        const coords = await getLocation();
        const d = haversineDistance(coords.latitude, coords.longitude);

        if (!cancelled) {
          setDistance(d);
        }
      } catch {
        if (!cancelled) {
          setDistance(null);
        }
      } finally {
        if (!cancelled) {
          setDistanceLoading(false);
        }
      }
    };

    checkDistance();

    return () => {
      cancelled = true;
    };
  }, [getLocation]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Dialog
        open={openDialog}
        onOpenChange={(isOpen) => {
          setOpenDialog(isOpen);

          if (!isOpen) {
            setCapturedImage('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Absen</DialogTitle>
          </DialogHeader>

          {!capturedImage && <Camera setCapturedImage={setCapturedImage} />}
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
                onClick={onSubmit}
                disabled={isSubmitting}
                className="mt-4"
              >
                {isSubmitting && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {leave && (
        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>Tidak hadir</AlertTitle>
          <AlertDescription>
            Anda telah melakukan absen tidak hadir.
          </AlertDescription>
        </Alert>
      )}

      {earlyLeave && (
        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>Izin</AlertTitle>
          <AlertDescription>Anda telah melakukan izin.</AlertDescription>
        </Alert>
      )}

      {isPermissionsLoading ? (
        <Alert>
          <Loader2Icon className="h-4 w-4 animate-spin" />
          <AlertTitle>Mengecek izin</AlertTitle>
          <AlertDescription>
            Memastikan kamera sama lokasi dinyalakan...
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {!isGranted && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Izin dibutuhkan</AlertTitle>
              <AlertDescription>
                Mohon nyalain izin lokasi dan kamera di perangkat anda.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {distanceLoading && (
        <Alert>
          <Loader2Icon className="h-4 w-4 animate-spin" />
          <AlertTitle>Mengecek lokasi</AlertTitle>
          <AlertDescription>
            Memastikan Anda berada di area kantor...
          </AlertDescription>
        </Alert>
      )}

      {isOutOfOffice && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Di luar area kantor</AlertTitle>
          <AlertDescription>
            Anda berada {distance?.toFixed(0)} m dari kantor. Hanya izin dan
            tidak hadir yang diperbolehkan.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Check In
              <Button
                onClick={() => openAttendanceDialog('CheckIn')}
                disabled={!canCheckIn}
              >
                Absen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAttendanceLoading ? (
              <Spinner className="size-6" />
            ) : checkInEvent ? (
              <>
                <p>{checkInEvent.time}</p>
                <p>
                  {haversineDistance(
                    checkInEvent.location[0],
                    checkInEvent.location[1],
                  ).toFixed(0)}{' '}
                  m dari kantor
                </p>
                <img
                  src={`${import.meta.env.VITE_IMAGE_URL}/${
                    checkInEvent.image
                  }`}
                  alt="Image"
                  className="mx-auto mt-2 aspect-3/4 w-48 object-cover rounded-md"
                />
              </>
            ) : (
              <p>-</p>
            )}
          </CardContent>
        </Card>

        {user?.department.isField && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Field
                  <Button
                    onClick={() => openAttendanceDialog('FieldCheckIn')}
                    disabled={!canFieldCheckIn}
                  >
                    Absen
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAttendanceLoading ? (
                  <Spinner className="size-6" />
                ) : fieldCheckInEvent ? (
                  <>
                    <p>{fieldCheckInEvent.time}</p>
                    <p>
                      {haversineDistance(
                        fieldCheckInEvent.location[0],
                        fieldCheckInEvent.location[1],
                      ).toFixed(0)}{' '}
                      m dari kantor
                    </p>
                    <img
                      src={`${import.meta.env.VITE_IMAGE_URL}/${
                        fieldCheckInEvent.image
                      }`}
                      alt="Image"
                      className="mx-auto mt-2 aspect-3/4 w-48 object-cover rounded-md"
                    />
                  </>
                ) : (
                  <p>-</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Return
                  <Button
                    onClick={() => openAttendanceDialog('FieldCheckOut')}
                    disabled={!canFieldCheckOut}
                  >
                    Absen
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAttendanceLoading ? (
                  <Spinner className="size-6" />
                ) : fieldCheckOutEvent ? (
                  <>
                    <p>{fieldCheckOutEvent.time}</p>
                    <p>
                      {haversineDistance(
                        fieldCheckOutEvent.location[0],
                        fieldCheckOutEvent.location[1],
                      ).toFixed(0)}{' '}
                      m dari kantor
                    </p>
                    <img
                      src={`${import.meta.env.VITE_IMAGE_URL}/${
                        fieldCheckOutEvent.image
                      }`}
                      alt="Image"
                      className="mx-auto mt-2 aspect-3/4 w-48 object-cover rounded-md"
                    />
                  </>
                ) : (
                  <p>-</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Check Out
              <Button
                onClick={() => openAttendanceDialog('CheckOut')}
                disabled={!canCheckOut}
              >
                Absen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAttendanceLoading ? (
              <Spinner className="size-6" />
            ) : checkOutEvent ? (
              <>
                <p>{checkOutEvent.time}</p>

                <p>
                  {haversineDistance(
                    checkOutEvent.location[0],
                    checkOutEvent.location[1],
                  ).toFixed(0)}{' '}
                  m dari kantor
                </p>
                <img
                  src={`${import.meta.env.VITE_IMAGE_URL}/${
                    checkOutEvent.image
                  }`}
                  alt="Image"
                  className="mx-auto mt-2 aspect-3/4 w-48 object-cover rounded-md"
                />
              </>
            ) : (
              <p>-</p>
            )}
          </CardContent>
        </Card>
      </div>

      {!hasCheckedIn && (
        <div className="mx-auto">
          <Dialog open={leaveDialog} onOpenChange={setLeaveDialog}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="min-w-[156px]"
                disabled={!!leave}
              >
                Tidak hadir
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Yakin absen tidak hadir? Pilih alasannya.
                </DialogTitle>
              </DialogHeader>

              <Field>
                <Select onValueChange={(e) => setLeaveType(e)}>
                  <SelectTrigger className="w-[256px]">
                    <SelectValue placeholder="Pilih alasan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Sick">Sakit</SelectItem>
                      <SelectItem value="Leave">Cuti</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <FieldLabel>Keterangan</FieldLabel>
                <Input
                  value={leaveRemarks}
                  onChange={(e) => setLeaveRemarks(e.target.value)}
                />
              </Field>

              <Button
                onClick={onLeaveSubmit}
                disabled={leaveMutation.isPending}
              >
                {leaveMutation.isPending && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {attendance && !leave && (
        <div className="mx-auto">
          <Dialog open={earlyLeaveDialog} onOpenChange={setEarlyLeaveDialog}>
            <DialogTrigger asChild>
              <Button
                disabled={!!earlyLeave || hasCheckedOut}
                variant="secondary"
                className="min-w-[156px]"
              >
                Izin
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yakin izin? Pilih alasannya.</DialogTitle>
              </DialogHeader>

              <Field>
                <Select onValueChange={(e) => setEarlyLeaveType(e)}>
                  <SelectTrigger className="w-[256px]">
                    <SelectValue placeholder="Pilih alasan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Time">Waktu Kerja</SelectItem>
                      <SelectItem value="Early">Pulang Cepat</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <FieldLabel>Keterangan</FieldLabel>
                <Input
                  value={earlyLeaveRemarks}
                  onChange={(e) => setEarlyLeaveRemarks(e.target.value)}
                />
              </Field>

              <Button
                onClick={onEarlyLeaveSubmit}
                disabled={earlyLeaveMutation.isPending}
              >
                {earlyLeaveMutation.isPending && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
