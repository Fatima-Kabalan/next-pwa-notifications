import { NextRequest, NextResponse } from "next/server";
import webPush from "web-push";

// Set VAPID details
webPush.setVapidDetails(
  `mailto:${process.env.WEB_PUSH_EMAIL}`,
  process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY!,
  process.env.WEB_PUSH_PRIVATE_KEY!
);

interface Subscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function POST(req: NextRequest) {
  try {

    const { subscription, payload } = await req.json();

    // Type-check the subscription object
    if (!subscription || typeof subscription !== 'object') {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    // Send notification
    const notificationPayload = JSON.stringify(payload || {
      title: 'Hello Web Push',
      message: 'Your web push notification is here!'
    });

    await webPush.sendNotification(subscription, notificationPayload);

    // Send response back to the client
    return NextResponse.json({ message: 'Notification sent' }, { status: 200 });
  } catch (err) {
    console.error('Error sending notification:', err);

    // Type-check if error has `statusCode` property
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message || 'Failed to send notification' }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
  }
}

export async function GET() {
  return NextResponse.json({ message: 'GET method not supported' }, { status: 405 });
}
