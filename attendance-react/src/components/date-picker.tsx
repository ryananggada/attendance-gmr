'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatepickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  label?: string;
  id?: string;
  className?: string;
}

export function Datepicker({
  value,
  onChange,
  label = 'Tanggal',
  id = 'date',
  className = 'w-48',
}: DatepickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date) => {
    onChange?.(selectedDate);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <Label htmlFor={id} className="px-1">
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            className={`${className} justify-between font-normal`}
          >
            {value ? value.toLocaleDateString('id-ID') : 'Select date'}
            <CalendarIcon />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            onSelect={handleSelect}
            required
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
