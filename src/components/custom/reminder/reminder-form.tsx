"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addReminder } from "@/services/reminder";

export default function ReminderForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [time, setTime] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setResponseMessage("");

    const result = await addReminder({
      userId,
      title,
      message,
      frequency,
      time,
      dayOfWeek,
    });

    setResponseMessage(result.message);
    setLoading(false);

    if (result.success) {
      // Optionally reset form
      setTitle("");
      setMessage("");
      setTime("");
      setDayOfWeek("");
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Input
        placeholder="Time (HH:mm)"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <select
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
        className="border p-2 rounded-md"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>

      {frequency === "weekly" && (
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value)}
          className="border p-2 rounded-md"
        >
          <option value="">Select Day</option>
          <option value="0">Sunday</option>
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
          <option value="6">Saturday</option>
        </select>
      )}

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Create Reminder"}
      </Button>

      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
}
