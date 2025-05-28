"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getTimezoneOffset } from "date-fns-tz";
import { getLocalTimeAndMeridiem } from "@/lib/utils";

type TimePickerProps = {
  value: string; // UTC time "HH:mm"
  onChange: (time: string) => void;
  initialTimeZone?: string;
};

const now = new Date();
const offsetPacific = getTimezoneOffset("America/Los_Angeles", now) / 3600000;
const offsetMountain = getTimezoneOffset("America/Denver", now) / 3600000;
const offsetCentral = getTimezoneOffset("America/Chicago", now) / 3600000;
const offsetEastern = getTimezoneOffset("America/New_York", now) / 3600000;

const TIMEZONES = [
  { label: "Pacific", value: "America/Los_Angeles", offset: offsetPacific },
  { label: "Mountain", value: "America/Denver", offset: offsetMountain },
  { label: "Central", value: "America/Chicago", offset: offsetCentral },
  { label: "Eastern", value: "America/New_York", offset: offsetEastern },
];

export function TimePicker({
  value,
  onChange,
  initialTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
}: TimePickerProps) {
  initialTimeZone = TIMEZONES.some((tz) => tz.value === initialTimeZone)
    ? initialTimeZone
    : "America/Chicago";

  const [timezone, setTimezone] = useState(initialTimeZone);
  const [offset, setOffset] = useState(
    TIMEZONES.find((tz) => tz.value === initialTimeZone)?.offset ?? -5
  );

  // Initialize localTime and meridiem based on value and offset
  const initial = getLocalTimeAndMeridiem(value, offset);
  const [localTime, setLocalTime] = useState(initial.time);
  const [meridiem, setMeridiem] = useState(initial.meridiem);

  useEffect(() => {
    // Recalculate offset when timezone changes
    const newOffset =
      TIMEZONES.find((tz) => tz.value === timezone)?.offset ?? -5;
    setOffset(newOffset);
  }, [timezone]);

  useEffect(() => {
    // Update local time and meridiem when value or offset changes
    const { time, meridiem } = getLocalTimeAndMeridiem(value, offset);
    setLocalTime(time);
    setMeridiem(meridiem);
  }, [value, offset]);

  const updateTime = (newTime: string, newMeridiem: "AM" | "PM") => {
    setLocalTime(newTime);
    setMeridiem(newMeridiem);

    const [hourStr, minuteStr] = newTime.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (newMeridiem === "PM" && hour !== 12) hour += 12;
    if (newMeridiem === "AM" && hour === 12) hour = 0;

    hour -= offset;
    if (hour >= 24) hour -= 24;
    if (hour < 0) hour += 24;

    const newUtc = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
    onChange(newUtc);
  };

  const handleZoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Time select */}
      <Select value={localTime} onValueChange={(t) => updateTime(t, meridiem)}>
        <SelectTrigger className="min-w-[90px] max-w-[90px]">
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, h) => h + 1).map((h) =>
            [0, 15, 30, 45].map((m) => {
              const timeStr = `${h.toString().padStart(2, "0")}:${m
                .toString()
                .padStart(2, "0")}`;
              return (
                <SelectItem key={timeStr} value={timeStr}>
                  {timeStr.replace(/^0/, "")}
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>

      {/* AM/PM select */}
      <Select
        value={meridiem}
        onValueChange={(m) => updateTime(localTime, m as "AM" | "PM")}
      >
        <SelectTrigger className="min-w-[70px] max-w-[70px]">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>

      {/* Timezone select */}
      <Select value={timezone} onValueChange={handleZoneChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIMEZONES.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
