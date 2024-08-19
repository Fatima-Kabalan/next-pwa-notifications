import NotificationClient from "./components/NotificationClient";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-6 gap-4">
      <h1 className="font-bold">Welcome to My PWA</h1>
      <NotificationClient />
    </div>
  );
}
