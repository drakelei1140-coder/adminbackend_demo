export interface Region {
  id: number;
  nameZh: string;
  nameEn: string;
  iso2: string;
  iso3: string;
  numericCode: string;
  iso3166_2: string;
  timezone: {
    standard: string;
    supportsDst: boolean;
    dstNote: string;
  };
  businessEnabled: boolean;
  updatedAt: string;
}

export interface LanguageItem {
  code: string;
  nameZh: string;
  nameEn: string;
  hasPackage: boolean;
  isDefault: boolean;
  isPrimary: boolean;
}

export interface CurrencyItem {
  code: string;
  number: string;
  nameZh: string;
  nameEn: string;
  isDefault: boolean;
  isPrimary: boolean;
}

export interface BusinessFlowConfig {
  businessId: string;
  processId: string;
}

export interface RuleItem {
  id: string;
  name: string;
  remark: string;
}

export interface MccItem {
  code: string;
  nameZh: string;
}

export interface WebhookGroup {
  id: string;
  internalBizId: string;
  internalRemark: string;
  endpointUrl: string;
  scope: string;
  webhookId: string;
  hmacKey: string;
}

export interface OperationUnit {
  id: string;
  rule?: RuleItem;
  mccList: MccItem[];
  merchantAccountId: string;
  apiKey: string;
  balancePlatform: string;
  webhooks: WebhookGroup[];
}

export interface ChannelConfig {
  channel: string;
  service: string;
  units: OperationUnit[];
}

export interface RegionDetailConfig {
  regionId: number;
  basicInfo: {
    nameZh: string;
    nameEn: string;
    iso3166_2: string;
    timezone: {
      standard: string;
      supportsDst: boolean;
      dstNote: string;
    };
  };
  permissions: Record<string, { visible: boolean; editable: boolean }>;
  languages: LanguageItem[];
  currencies: CurrencyItem[];
  businessFlow: BusinessFlowConfig;
  features: string[];
  channelConfig: ChannelConfig;
}
