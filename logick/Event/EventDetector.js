const Events = require('./Events');

const envelopeStatuses = require('./Statuses').envelopeStatuses;
const coinStatuses = require('./Statuses').coinStatuses;
const printerStatuses = require('./Statuses').printerStatuses;
const lastPrinting = require('./Statuses').lastPrinting;

const FIRST_ENVELOPE = 0;
const SECOND_ENVELOPE = 1;
const THIRD_ENVELOPE = 2;
const FOURTH_ENVELOPE = 3;

class EventDetector {
  constructor(monitoringBody, device, deviceEvents) {
    this.eventsToSend = [];
    this.device = device;
    this.coinStatus = monitoringBody.coinStatus;
    this.printerStatus = monitoringBody.printerStatus;
    this.lastPrinting = monitoringBody.lastPrinting;
    this.envelopeModuleStatus = monitoringBody.envelopeModuleStatus;
    this.deviceEvents = deviceEvents;
  }

  getEvents() {
    return this.eventsToSend;
  }

  /**
   * Определение наступления событий и добавление их в массив для рассылки
   */
  async detect() {
    await new Promise((resolve, reject) => {
      Events.map(async event => {
        if (this[event.detectMethod]()) {
          const deviceEvents = await this.deviceEvents.find({
            where: { deviceId: this.device.id, eventId: event.eventId },
          });

          if (!deviceEvents) {
            this.eventsToSend.push(event);
            const deviceEvents = new this.deviceEvents({
              deviceId: this.device.id,
              eventId: event.eventId,
            });
            deviceEvents.save();
          }
        } else {
          const deviceEvents = await this.deviceEvents.find({
            where: { deviceId: this.device.id, eventId: event.eventId },
          });
          if (deviceEvents) {
            deviceEvents.destroy();
          }
        }
        if (event.eventId === 11) {
          resolve('OK');
        }
      });
    }).then(() => {
      console.log(this.eventsToSend);
    });
  }

  // Конверты

  /**
   * Отсутсвуют все конверты
   */
  isAllEnvelopesAbsent() {
    return (
      this.envelopeModuleStatus[FIRST_ENVELOPE].statusId ===
        envelopeStatuses.ENVELOPE_EMPTY &&
      this.envelopeModuleStatus[SECOND_ENVELOPE].statusId ===
        envelopeStatuses.ENVELOPE_EMPTY &&
      this.envelopeModuleStatus[THIRD_ENVELOPE].statusId ===
        envelopeStatuses.ENVELOPE_EMPTY &&
      this.envelopeModuleStatus[FOURTH_ENVELOPE].statusId ===
        envelopeStatuses.ENVELOPE_EMPTY
    );
  }

  /**
   * Ошибка толкателя
   */
  isPusherError() {
    return this.checkIfEnvelopeModuleHasError(envelopeStatuses.PUSHER_ERROR);
  }

  /**
   * Ошибка заднего концевика
   */
  isRearLimitSwitchError() {
    return this.checkIfEnvelopeModuleHasError(
      envelopeStatuses.REAR_LIMIT_SWITCH_ERROR
    );
  }

  /**
   * Ошибка при выдаче конверта
   */
  IsEnvelopeIssueError() {
    return this.checkIfEnvelopeModuleHasError(
      envelopeStatuses.ENVELOPE_ISSUE_ERROR
    );
  }

  /**
   * Проверка на наличее ошибки хотя бы в одном канале конвертов
   * @param {number} error - номер ошибки
   */
  checkIfEnvelopeModuleHasError(error) {
    return (
      this.envelopeModuleStatus[FIRST_ENVELOPE].statusId === error ||
      this.envelopeModuleStatus[SECOND_ENVELOPE].statusId === error ||
      this.envelopeModuleStatus[THIRD_ENVELOPE].statusId === error ||
      this.envelopeModuleStatus[FOURTH_ENVELOPE].statusId === error
    );
  }

  //----------------------

  // Монеты

  /**
   * Проверка на отсутсвие монет
   */
  isCoinsAbsent() {
    return this.coinStatus === coinStatuses.COINS_ABSENT;
  }

  //-----------------------

  // Принтер

  /**
   * Проверка на глобальную ошибку принтера
   */
  isPrinterGlobalError() {
    return this.printerStatus === printerStatuses.GLOBAL_ERROR;
  }

  /**
   * Проверка на ошибку бумаги
   */
  isPrinterPaperError() {
    return this.printerStatus === printerStatuses.PAPER_ERROR;
  }

  /**
   * Проверка на отсутсвие бумаги
   */
  isPrinterNoPaperError() {
    return this.printerStatus === printerStatuses.NO_PAPER_ERROR;
  }

  //---------------------

  /**
   * Последняя печать была с ошибкой
   */
  isLastPrintingError() {
    return (this.lastPrinting === lastPrinting);
  }

  isDeviceConnectionLost() {
    return false;
  }

  IsDeviceConnectionRestored() {
    return false;
  }
}

module.exports = EventDetector;
