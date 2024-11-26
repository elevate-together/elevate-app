"use client";
import { sendNotification } from "@app/actions";
import { Button } from "@components/ui/button";
import { Bell } from "lucide-react";
import React, { useState } from "react";

const TestNotifyButton = ({
  userId,
  message,
}: {
  userId: string;
  message: string;
}) => {
  const [isLoading, setIsLoading] = useState(false); // Loading state for button
  const [messageState, setMessage] = useState(message); // State to manage message

  async function sendTestNotification() {
    setIsLoading(true);
    try {
      await sendNotification(userId, message);
      setMessage("");
    } catch (error) {
      console.error("Error sending test notification", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={() => sendTestNotification()}
      disabled={isLoading || !messageState}
      variant="ghost"
    >
      {isLoading ? (
        "Sending..."
      ) : (
        <>
          <Bell /> Test Push
        </>
      )}
    </Button>
  );
};

export default TestNotifyButton;
