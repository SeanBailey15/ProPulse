const { push } = require("../config");

/** Sends push notifications to a list of subscriptions.
 *
 * Takes an array of subscription objects and the payload to send with the push notification.
 */
async function sendPushNotification(subscriptions, payload) {
  try {
    const notificationPayload = JSON.stringify(payload);

    subscriptions.forEach((subscription) => {
      push.sendNotification(subscription, notificationPayload);
    });
  } catch (err) {
    return err;
  }
}

module.exports = { sendPushNotification };
