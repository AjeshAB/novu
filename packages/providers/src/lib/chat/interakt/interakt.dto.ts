/**
 * Shape of `options.customData` expected by the Interakt provider.
 *
 * Populated from the workflow trigger payload, e.g.:
 *
 *   await novu.trigger({
 *     workflowId: 'arpan-booking-whatsapp',
 *     to: { subscriberId, phone: '+919946424245' },
 *     payload: {
 *       customData: {
 *         templateName: 'booking_confirmation',
 *         languageCode: 'en',
 *         headerValues: [],
 *         bodyValues: ['John Doe', 'example-id-082678', '2026-06-12'],
 *       },
 *     },
 *   });
 */
export interface IInteraktCustomData {
  /** Name of the approved WhatsApp template to send. Required. */
  templateName: string;
  /** Template language code. Defaults to `en`. */
  languageCode?: string;
  /** Ordered values substituted into the template header placeholders. */
  headerValues?: string[];
  /** Ordered values substituted into the template body placeholders. */
  bodyValues?: string[];
}

/** Per-request overrides passed through `bridgeProviderData`. */
export interface IInteraktBridgeData {
  /** E.164 country-code prefix (e.g. `+91`) for the recipient. */
  countryCode?: string;
}

/** Request body sent to `POST https://api.interakt.ai/v1/public/message/`. */
export interface IInteraktSendMessageBody {
  countryCode: string;
  phoneNumber: string;
  type: 'Template';
  template: {
    name: string;
    languageCode: string;
    headerValues: string[];
    bodyValues: string[];
  };
}

/**
 * Success response from Interakt's message API.
 * Example: `{ "result": true, "message": "...", "id": "<message-id>" }`
 */
export interface IInteraktSendMessageRes {
  result: boolean;
  message?: string;
  id: string;
}
