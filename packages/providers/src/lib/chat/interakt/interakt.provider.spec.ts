import { ENDPOINT_TYPES, IChatOptions } from '@novu/stateless';
import { nanoid } from 'nanoid';
import { expect, test } from 'vitest';
import { axiosSpy } from '../../../utils/test/spy-axios';
import { InteraktProvider } from './interakt.provider';

const mockConfig = {
  apiKey: 'base64-interakt-secret-key',
};

const buildResponse = (id: string) => ({
  data: {
    result: true,
    message: 'message accepted',
    id,
  },
});

const baseUrl = 'https://api.interakt.ai/v1/public/message/';

function expectedHeaders(apiKey: string) {
  return {
    headers: {
      Authorization: `Basic ${apiKey}`,
      'Content-Type': 'application/json',
    },
  };
}

test('should send a template message and split the E.164 number (default +91)', async () => {
  const messageId = nanoid();
  const { mockPost, axiosMockSpy } = axiosSpy(buildResponse(messageId));

  const provider = new InteraktProvider(mockConfig);

  const options: IChatOptions = {
    content: 'ignored when a template is present',
    channelData: {
      identifier: '-',
      type: ENDPOINT_TYPES.PHONE,
      endpoint: { phoneNumber: '+919946424245' },
    },
    customData: {
      templateName: 'booking_confirmation',
      languageCode: 'en',
      headerValues: [],
      bodyValues: ['John Doe', 'example-id-082678', '2026-06-12'],
    },
  };

  const res = await provider.sendMessage(options);

  expect(mockPost).toHaveBeenCalledWith(baseUrl, {
    countryCode: '+91',
    phoneNumber: '9946424245',
    type: 'Template',
    template: {
      name: 'booking_confirmation',
      languageCode: 'en',
      headerValues: [],
      bodyValues: ['John Doe', 'example-id-082678', '2026-06-12'],
    },
  });

  expect(axiosMockSpy).toHaveBeenCalledWith(expectedHeaders(mockConfig.apiKey));

  expect(res.id).toBe(messageId);
  expect(typeof res.date).toBe('string');
});

test('should honor a countryCode override from bridgeProviderData', async () => {
  const messageId = nanoid();
  const { mockPost } = axiosSpy(buildResponse(messageId));

  const provider = new InteraktProvider(mockConfig);

  const options: IChatOptions = {
    content: '-',
    channelData: {
      identifier: '-',
      type: ENDPOINT_TYPES.PHONE,
      endpoint: { phoneNumber: '+14155550123' },
    },
    customData: {
      templateName: 'welcome',
    },
  };

  await provider.sendMessage(options, { countryCode: '+1' });

  expect(mockPost).toHaveBeenCalledWith(baseUrl, {
    countryCode: '+1',
    phoneNumber: '4155550123',
    type: 'Template',
    template: {
      name: 'welcome',
      languageCode: 'en',
      headerValues: [],
      bodyValues: [],
    },
  });
});

test('should throw when no template name is provided', async () => {
  axiosSpy(buildResponse(nanoid()));

  const provider = new InteraktProvider(mockConfig);

  const options: IChatOptions = {
    content: 'free-form text is not supported',
    channelData: {
      identifier: '-',
      type: ENDPOINT_TYPES.PHONE,
      endpoint: { phoneNumber: '+919946424245' },
    },
  };

  await expect(provider.sendMessage(options)).rejects.toThrow(/template/i);
});

test('should throw on a non-phone channel data type', async () => {
  axiosSpy(buildResponse(nanoid()));

  const provider = new InteraktProvider(mockConfig);

  const options = {
    content: '-',
    channelData: {
      identifier: '-',
      type: ENDPOINT_TYPES.WEBHOOK,
      endpoint: { url: 'https://example.com/webhook' },
    },
    customData: { templateName: 'welcome' },
  } as unknown as IChatOptions;

  await expect(provider.sendMessage(options)).rejects.toThrow(/Invalid channel data/i);
});
