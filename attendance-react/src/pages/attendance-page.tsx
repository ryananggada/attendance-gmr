import Camera from '@/components/camera';
import { Alert, AlertTitle } from '@/components/ui/alert';
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
import { useReverseGeocode } from '@/hooks/use-reverse-geocode';
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
import { AlertCircleIcon } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

type AttendanceType =
  | 'CheckIn'
  | 'FieldCheckIn'
  | 'FieldCheckOut'
  | 'CheckOut'
  | 'Done'
  | 'Leave'
  | 'EarlyLeave';

export default function AttendancePage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [attendanceType, setAttendanceType] =
    useState<AttendanceType>('CheckIn');
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

  const queryClient = useQueryClient();

  const {
    data: attendanceData,
    isFetched,
    isLoading: isAttendanceLoading,
  } = useQuery({
    queryKey: ['attendance', user!.id, date],
    queryFn: () => getSingleAttendance(user!.id, date),
  });

  const { attendance, checkEvent, leave, earlyLeave } = attendanceData ?? {};

  const events = useMemo(() => {
    if (!checkEvent) return [];
    return Array.isArray(checkEvent) ? checkEvent : [checkEvent];
  }, [checkEvent]);
  const checkInEvent = events.find((ev) => ev.type === 'CheckIn');
  const fieldCheckInEvent = events.find((ev) => ev.type === 'FieldCheckIn');
  const fieldCheckOutEvent = events.find((ev) => ev.type === 'FieldCheckOut');
  const checkOutEvent = events.find((ev) => ev.type === 'CheckOut');

  const { data: locationFieldCheckIn, isLoading: loadingFieldCheckIn } =
    useReverseGeocode(
      fieldCheckInEvent?.location?.[0] ?? null,
      fieldCheckInEvent?.location?.[1] ?? null,
    );

  const { data: locationFieldCheckOut, isLoading: loadingFieldCheckOut } =
    useReverseGeocode(
      fieldCheckOutEvent?.location?.[0] ?? null,
      fieldCheckOutEvent?.location?.[1] ?? null,
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
    const response = await fetch(capturedImage!);
    const blob = await response.blob();
    const file = new File([blob], `attendance-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });
    const coords = await getLocation();

    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const currentTime = format(new Date(), 'HH:mm:ss');

    if (attendanceType === 'CheckIn') {
      checkInMutation.mutate({
        userId: user!.id,
        date: currentDate,
        time: currentTime,
        location: coords,
        image: file,
      });
    }

    if (attendanceType === 'FieldCheckIn') {
      fieldCheckInMutation.mutate({
        userId: user!.id,
        date: currentDate,
        time: currentTime,
        location: coords,
        image: file,
      });
    }

    if (attendanceType === 'FieldCheckOut') {
      fieldCheckOutMutation.mutate({
        userId: user!.id,
        date: currentDate,
        time: currentTime,
        location: coords,
        image: file,
      });
    }

    if (attendanceType === 'CheckOut') {
      checkOutMutation.mutate({
        userId: user!.id,
        date: currentDate,
        time: currentTime,
        location: coords,
        image: file,
      });
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
    if (!isFetched || !user) return;

    if (!attendance) {
      return setAttendanceType('CheckIn');
    }

    if (leave) {
      return setAttendanceType('Leave');
    }

    if (earlyLeave) {
      return setAttendanceType('EarlyLeave');
    }

    const has = (t: string) =>
      events.some((e: { type: string }) => e.type === t);

    if (user.department.isField) {
      if (has('CheckIn') && !has('FieldCheckIn')) {
        return setAttendanceType('FieldCheckIn');
      }

      if (has('CheckIn') && has('FieldCheckIn') && !has('FieldCheckOut')) {
        return setAttendanceType('FieldCheckOut');
      }

      if (
        has('CheckIn') &&
        has('FieldCheckIn') &&
        has('FieldCheckOut') &&
        !has('CheckOut')
      ) {
        return setAttendanceType('CheckOut');
      }
    }

    if (!user.department.isField) {
      if (has('CheckIn') && !has('CheckOut')) {
        return setAttendanceType('CheckOut');
      }
    }

    return setAttendanceType('Done');
  }, [isFetched, attendance, events, leave, earlyLeave, user]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      {isPermissionsLoading ? (
        <Spinner className="mx-auto size-12" />
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
            <DialogTrigger asChild>
              <Button
                className="mx-auto min-w-[156px]"
                disabled={
                  !(
                    cameraStatus === 'granted' && locationStatus === 'granted'
                  ) || ['Done', 'Leave', 'EarlyLeave'].includes(attendanceType)
                }
              >
                Absen
              </Button>
            </DialogTrigger>
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

                  <Button onClick={onSubmit} className="mt-4">
                    Submit
                  </Button>
                </>
              )}
            </DialogContent>
          </Dialog>

          {attendanceType === 'CheckIn' && (
            <div className="mx-auto">
              <Dialog open={leaveDialog} onOpenChange={setLeaveDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="min-w-[156px]">
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

                  <Button onClick={onLeaveSubmit}>Submit</Button>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {attendanceType !== 'CheckIn' && (
            <div className="mx-auto">
              <Dialog
                open={earlyLeaveDialog}
                onOpenChange={setEarlyLeaveDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    disabled={['EarlyLeave', 'Done'].includes(attendanceType)}
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

                  <Button onClick={onEarlyLeaveSubmit}>Submit</Button>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </>
      ) : (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>
            Mohon nyalain izin lokasi dan kamera di perangkat anda.
          </AlertTitle>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Check In</CardTitle>
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
                <CardTitle>Field</CardTitle>
              </CardHeader>
              <CardContent>
                {isAttendanceLoading ? (
                  <Spinner className="size-6" />
                ) : fieldCheckInEvent ? (
                  <>
                    <p>{fieldCheckInEvent.time}</p>
                    <p>
                      {loadingFieldCheckIn ? 'Memuat...' : locationFieldCheckIn}
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
                <CardTitle>Return</CardTitle>
              </CardHeader>
              <CardContent>
                {isAttendanceLoading ? (
                  <Spinner className="size-6" />
                ) : fieldCheckOutEvent ? (
                  <>
                    <p>{fieldCheckOutEvent.time}</p>
                    <p>
                      {loadingFieldCheckOut
                        ? 'Memuat...'
                        : locationFieldCheckOut}
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
            <CardTitle>Check Out</CardTitle>
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
    </div>
  );
}
