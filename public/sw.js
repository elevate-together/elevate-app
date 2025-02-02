self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    console.log(data);
    const options = {
      body: data.body,
      icon: data.icon || "/icon.png",
      badge: "/badge.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(
      self.registration.showNotification("Someone Prayed For You!", options)
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  event.notification.close();
  event.waitUntil(clients.openWindow("https://www.elevatetogether.life"));
});
