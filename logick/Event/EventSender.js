const send = require('gmail-send')({});

/**
 * Class for send mails
 */
class EventSender {
  /**
   * @param {object} monitoringBody - информация о мониторинге с аппарата
   */
  constructor(eventsToSend, recipients, device) {
    this.device = device;
    this.recipients = recipients;
    this.eventsToSend = eventsToSend;
  }

  formateRecipients() {
    const recipients = [];
    this.recipients.map(recipient => recipients.push(recipient.email));

    return recipients;
  }

  formateEmailBody(device, event) {
    return `аппарат №${device.externalId}
место усановки: ${device.placementAddress}
сработало событие № ${event.eventId}  - ${event.eventName}
рекомендации по устранению причин возникновения события:  ${event.eventBody}`;
  }

  async send() {
    if (this.eventsToSend.length < 1) {
      return false;
    }

    let result = false;

    this.eventsToSend.map(async event => {
      await new Promise((resolve, reject) => {
        const objectData = {
          user: 'adm.checkincoin@gmail.com',
          pass: 'qwerty-123',
          to: this.formateRecipients(),
          subject: `Аппарат №${this.device.externalId}, сработало событие ${
            event.eventName
          }`,
          text: this.formateEmailBody(this.device, event),
        };

        send(objectData, function(err, res) {
          if (err) {
            console.log(err);
            reject('ERROR');
          } else {
            resolve('OK');
          }
        });
      })
        .then(() => {
          result = !result;
        })
    });

    return result;
  }
}

module.exports = EventSender;
