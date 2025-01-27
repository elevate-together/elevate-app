"use client";

import { getAllPrayerGroups } from "@/services/prayer-group";
import { PrayerGroup } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Create() {
  const [groups, setGroups] = useState<PrayerGroup[]>([]);

  // Fetch the users when the component mounts or updates
  useEffect(() => {
    const fetchGroups = async () => {
      const { prayerGroups } = await getAllPrayerGroups();
      setGroups(prayerGroups || []);
    };
    fetchGroups();
  }, []);

  return (
    <div className="flex flex-col justify-items-center min-h-screen p-2 pb-20 gap-4">
      <h2 className="text-lg font-semibold">All Groups</h2>
      {groups && groups.length > 0 ? (
        groups.map((group) => (
          <div key={group.id}>
            <Link href={`/groups/${group.id}`}>{group.name}</Link>
          </div>
        ))
      ) : (
        <div>No groups found</div>
      )}
    </div>
  );
}
