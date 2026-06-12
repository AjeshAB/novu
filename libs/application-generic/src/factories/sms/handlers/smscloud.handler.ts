import { SmscloudSmsProvider } from '@novu/providers';
import { ChannelTypeEnum, ICredentials, SmsProviderIdEnum } from '@novu/shared';
import { BaseSmsHandler } from './base.handler';

export class SmscloudHandler extends BaseSmsHandler {
  constructor() {
    super(SmsProviderIdEnum.Smscloud, ChannelTypeEnum.SMS);
  }

  buildProvider(credentials: ICredentials) {
    this.provider = new SmscloudSmsProvider({
      apiKey: credentials.apiKey,
      user: 'ArppanOnline',
      sender: credentials.from,
      templateId: credentials.templateId,
    });
  }
}
