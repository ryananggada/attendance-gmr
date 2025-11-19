import { Datepicker } from '@/components/date-picker';
import { MonthYearPicker } from '@/components/month-year-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReverseGeocode } from '@/hooks/use-reverse-geocode';
import { haversineDistance } from '@/lib/distance';
import { getAttendances } from '@/services/attendance-service';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

function AttendanceRow({
  a,
  activeTypeTab,
  activeDateTab,
}: {
  a: any;
  activeTypeTab: string;
  activeDateTab: string;
}) {
  const events = Array.isArray(a.checkEvent) ? a.checkEvent : [];
  const event = events.find((ev) => ev.type === activeTypeTab) ?? null;

  const date = new Date(a.attendance.date).toLocaleDateString('id-ID');
  const time = event?.time;
  const location = event?.location;
  const image = event?.image;

  const imageSrc = image
    ? `${import.meta.env.VITE_IMAGE_URL}/${image}`
    : 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png';

  const shouldReverseGeocode = activeTypeTab.includes('Field') && !!location;
  const { data: locationName, isLoading } = useReverseGeocode(
    shouldReverseGeocode ? location?.[0] ?? null : null,
    shouldReverseGeocode ? location?.[1] ?? null : null,
  );

  return (
    <TableRow key={a.attendance.id}>
      <TableCell>{a.user?.fullName ?? 'Unknown'}</TableCell>
      {activeDateTab === 'month' && <TableCell>{date}</TableCell>}
      <TableCell>{time}</TableCell>
      <TableCell className="whitespace-normal break-words max-w-sm">
        {location ? (
          activeTypeTab.includes('Field') ? (
            isLoading ? (
              <span className="text-gray-400 italic">Memuat...</span>
            ) : (
              locationName || 'Gagal memuat lokasi'
            )
          ) : (
            `${haversineDistance(location[0], location[1]).toFixed(
              0,
            )} m dari kantor`
          )
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell>
        <img
          src={imageSrc}
          alt="Attendance"
          className="mt-2 w-36 h-36 object-cover rounded-md"
        />
      </TableCell>
    </TableRow>
  );
}

export default function AttendanceSummaryPage() {
  const [date, setDate] = useState(new Date());
  const [monthDate, setMonthDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [activeDateTab, setActiveDateTab] = useState<'day' | 'month'>('day');

  const [activeTypeTab, setActiveTypeTab] = useState('CheckIn');

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

  const filteredAttendances = useMemo(() => {
    if (!attendances) return [];

    return attendances.filter((a) => {
      const events = Array.isArray(a.checkEvent) ? a.checkEvent : [];

      return events.some((ev) => ev.type === activeTypeTab);
    });
  }, [attendances, activeTypeTab]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Tabs value={activeDateTab} onValueChange={setActiveDateTab}>
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

      <Tabs value={activeTypeTab} onValueChange={setActiveTypeTab}>
        <TabsList>
          <TabsTrigger value="CheckIn">Check in</TabsTrigger>
          <TabsTrigger value="FieldCheckIn">Lapangan Check in</TabsTrigger>
          <TabsTrigger value="FieldCheckOut">Lapangan Check out</TabsTrigger>
          <TabsTrigger value="CheckOut">Check out</TabsTrigger>
        </TabsList>

        <TabsContent key={activeTypeTab} value={activeTypeTab}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                {activeDateTab === 'month' && <TableHead>Tanggal</TableHead>}
                <TableHead>Waktu</TableHead>
                {activeTypeTab.includes('Field') ? (
                  <TableHead>Lokasi</TableHead>
                ) : (
                  <TableHead>Jarak dari Kantor</TableHead>
                )}
                <TableHead>Foto</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAttendances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendances.map((a) => (
                  <AttendanceRow
                    key={a.checkEvent.id}
                    a={a}
                    activeTypeTab={activeTypeTab}
                    activeDateTab={activeDateTab}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
