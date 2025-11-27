import { Datepicker } from '@/components/date-picker';
import { MonthYearPicker } from '@/components/month-year-picker';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReverseGeocode } from '@/hooks/use-reverse-geocode';
import { haversineDistance } from '@/lib/distance';
import { getAttendances } from '@/services/attendance-service';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';

type EventDetail = {
  type: string;
  time: string;
  location: [number, number];
  image: string;
}

type RawAttendanceData = {
  user: { fullName: string };
  attendance: {
    id: number;
    date: string;
  };
  checkEvent: [
    { type: string; time: string; location: [number, number]; image: string },
  ];
};

type AttendanceRow = {
  id: number;
  name: string;
  date: string;
  events: {
    CheckIn?: EventDetail;
    FieldCheckIn?: EventDetail;
    FieldCheckOut?: EventDetail;
    CheckOut?: EventDetail;
  }
}

export default function AttendanceSummaryPage() {
  const [date, setDate] = useState(new Date());
  const [monthDate, setMonthDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [activeDateTab, setActiveDateTab] = useState<'day' | 'month'>('day');
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);

  const { data: attendances } = useQuery({
    queryKey: ['attendances', date, monthDate, activeDateTab],
    queryFn: () => getAttendances(
       activeDateTab,
        activeDateTab === 'day'
          ? format(date, 'yyyy-MM-dd')
          : `${monthDate.year}-${String(monthDate.month).padStart(2, '0')}`,
    )
  });

  const { data: location } = useReverseGeocode(
    selectedEvent?.location?.[0] ?? null,
    selectedEvent?.location?.[1] ?? null
  );

  const columns = useMemo<ColumnDef<AttendanceRow>[]>(() => {
    const base: ColumnDef<AttendanceRow>[] = [
      {
        header: "Nama",
        accessorKey: "name",
      },
      {
        header: "Check In",
        cell: ({ row }) => {
          const event = row.original.events.CheckIn;
          return (
            <Button
              className='p-0 text-black'
              variant='link'
              disabled={!event}
              onClick={() => setSelectedEvent(event ?? null)}
            >
              {event ? event.time : "-"}
            </Button>
          );
        },
      },
      {
        header: "Field",
        cell: ({ row }) => {
          const event = row.original.events.FieldCheckIn;
          return (
            <Button
              className='p-0 text-black'
              variant='link'
              disabled={!event}
              onClick={() => setSelectedEvent(event ?? null)}
            >
              {event ? event.time : "-"}
            </Button>
          );
        },
      },
      {
        header: "Return",
        cell: ({ row }) => {
          const event = row.original.events.FieldCheckOut;
          return (
            <Button
              className='p-0 text-black'
              variant='link'
              disabled={!event}
              onClick={() => setSelectedEvent(event ?? null)}
            >
              {event ? event.time : "-"}
            </Button>
          );
        },
      },
      {
        header: "Check Out",
        cell: ({ row }) => {
          const event = row.original.events.CheckOut;
          return (
            <Button
              className='p-0 text-black'
              variant='link'
              disabled={!event}
              onClick={() => setSelectedEvent(event ?? null)}
            >
              {event ? event.time : "-"}
            </Button>
          );
        },
      },
    ];

    if (activeDateTab === 'month') {
      base.splice(1, 0, {
        accessorKey: "date",
        header: "Tanggal",
        cell: ({ row }) => {
          const date = row.original.date;
          return format(new Date(date), "dd/MM/yyyy")
        }
      });
    }

    return base;
  }, [activeDateTab]);

  const rows = useMemo(() => {
    if (!attendances) return [];

    return attendances.map((a: RawAttendanceData) => {
      const events = {
        CheckIn: a.checkEvent.find((e: EventDetail) => e.type === 'CheckIn'),
        FieldCheckIn: a.checkEvent.find((e: EventDetail) => e.type === 'FieldCheckIn'),
        FieldCheckOut: a.checkEvent.find((e: EventDetail) => e.type === 'FieldCheckOut'),
        CheckOut: a.checkEvent.find((e: EventDetail) => e.type === 'CheckOut'),
      };

      return {
        id: a.attendance.id,
        name: a.user.fullName,
        date: a.attendance.date,
        events,
      }
    });
  }, [attendances]);

  const renderDialogTitle = (type: string) => {
    switch (type) {
      case 'CheckIn':
        return 'Check In';
      case 'FieldCheckIn':
        return 'Field';
      case 'FieldCheckOut':
        return 'Return';
      case 'CheckOut':
        return 'Check Out';
      default:
        return '-';  
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Tabs
        value={activeDateTab}
        onValueChange={(val) => setActiveDateTab(val as typeof activeDateTab)}
      >
        <TabsList>
          <TabsTrigger value="day">Harian</TabsTrigger>
          <TabsTrigger value="month">Bulanan</TabsTrigger>
        </TabsList>

        <TabsContent value="day">
          <Datepicker label="Tanggal" value={date} onChange={setDate} />
        </TabsContent>

        <TabsContent value="month">
          <MonthYearPicker value={monthDate} onChange={setMonthDate} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent>
            <DialogTitle>
              {renderDialogTitle(selectedEvent.type)}
            </DialogTitle>

            <DialogDescription asChild>
              <div className='!text-black space-y-4'>
                <p>
                  <strong>Waktu:</strong> {selectedEvent.time}
                </p>
                
                {['FieldCheckIn', 'FieldCheckOut'].includes(selectedEvent.type) ? (
                  <p>
                    <strong>Lokasi:</strong> {location ?? '-'}
                  </p>
                ): (
                  <p>
                    <strong>Jarak dari kantor:</strong> {haversineDistance(selectedEvent?.location?.[0], selectedEvent?.location?.[1]).toFixed(0)} m
                  </p>
                )}   

                <img
                  src={`${import.meta.env.VITE_IMAGE_URL}/${selectedEvent.image}`}
                  className="w-full aspect-3/4 object-cover rounded"
                />
              </div>
            </DialogDescription>
          </DialogContent>
        )}
      </Dialog>

      <DataTable columns={columns} data={rows} />
    </div>
  );
}
