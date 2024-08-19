self.addEventListener('push', function(event) {
  // Handle the event data safely
  event.waitUntil(
    (async () => {
      try {
        // Ensure event.data is not null and parse JSON
        if (event.data) {
          const data = await event.data.json(); // Use await to handle async JSON parsing
          
          // Ensure data contains the expected fields
          const { title = 'Default Title', body = 'Default body' } = data;
          
          // Show notification
          await self.registration.showNotification(title, {
            body,
            icon: '/icon.png',
          });
        } else {
          console.error('No data available in push event.');
        }
      } catch (error) {
        console.error('Error parsing push event data:', error);
      }
    })()
  );
});
