import { Link, useLocation } from 'react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import { Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';

function formatPathName(segment: string) {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const pathNameMap: Record<string, string> = {
  users: 'Users',
  departments: 'Departments',
  attendance: 'Attendance',
  'field-attendance': 'Field Attendance',
  edit: 'Ubah',
  create: 'Tambah',
};

const fetchNameByType: Record<string, (id: number) => Promise<string>> = {
  users: async (id) => {
    const res = await fetch(`${import.meta.env.VITE_NODE_URL}/users/${id}`);
    const data = await res.json();
    return data.fullName ?? `User ${id}`;
  },
  departments: async (id) => {
    const res = await fetch(
      `${import.meta.env.VITE_NODE_URL}/departments/${id}`,
    );
    const data = await res.json();
    return data.name ?? `Department ${id}`;
  },
};

function useEntityName(type: string, id: number | undefined) {
  const enabled = !!id && !!fetchNameByType[type];
  return useQuery({
    queryKey: ['entityName', type, id],
    queryFn: () => fetchNameByType[type](id!),
    enabled,
  });
}

function BreadcrumbSegment({
  segment,
  prevSegment,
  to,
  isLast,
}: {
  segment: string;
  prevSegment?: string;
  to: string;
  isLast: boolean;
}) {
  const isIdSegment =
    /^\d+$/.test(segment) || /^[0-9a-fA-F-]{36}$/.test(segment);

  const { data: entityName, isLoading } = useEntityName(
    prevSegment ?? '',
    isIdSegment ? Number(segment) : undefined,
  );

  const formattedName =
    entityName ||
    pathNameMap[segment] ||
    formatPathName(segment) ||
    (isLoading ? 'Loading...' : 'Unknown');

  const clickable = !isIdSegment && !isLast;

  return (
    <Fragment key={to}>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        {isLast ? (
          <BreadcrumbPage>{formattedName}</BreadcrumbPage>
        ) : clickable ? (
          <BreadcrumbLink asChild>
            <Link to={to}>{formattedName}</Link>
          </BreadcrumbLink>
        ) : (
          <BreadcrumbPage className="text-muted-foreground">
            {formattedName}
          </BreadcrumbPage>
        )}
      </BreadcrumbItem>
    </Fragment>
  );
}

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathnames.map((segment, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const prevSegment = pathnames[index - 1];

          return (
            <BreadcrumbSegment
              key={to}
              segment={segment}
              prevSegment={prevSegment}
              to={to}
              isLast={isLast}
            />
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
