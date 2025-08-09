"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type TimePickerProps = {
  value: string;
  onChange: (time: string) => void;
};

function parse24To12(time24: string) {
  const [hStr, mStr] = time24.split(":");
  let hour = parseInt(hStr, 10);
  const meridiem = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return { time12: `${hour}:${mStr}`, meridiem };
}

function convert12To24(time12: string, meridiem: string) {
  const [hStr, mStr] = time12.split(":");
  let hour = parseInt(hStr, 10);
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, "0")}:${mStr}`;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const { time12, meridiem } = parse24To12(value);
  const [time, setTime] = useState(time12);
  const [period, setPeriod] = useState(meridiem);

  // Call onChange when user updates time or period
  useEffect(() => {
    const new24 = convert12To24(time, period);
    onChange(new24);
  }, [time, period, onChange]);

  return (
    <div className="flex items-center gap-2">
      <Select value={time} onValueChange={setTime}>
        <SelectTrigger className="min-w-[100px] max-w-[100px]">
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent className="max-h-[250px] overflow-auto">
          {Array.from({ length: 12 }, (_, i) => i + 1).flatMap((hour) =>
            [0, 15, 30, 45].map((minute) => {
              const mStr = minute.toString().padStart(2, "0");
              const timeStr = `${hour}:${mStr}`;
              return (
                <SelectItem key={timeStr} value={timeStr}>
                  {timeStr}
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>

      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger className="min-w-[100px] max-w-[100px]">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
