export interface IInteraktConfig {
  /**
   * Interakt API key. This is already a base64-encoded token issued by Interakt
   * (Settings → Developer Setup → Secret Key). It is used verbatim in the
   * `Authorization: Basic <apiKey>` header — do NOT re-encode it.
   */
  apiKey: string;

  /**
   * Optional default country code (E.164 prefix, e.g. `+91`) used when the
   * recipient number cannot be split and no `countryCode` is provided via
   * `bridgeProviderData`. Defaults to `+91` (India) when omitted.
   */
  defaultCountryCode?: string;
}
