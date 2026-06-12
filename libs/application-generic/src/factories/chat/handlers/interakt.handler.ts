import { InteraktProvider } from '@novu/providers';
import { ChannelTypeEnum, ChatProviderIdEnum, ICredentials } from '@novu/shared';
import { BaseChatHandler } from './base.handler';

export class InteraktHandler extends BaseChatHandler {
  constructor() {
    super(ChatProviderIdEnum.Interakt, ChannelTypeEnum.CHAT);
  }

  buildProvider(credentials: ICredentials) {
    this.provider = new InteraktProvider({
      apiKey: credentials.apiKey,
    });
  }
}
