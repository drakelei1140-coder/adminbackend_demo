import type { MccItem, Region, RegionDetailConfig, RuleItem } from '../types';

const now = () => new Date().toISOString();

export const regionsSeed: Region[] = [
  [1, '中国香港', 'Hong Kong', 'HK', 'HKG', '344', 'HK-HK'],
  [2, '英国', 'United Kingdom', 'UK', 'GBR', '826', 'GB-ENG'],
  [3, '日本', 'Japan', 'JP', 'JPN', '392', 'JP-13'],
  [4, '澳大利亚', 'Australia', 'AU', 'AUS', '036', 'AU-NSW'],
  [5, '新加坡', 'Singapore', 'SG', 'SGP', '702', 'SG-01'],
  [6, '美国', 'United States', 'US', 'USA', '840', 'US-CA'],
  [7, '加拿大', 'Canada', 'CA', 'CAN', '124', 'CA-ON'],
  [8, '德国', 'Germany', 'DE', 'DEU', '276', 'DE-BE'],
  [9, '法国', 'France', 'FR', 'FRA', '250', 'FR-IDF'],
  [10, '意大利', 'Italy', 'IT', 'ITA', '380', 'IT-62'],
  [11, '西班牙', 'Spain', 'ES', 'ESP', '724', 'ES-MD'],
  [12, '荷兰', 'Netherlands', 'NL', 'NLD', '528', 'NL-NH'],
  [13, '比利时', 'Belgium', 'BE', 'BEL', '056', 'BE-BRU'],
  [14, '爱尔兰', 'Ireland', 'IE', 'IRL', '372', 'IE-D'],
  [15, '瑞士', 'Switzerland', 'CH', 'CHE', '756', 'CH-ZH'],
  [16, '瑞典', 'Sweden', 'SE', 'SWE', '752', 'SE-AB'],
  [17, '挪威', 'Norway', 'NO', 'NOR', '578', 'NO-03'],
  [18, '丹麦', 'Denmark', 'DK', 'DNK', '208', 'DK-84'],
  [19, '阿联酋', 'United Arab Emirates', 'AE', 'ARE', '784', 'AE-DU'],
  [20, '印度', 'India', 'IN', 'IND', '356', 'IN-DL'],
  [21, '韩国', 'South Korea', 'KR', 'KOR', '410', 'KR-11'],
  [22, '马来西亚', 'Malaysia', 'MY', 'MYS', '458', 'MY-14'],
  [23, '泰国', 'Thailand', 'TH', 'THA', '764', 'TH-10'],
  [24, '巴西', 'Brazil', 'BR', 'BRA', '076', 'BR-SP']
].map((x, idx) => ({
  id: x[0] as number,
  nameZh: x[1] as string,
  nameEn: x[2] as string,
  iso2: x[3] as string,
  iso3: x[4] as string,
  numericCode: x[5] as string,
  iso3166_2: x[6] as string,
  timezone: {
    standard: idx < 6 ? 'UTC+08:00' : 'UTC+00:00',
    supportsDst: idx % 2 === 0,
    dstNote: idx % 2 === 0 ? '夏令时期间自动切换 +1h（示例）' : '不支持 DST'
  },
  businessEnabled: idx % 3 !== 0,
  updatedAt: now(),
}));

const baseLangs = [
  { code: 'en-US', nameZh: '英语（美国）', nameEn: 'English (US)', hasPackage: true },
  { code: 'en-GB', nameZh: '英语（英国）', nameEn: 'English (UK)', hasPackage: true },
  { code: 'zh-CN', nameZh: '中文（简体）', nameEn: 'Chinese (Simplified)', hasPackage: true },
  { code: 'zh-HK', nameZh: '中文（香港）', nameEn: 'Chinese (Hong Kong)', hasPackage: true },
  { code: 'ja-JP', nameZh: '日语', nameEn: 'Japanese', hasPackage: true },
  { code: 'fr-FR', nameZh: '法语', nameEn: 'French', hasPackage: false }
];

const baseCurrencies = [
  { code: 'USD', number: '840', nameZh: '美元', nameEn: 'US Dollar' },
  { code: 'HKD', number: '344', nameZh: '港元', nameEn: 'Hong Kong Dollar' },
  { code: 'GBP', number: '826', nameZh: '英镑', nameEn: 'Pound Sterling' },
  { code: 'JPY', number: '392', nameZh: '日元', nameEn: 'Yen' },
  { code: 'AUD', number: '036', nameZh: '澳元', nameEn: 'Australian Dollar' },
  { code: 'SGD', number: '702', nameZh: '新加坡元', nameEn: 'Singapore Dollar' },
  { code: 'EUR', number: '978', nameZh: '欧元', nameEn: 'Euro' }
];

export const detailSeed: RegionDetailConfig[] = regionsSeed.map((r, idx) => ({
  regionId: r.id,
  basicInfo: {
    nameZh: r.nameZh,
    nameEn: r.nameEn,
    iso3166_2: r.iso3166_2,
    timezone: r.timezone
  },
  permissions: {
    basic: { visible: true, editable: true },
    language: { visible: true, editable: true },
    currency: { visible: true, editable: idx % 5 !== 0 },
    flow: { visible: true, editable: true },
    feature: { visible: true, editable: idx % 4 !== 0 },
    channel: { visible: true, editable: true }
  },
  languages: baseLangs.map((l, i) => ({ ...l, isDefault: i === 0, isPrimary: i === 0 })),
  currencies: baseCurrencies.map((c, i) => ({ ...c, isDefault: i === 0, isPrimary: i === 0 })),

  businessFlows: [],

  features: ['dashboard', 'orders', 'orders.create', 'risk', 'config.region'],
  channelConfig: {
    channel: 'Adyen',
    service: 'AFP_ISO',
    units: [
      {
        id: `u-${r.id}-1`,
        mccList: [],
        merchantAccountId: '',
        apiKey: '',
        balancePlatform: '',
        webhooks: []
      }
    ]
  }
}));

export const businessOptions = [
  { id: 'offline-apply', name: '线下上单（入驻）' },
  { id: 'online-apply', name: '线上上单' },
  { id: 'risk-check', name: '风控核查' }
];

export const processOptions: Record<string, { id: string; name: string }[]> = {
  'offline-apply': [
    { id: 'full-review', name: '全审核流程' },
    { id: 'half-review', name: '半审核流程' }
  ],
  'online-apply': [{ id: 'self-service', name: '自助上单流程' }],
  'risk-check': [
    { id: 'full-review', name: '全审核流程' },
    { id: 'no-review', name: '免审核流程（UK AFP）' }
  ]
};

export const featureTreeData = [
  { title: '工作台', key: 'dashboard' },
  { title: '订单中心', key: 'orders', children: [{ title: '新建订单', key: 'orders.create' }, { title: '订单查询', key: 'orders.search' }] },
  { title: '风控中心', key: 'risk', children: [{ title: '风险规则', key: 'risk.rules' }] },
  { title: '参数配置', key: 'config', children: [{ title: '地区参数', key: 'config.region' }, { title: '通道参数', key: 'config.channel' }] }
];

export const channelOptions = [
  { channel: 'Adyen', services: ['AFP_ISO', 'Payfac'] },
  { channel: 'AMEX', services: ['占位服务'] },
  { channel: 'Fiserv', services: ['占位服务'] },
  { channel: 'VISA', services: ['占位服务'] }
];

export const mappingRules: RuleItem[] = [
  { id: 'R001', name: '标准行业映射规则', remark: '适用于通用商户' },
  { id: 'R002', name: '高风险行业映射规则', remark: '适用于高风险场景' },
  { id: 'R003', name: '跨境行业映射规则', remark: '适用于跨境业务' }
];

export const mccOptions: MccItem[] = [
  { code: '5411', nameZh: '杂货店' },
  { code: '5812', nameZh: '餐厅' },
  { code: '5732', nameZh: '电子设备商店' },
  { code: '7999', nameZh: '娱乐服务' },
  { code: '6012', nameZh: '金融机构' },
  { code: '4111', nameZh: '交通运输' }
];
