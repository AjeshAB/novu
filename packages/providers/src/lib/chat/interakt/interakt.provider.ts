import { ChatProviderIdEnum, ENDPOINT_TYPES } from '@novu/shared';
import {
  ChannelTypeEnum,
  IChatOptions,
  IChatProvider,
  ISendMessageSuccessResponse,
  isChannelDataOfType,
} from '@novu/stateless';
import Axios, { AxiosInstance } from 'axios';
import { BaseProvider, CasingEnum } from '../../../base.provider';
import { WithPassthrough } from '../../../utils/types';
import { IInteraktConfig } from './interakt.config';
import {
  IInteraktBridgeData,
  IInteraktCustomData,
  IInteraktSendMessageBody,
  IInteraktSendMessageRes,
} from './interakt.dto';

const DEFAULT_COUNTRY_CODE = '+91';
const DEFAULT_LANGUAGE_CODE = 'en';

export class InteraktProvider extends BaseProvider implements IChatProvider {
  id = ChatProviderIdEnum.Interakt;
  protected casing: CasingEnum = CasingEnum.CAMEL_CASE;
  channelType = ChannelTypeEnum.CHAT as ChannelTypeEnum.CHAT;

  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl = 'https://api.interakt.ai/v1/public/message/';

  constructor(private config: IInteraktConfig) {
    super();
    this.axiosInstance = Axios.create({
      headers: {
        // Interakt API key is already a base64 token — use it verbatim, do NOT re-encode.
        Authorization: `Basic ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async sendMessage(
    options: IChatOptions,
    bridgeProviderData: WithPassthrough<Record<string, unknown>> = {}
  ): Promise<ISendMessageSuccessResponse> {
    // WhatsApp/Interakt is addressed by phone number, not a webhook URL.
    if (!isChannelDataOfType(options.channelData, ENDPOINT_TYPES.PHONE)) {
      throw new Error('Invalid channel data for Interakt provider: a phone endpoint (E.164) is required');
    }

    const customData = (options.customData ?? {}) as Partial<IInteraktCustomData>;

    if (!customData.templateName) {
      throw new Error(
        'Interakt provider requires `customData.templateName`. Outbound WhatsApp messages outside the 24h ' +
          'session window must use an approved template — free-form `content` is not supported by this provider.'
      );
    }

    const { countryCode, phoneNumber } = this.splitRecipient(
      options.channelData.endpoint.phoneNumber,
      (bridgeProviderData as IInteraktBridgeData).countryCode
    );

    const requestBody: IInteraktSendMessageBody = {
      countryCode,
      phoneNumber,
      type: 'Template',
      template: {
        name: customData.templateName,
        languageCode: customData.languageCode ?? DEFAULT_LANGUAGE_CODE,
        headerValues: customData.headerValues ?? [],
        bodyValues: customData.bodyValues ?? [],
      },
    };

    const payload = this.transform(bridgeProviderData, requestBody).body;

    try {
      const { data } = await this.axiosInstance.post<IInteraktSendMessageRes>(this.baseUrl, payload);

      return {
        id: data.id,
        date: new Date().toISOString(),
      };
    } catch (error) {
      // Surface the Interakt response body (or raw error) for debuggability.
      const responseBody = error?.response?.data
        ? JSON.stringify(error.response.data)
        : (error?.message ?? String(error));

      throw new Error(`Interakt message send failed: ${responseBody}`);
    }
  }

  /**
   * Splits an E.164 number (e.g. `+919946424245`) into Interakt's expected
   * `{ countryCode: '+91', phoneNumber: '9946424245' }` shape.
   *
   * The country code is resolved with the following priority:
   *   1. `bridgeProviderData.countryCode` (per-request override)
   *   2. `config.defaultCountryCode`
   *   3. `+91` (India) fallback
   *
   * The national number is obtained by stripping that country code's digits
   * from the front of the supplied number when present.
   */
  private splitRecipient(rawNumber: string, overrideCountryCode?: string): { countryCode: string; phoneNumber: string } {
    const countryCode = overrideCountryCode ?? this.config.defaultCountryCode ?? DEFAULT_COUNTRY_CODE;

    const ccDigits = countryCode.replace(/\D/g, '');
    const numberDigits = (rawNumber ?? '').replace(/\D/g, '');

    const phoneNumber =
      ccDigits && numberDigits.startsWith(ccDigits) ? numberDigits.slice(ccDigits.length) : numberDigits;

    return { countryCode, phoneNumber };
  }
}
