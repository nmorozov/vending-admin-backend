const envelopeStatuses = {
  ENVELOPE_EMPTY: 3,
  PUSHER_ERROR: 4,
  REAR_LIMIT_SWITCH_ERROR: 5,
  ENVELOPE_ISSUE_ERROR: 6,
};

const coinStatuses = {
    COINS_ABSENT: 1
};

const printerStatuses = {
    GLOBAL_ERROR: 6,
    PAPER_ERROR: 4,
    NO_PAPER_ERROR: 5,
};

const lastPrinting = 1;

module.exports = { envelopeStatuses, coinStatuses, printerStatuses, lastPrinting };
