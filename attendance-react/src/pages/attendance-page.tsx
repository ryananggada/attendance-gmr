import Camera from '@/components/camera';
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
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

export default function AttendancePage() {
  const [capturedImage, setCapturedImage] = useState('');
  const [attendanceType, setAttendanceType] = useState<
    | 'CheckIn'
    | 'FieldCheckIn'
    | 'FieldCheckOut'
    | 'CheckOut'
    | 'Done'
    | 'Leave'
    | 'EarlyLeave'
  >('Done');
  const [openDialog, setOpenDialog] = useState(false);
  const { getLocation } = useGeolocation();
  const { cameraStatus, requestCamera, locationStatus, requestLocation } =
    usePermissions();
  const { user } = useAuth();
  const date = new Date().toISOString().split('T')[0];

  const [leaveType, setLeaveType] = useState('');
  const [leaveRemarks, setLeaveRemarks] = useState('');
  const [earlyLeaveType, setEarlyLeaveType] = useState('');
  const [earlyLeaveRemarks, setEarlyLeaveRemarks] = useState('');

  const queryClient = useQueryClient();

  const { data: attendanceData, isFetched } = useQuery({
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
      toast.success('Check in berhasil!');
      queryClient.invalidateQueries({
        queryKey: ['attendance', user!.id, date],
      });
    },
  });

  const fieldCheckInMutation = useMutation({
    mutationFn: fieldCheckIn,
    onSuccess: () => {
      toast.success('Check in lapangan berhasil!');
      queryClient.invalidateQueries({
        queryKey: ['attendance', user!.id, date],
      });
    },
  });

  const fieldCheckOutMutation = useMutation({
    mutationFn: fieldCheckOut,
    onSuccess: () => {
      toast.success('Check out lapangan berhasil!');
      queryClient.invalidateQueries({
        queryKey: ['attendance', user!.id, date],
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: checkOut,
    onSuccess: () => {
      toast.success('Check out berhasil!');
      queryClient.invalidateQueries({
        queryKey: ['attendance', user!.id, date],
      });
    },
  });

  const earlyLeaveMutation = useMutation({
    mutationFn: submitEarlyLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', user!.id, date],
      });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: submitLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', user!.id, date],
      });
    },
  });

  const onSubmit = async () => {
    const response = await fetch(capturedImage);
    const blob = await response.blob();
    const file = new File([blob], `attendance-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });
    const coords = await getLocation();

    if (attendanceType === 'CheckIn') {
      checkInMutation.mutate({
        userId: user!.id,
        date: new Date(),
        time: new Date().toLocaleTimeString('en-GB'),
        location: coords,
        image: file,
      });
    }

    if (attendanceType === 'FieldCheckIn') {
      fieldCheckInMutation.mutate({
        userId: user!.id,
        date: new Date(),
        time: new Date().toLocaleTimeString('en-GB'),
        location: coords,
        image: file,
      });
    }

    if (attendanceType === 'FieldCheckOut') {
      fieldCheckOutMutation.mutate({
        userId: user!.id,
        date: new Date(),
        time: new Date().toLocaleTimeString('en-GB'),
        location: coords,
        image: file,
      });
    }

    if (attendanceType === 'CheckOut') {
      checkOutMutation.mutate({
        userId: user!.id,
        date: new Date(),
        time: new Date().toLocaleTimeString('en-GB'),
        location: coords,
        image: file,
      });
    }

    setCapturedImage('');
  };

  const onLeaveSubmit = async () => {
    leaveMutation.mutate({
      userId: user!.id,
      date: new Date(),
      type: leaveType,
      time: new Date().toLocaleTimeString('en-GB'),
      remarks: leaveRemarks,
    });

    setAttendanceType('Leave');
  };

  const onEarlyLeaveSubmit = async () => {
    earlyLeaveMutation.mutate({
      userId: user!.id,
      date: new Date(),
      type: earlyLeaveType,
      time: new Date().toLocaleDateString('en-GB'),
      remarks: earlyLeaveRemarks,
    });

    setAttendanceType('EarlyLeave');
  };

  useEffect(() => {
    if (!(cameraStatus === 'granted' && locationStatus === 'granted')) {
      requestCamera();
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

    const has = (t: string) =>
      events.some((e: { type: string }) => e.type === t);

    if (has('CheckIn') && !has('FieldCheckIn')) {
      return setAttendanceType('FieldCheckIn');
    }

    if (has('CheckIn') && has('FieldCheckIn') && !has('FieldCheckOut')) {
      return setAttendanceType('FieldCheckOut');
    }

    if (
      has('CheckIn') &&
      has('FieldCheckIn') &&
      has('FieldCheckoOut') &&
      !has('CheckOut')
    ) {
      return setAttendanceType('CheckOut');
    }

    if (earlyLeave) {
      return setAttendanceType('EarlyLeave');
    }

    return setAttendanceType('Done');
  }, [isFetched, attendance, events, leave, earlyLeave, user]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Check in</CardTitle>
          </CardHeader>
          <CardContent>
            {checkInEvent ? (
              <>
                <p>{checkInEvent.time}</p>
                <p>
                  {haversineDistance(
                    checkInEvent.location[0],
                    checkInEvent.location[1],
                  ).toFixed(0)}{' '}
                  m dari kantor
                </p>
                {checkInEvent.image ? (
                  <img
                    src={`${import.meta.env.VITE_IMAGE_URL}/${
                      checkInEvent.image
                    }`}
                    alt="Image"
                    className="mt-2 w-36 h-36 object-cover rounded-md"
                  />
                ) : (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png"
                    alt="No image"
                    className="mt-2 w-36 h-36 object-cover rounded-md"
                  />
                )}
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
                {fieldCheckInEvent ? (
                  <>
                    <p>{fieldCheckInEvent.time}</p>
                    <p>
                      {loadingFieldCheckIn ? 'Memuat...' : locationFieldCheckIn}
                    </p>
                    {fieldCheckInEvent.image ? (
                      <img
                        src={`${import.meta.env.VITE_IMAGE_URL}/${
                          fieldCheckInEvent.image
                        }`}
                        alt="Image"
                        className="mt-2 w-36 h-36 object-cover rounded-md"
                      />
                    ) : (
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png"
                        alt="No image"
                        className="mt-2 w-36 h-36 object-cover rounded-md"
                      />
                    )}
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
                {fieldCheckOutEvent ? (
                  <>
                    <p>{fieldCheckOutEvent.time}</p>
                    <p>
                      {loadingFieldCheckOut
                        ? 'Memuat...'
                        : locationFieldCheckOut}
                    </p>
                    {fieldCheckOutEvent.image ? (
                      <img
                        src={`${import.meta.env.VITE_IMAGE_URL}/${
                          fieldCheckOutEvent.image
                        }`}
                        alt="Image"
                        className="mt-2 w-36 h-36 object-cover rounded-md"
                      />
                    ) : (
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png"
                        alt="No image"
                        className="mt-2 w-36 h-36 object-cover rounded-md"
                      />
                    )}
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
            <CardTitle>Check out</CardTitle>
          </CardHeader>
          <CardContent>
            {checkOutEvent ? (
              <>
                <p>{checkOutEvent.time}</p>

                <p>
                  {haversineDistance(
                    checkOutEvent.location[0],
                    checkOutEvent.location[1],
                  ).toFixed(0)}{' '}
                  m dari kantor
                </p>
                {checkOutEvent.image ? (
                  <img
                    src={`${import.meta.env.VITE_IMAGE_URL}/${
                      checkOutEvent.image
                    }`}
                    alt="Image"
                    className="mt-2 w-36 h-36 object-cover rounded-md"
                  />
                ) : (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png"
                    alt="No image"
                    className="mt-2 w-36 h-36 object-cover rounded-md"
                  />
                )}
              </>
            ) : (
              <p>-</p>
            )}
          </CardContent>
        </Card>
      </div>

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
              !(cameraStatus === 'granted' && locationStatus === 'granted') ||
              attendanceType === 'Done' ||
              attendanceType === 'Leave' ||
              attendanceType === 'EarlyLeave'
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
          {capturedImage && <img src={capturedImage} />}
          {capturedImage && <Button onClick={onSubmit}>Submit</Button>}
        </DialogContent>
      </Dialog>

      {attendanceType === 'CheckIn' && (
        <div className="mx-auto">
          <Dialog>
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

      {attendanceType !== 'CheckIn' && attendanceType !== 'Done' && (
        <div className="mx-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="min-w-[156px]">
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
    </div>
  );
}
