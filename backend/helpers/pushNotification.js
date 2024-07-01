const { push } = require("../config");
const { BadRequestError } = require("../expressError");

/** Sends push notifications to a list of subscriptions.
 *
 * Takes an array of subscription objects and the payload to send with the push notification.
 *
 * Throws BadRequestError if the user is not subscribed.
 */
async function sendPushNotification(subscriptions, payload) {
  try {
    if (!subscriptions.length)
      throw new BadRequestError("This user is not subscribed");

    const notificationPayload = JSON.stringify(payload);

    subscriptions.forEach((subscription) => {
      push.sendNotification(subscription, notificationPayload);
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { sendPushNotification };
