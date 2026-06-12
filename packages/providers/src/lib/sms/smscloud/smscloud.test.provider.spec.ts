import { SmscloudSmsProvider } from './smscloud.provider';

const mockConfig = {
  apiKey: 'test_auth_key',
  user: 'ArppanOnline',
  sender: 'ARPPAN',
  templateId: '1007xxxxxxxxxx',
};

test('should trigger smscloud provider correctly', async () => {
  const provider = new SmscloudSmsProvider(mockConfig);

  // Mock fetch
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    text: async () => 'MSG_SENT_ID_12345',
  });

  const result = await provider.sendMessage({
    to: '+919876543210',
    content: 'Your OTP is 123456',
  });

  expect(result.id).toBe('MSG_SENT_ID_12345');
  expect(result.date).toBeDefined();
});

test('should strip +91 from number', async () => {
  const provider = new SmscloudSmsProvider(mockConfig);

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    text: async () => 'MSG_SENT_ID_67890',
  });

  await provider.sendMessage({
    to: '+919876543210',
    content: 'Test message',
  });

  // Verify fetch was called with stripped number
  const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
  expect(calledUrl).toContain('mobile=9876543210');
  expect(calledUrl).not.toContain('%2B91'); // encoded +91
});

test('should build correct API URL', async () => {
  const provider = new SmscloudSmsProvider(mockConfig);

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    text: async () => 'OK',
  });

  await provider.sendMessage({
    to: '9876543210',
    content: 'Hello from Arppan',
  });

  const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;

  expect(calledUrl).toContain('https://app.smscloud.in/api/pushsms/');
  expect(calledUrl).toContain('user=ArppanOnline');
  expect(calledUrl).toContain('authkey=test_auth_key');
  expect(calledUrl).toContain('sender=ARPPAN');
  expect(calledUrl).toContain('text=Hello+from+Arppan');
  expect(calledUrl).toContain('rpt=1');
});

test('should handle fetch error gracefully', async () => {
  const provider = new SmscloudSmsProvider(mockConfig);

  global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

  await expect(
    provider.sendMessage({
      to: '9876543210',
      content: 'Test',
    })
  ).rejects.toThrow('Network error');
});
