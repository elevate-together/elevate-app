"use client";

import { User } from "@prisma/client";
import { useEffect, useState } from "react";

import { PrayerGroupWithOwner } from "@/lib/utils";
import { getPrayerGroupById } from "@/services/prayer-group";
import { getUsersInPrayerGroup } from "@/services/user-prayer-group";
import React from "react";

export default function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [prayerGroup, setPrayerGroup] = useState<PrayerGroupWithOwner>();
  const [message, setMessage] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);

  const { id } = React.use(params);

  useEffect(() => {
    if (id) {
      const fetchPrayerGroup = async () => {
        const { prayerGroup } = await getPrayerGroupById(id);

        if (prayerGroup) {
          setPrayerGroup(prayerGroup);
        } else {
          setMessage("Group not found");
        }
      };

      fetchPrayerGroup();
    }
  }, [id]);

  useEffect(() => {
    if (prayerGroup) {
      const fetchUsers = async () => {
        const result = await getUsersInPrayerGroup(prayerGroup.id);

        if (result.success) {
          setUsers(result.users || []);
        } else {
          setMessage(result.message);
        }
      };

      fetchUsers();
    }
  }, [prayerGroup]);

  if (!prayerGroup) {
    return (
      <div>
        <p>{message || "Loading group..."}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>{prayerGroup.name}</h2>
      {message && <p>{message}</p>}
      <div>Owner: {prayerGroup.owner?.name || "No owner"}</div>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
