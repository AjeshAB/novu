import { ChannelTypeEnum, ISendMessageSuccessResponse, ISmsOptions, ISmsProvider } from '@novu/stateless';
import { BaseProvider, CasingEnum } from '../../../base.provider';
import { WithPassthrough } from '../../../utils/types';

export class SmscloudSmsProvider extends BaseProvider implements ISmsProvider {
  id = 'smscloud';
  channelType = ChannelTypeEnum.SMS as ChannelTypeEnum.SMS;
  protected casing: CasingEnum = CasingEnum.CAMEL_CASE;

  constructor(
    private config: {
      apiKey: string;
      user: string;
      sender: string;
      templateId?: string;
    }
  ) {
    super();
  }

  async sendMessage(
    options: ISmsOptions,
    bridgeProviderData: WithPassthrough<Record<string, unknown>> = {}
  ): Promise<ISendMessageSuccessResponse> {

    const templateId = (bridgeProviderData?.templateId as string) || options.customData?.templateId || this.config.templateId || '';

    const params = new URLSearchParams({
      user: this.config.user,
      authkey: this.config.apiKey,
      sender: this.config.sender,
      mobile: options.to,
      text: options.content,
      templateid: templateId,
      rpt: '1',
    });

    const url = `https://app.smscloud.in/api/pushsms/?${params.toString()}`;

    const res = await fetch(url);
    const responseText = await res.text();

    return {
      id: responseText,
      date: new Date().toISOString(),
    };
  }
}
