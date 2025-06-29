export const validateSubscription = (sub) => {
    return sub && sub.endpoint && sub.keys?.auth && sub.keys?.p256dh;
  };
  
  export const validatePushPayload = ({ title, body }) => {
    return typeof title === 'string' && typeof body === 'string';
  };
  
  
  // .env.example
  VAPID_PUBLIC_KEY=your_public_key_here
  VAPID_PRIVATE_KEY=your_private_key_here
  
  
  // push.rest
  ### Subscribe user
  POST http://localhost:5000/api/push/subscribe
  Authorization: Bearer {{token}}
  Content-Type: application/json
  
  {
    "endpoint": "https://fcm.googleapis.com/fcm/send/example",
    "keys": {
      "auth": "random_auth_token",
      "p256dh": "random_p256dh_key"
    }
  }
  
  ### Unsubscribe user
  DELETE http://localhost:5000/api/push/unsubscribe
  Authorization: Bearer {{token}}
  Content-Type: application/json
  
  {
    "endpoint": "https://fcm.googleapis.com/fcm/send/example"
  }
  
  ### Send notification
  POST http://localhost:5000/api/push/push
  Authorization: Bearer {{token}}
  Content-Type: application/json
  
  {
    "title": "Hello",
    "body": "This is a test push notification"
  }