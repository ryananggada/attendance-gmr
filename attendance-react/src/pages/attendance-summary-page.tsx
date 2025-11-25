import { Datepicker } from '@/components/date-picker';
import { MonthYearPicker } from '@/components/month-year-picker';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { haversineDistance } from '@/lib/distance';
import { getAttendances } from '@/services/attendance-service';
import { reverseGeocode } from '@/services/geolocation-service';
import { useQueries, useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

type AttendanceRowData = {
  user: { fullName: string };
  attendance: {
    id: number;
    date: string;
  };
  checkEvent: [
    { type: string; time: string; location: [number, number]; image: string },
  ];
};

function useAttendanceRows(
  filteredAttendances: AttendanceRowData[],
  activeTypeTab: string,
) {
  const baseRows = useMemo(() => {
    return filteredAttendances.map((a) => {
      const events = Array.isArray(a.checkEvent) ? a.checkEvent : [];
      const event = events.find((ev) => ev.type === activeTypeTab);

      const location = event?.location;

      return {
        id: a.attendance.id,
        name: a.user?.fullName ?? 'Unknown',
        date: new Date(a.attendance.date).toLocaleDateString('id-ID'),
        time: event?.time ?? '-',
        location,
        distance: location
          ? haversineDistance(location[0], location[1]).toFixed(0)
          : '-',
        image: event?.image
          ? `${import.meta.env.VITE_IMAGE_URL}/${event.image}`
          : 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png',
      };
    });
  }, [filteredAttendances, activeTypeTab]);

  const geocodeQueries = useQueries({
    queries: baseRows.map((row) => ({
      queryKey: ['reverse-geocode', row.location],
      queryFn: () =>
        row.location ? reverseGeocode(row.location[0], row.location[1]) : null,
      enabled: !!row.location,
    })),
  });

  return baseRows.map((row, idx) => ({
    ...row,
    locationName: geocodeQueries[idx]?.data ?? '-',
  }));
}

export default function AttendanceSummaryPage() {
  const [date, setDate] = useState(new Date());
  const [monthDate, setMonthDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [activeDateTab, setActiveDateTab] = useState<'day' | 'month'>('day');

  const [activeTypeTab, setActiveTypeTab] = useState<
    'CheckIn' | 'FieldCheckIn' | 'FieldCheckOut' | 'CheckOut'
  >('CheckIn');

  const { data: attendances } = useQuery({
    queryKey: ['attendances', date, monthDate, activeDateTab],
    queryFn: () =>
      getAttendances(
        activeDateTab,
        activeDateTab === 'day'
          ? date.toISOString().split('T')[0]
          : `${monthDate.year}-${String(monthDate.month).padStart(2, '0')}`,
      ),
  });

  const columns = useMemo<ColumnDef<AttendanceRowData>[]>(() => {
    const base = [
      {
        accessorKey: 'name',
        header: 'Nama',
      },
      {
        accessorKey: 'time',
        header: 'Waktu',
      },
    ];

    if (activeDateTab === 'month') {
      base.splice(1, 0, {
        accessorKey: 'date',
        header: 'Tanggal',
      });
    }

    base.push(
      activeTypeTab.includes('Field')
        ? { accessorKey: 'locationName', header: 'Lokasi' }
        : { accessorKey: 'distance', header: 'Jarak dari Kantor (m)' },
    );

    base.push({
      accessorKey: 'image',
      header: 'Foto',
      cell: ({ row }) => {
        const image = row.getValue('image');

        return (
          <img
            src={`${import.meta.env.VITE_IMAGE_URL}/${image}`}
            alt="Image"
            className="mt-2 w-36 h-36 object-cover rounded-md"
          />
        );
      },
    });

    return base;
  }, [activeDateTab, activeTypeTab]);

  const filteredAttendances = useMemo(() => {
    if (!attendances) return [];

    return attendances.filter((a: { checkEvent: unknown }) => {
      const events = Array.isArray(a.checkEvent) ? a.checkEvent : [];

      return events.some((ev: { type: string }) => ev.type === activeTypeTab);
    });
  }, [attendances, activeTypeTab]);

  const rows = useAttendanceRows(filteredAttendances, activeTypeTab);

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

      <Tabs
        value={activeTypeTab}
        onValueChange={(val) => setActiveTypeTab(val as typeof activeTypeTab)}
      >
        <TabsList>
          <TabsTrigger value="CheckIn">Check in</TabsTrigger>
          <TabsTrigger value="FieldCheckIn">Lapangan Check in</TabsTrigger>
          <TabsTrigger value="FieldCheckOut">Lapangan Check out</TabsTrigger>
          <TabsTrigger value="CheckOut">Check out</TabsTrigger>
        </TabsList>

        <TabsContent key={activeTypeTab} value={activeTypeTab}>
          <DataTable columns={columns} data={rows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
