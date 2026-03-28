import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  Tree,
  Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { businessOptions, channelOptions, featureTreeData, mappingRules, mccOptions, processOptions } from '../mock/data';
import { useUnsavedWarning } from '../hooks/useUnsavedWarning';
import { getRegionById, getRegionDetailConfig, saveRegionDetailConfig } from '../services/mockService';
import type { CurrencyItem, LanguageItem, MccItem, OperationUnit, Region, RegionDetailConfig, WebhookGroup } from '../types';

const alnumPattern = /^[A-Za-z0-9]*$/;

export default function RegionDetailPage() {
  const { id } = useParams();
  const regionId = Number(id);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [region, setRegion] = useState<Region>();
  const [detail, setDetail] = useState<RegionDetailConfig>();
  const [activeTab, setActiveTab] = useState('basic');
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [draft, setDraft] = useState<RegionDetailConfig>();
  const [dirty, setDirty] = useState(false);
  const { confirmIfNeeded } = useUnsavedWarning(!!editingTab && dirty);

  useEffect(() => {
    (async () => {
      const [r, d] = await Promise.all([getRegionById(regionId), getRegionDetailConfig(regionId)]);
      setRegion(r);
      setDetail(d);
      setDraft(d);
    })();
  }, [regionId]);

  const startEdit = async (tab: string) => {
    if (editingTab && editingTab !== tab) {
      const ok = await confirmIfNeeded();
      if (!ok) return;
    }
    setEditingTab(tab);
    setDirty(false);
    setDraft(structuredClone(detail));
  };

  const cancelEdit = async () => {
    const ok = await confirmIfNeeded();
    if (!ok) return;
    setEditingTab(null);
    setDirty(false);
    setDraft(structuredClone(detail));
  };

  const saveTab = async () => {
    if (!draft || !detail) return;
    const channelErr = validateChannel(draft.channelConfig);
    if (editingTab === 'channel' && channelErr) {
      message.error(channelErr);
      return;
    }
    const newData = await saveRegionDetailConfig(regionId, () => draft);
    setDetail(newData);
    setDraft(structuredClone(newData));
    setEditingTab(null);
    setDirty(false);
    message.success('保存成功（mock）');
  };

  const changeTab = async (next: string) => {
    if (editingTab && dirty && editingTab !== next) {
      const ok = await confirmIfNeeded();
      if (!ok) return;
      setEditingTab(null);
      setDirty(false);
      setDraft(structuredClone(detail));
    }
    setActiveTab(next);
  };

  if (!region || !detail || !draft) return <Card loading className="page-card" />;

  const allow = detail.permissions;

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card className="page-card">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button icon={<ArrowLeftOutlined />} style={{ width: 120 }} onClick={async () => {
            if (editingTab && dirty && !(await confirmIfNeeded())) return;
            navigate('/regions');
          }}>返回列表</Button>
          <Descriptions title={`地区详情 - ${region.nameZh} (${region.iso2})`} column={4}>
            <Descriptions.Item label="ID">{region.id}</Descriptions.Item>
            <Descriptions.Item label="英文名">{region.nameEn}</Descriptions.Item>
            <Descriptions.Item label="ISO">{region.iso2} / {region.iso3}</Descriptions.Item>
            <Descriptions.Item label="业务状态">{region.businessEnabled ? <Tag color="green">已开通</Tag> : <Tag>未开通</Tag>}</Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>

      <Card className="page-card">
        <Tabs activeKey={activeTab} onChange={changeTab} items={[
          {
            key: 'basic', label: '基础信息', children: <BasicTab region={region} draft={draft} editable={editingTab === 'basic'} onChange={(v) => { setDraft(v); setDirty(true); }} />,
          },
          {
            key: 'language', label: '语言包', children: <LanguageTab draft={draft} editable={editingTab === 'language'} onChange={(v) => { setDraft(v); setDirty(true); }} />,
          },
          {
            key: 'currency', label: '币种', children: <CurrencyTab draft={draft} editable={editingTab === 'currency'} onChange={(v) => { setDraft(v); setDirty(true); }} />,
          },
          {
            key: 'flow', label: '业务流程配置', children: <FlowTab draft={draft} editable={editingTab === 'flow'} onChange={(v) => { setDraft(v); setDirty(true); }} />,
          },
          {
            key: 'feature', label: '开放功能配置', children: <FeatureTab draft={draft} editable={editingTab === 'feature'} onChange={(v) => { setDraft(v); setDirty(true); }} />,
          },
          {
            key: 'channel', label: '通道参数配置', children: <ChannelTab draft={draft} editable={editingTab === 'channel'} onChange={(v) => { setDraft(v); setDirty(true); }} />,
          }
        ]} />

        <div className="action-bar">
          <Space size="middle" wrap>
          {allow[activeTab]?.visible !== false && (
            <Button type="primary" disabled={!allow[activeTab]?.editable || editingTab === activeTab} onClick={() => startEdit(activeTab)}>
              编辑
            </Button>
          )}
          {editingTab === activeTab && (
            <>
              <Button type="primary" onClick={saveTab}>保存</Button>
              <Button onClick={cancelEdit}>返回</Button>
            </>
          )}
          {allow[activeTab] && !allow[activeTab].editable && <Tag>无编辑权限（mock）</Tag>}
          </Space>
        </div>
      </Card>
    </Space>
  );
}

function BasicTab({ region, draft, editable, onChange }: { region: Region; draft: RegionDetailConfig; editable: boolean; onChange: (v: RegionDetailConfig) => void }) {
  const info = draft.basicInfo;
  return (
    <Form layout="vertical" disabled={!editable}>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="ID">{region.id}</Descriptions.Item>
        <Descriptions.Item label="地区中文">
          <Input value={info.nameZh} onChange={(e) => onChange({ ...draft, basicInfo: { ...info, nameZh: e.target.value } })} disabled={!editable} />
        </Descriptions.Item>
        <Descriptions.Item label="ISO 2编码">{region.iso2}</Descriptions.Item>
        <Descriptions.Item label="ISO 3编码">{region.iso3}</Descriptions.Item>
        <Descriptions.Item label="数字代码">{region.numericCode}</Descriptions.Item>
        <Descriptions.Item label="ISO 3166-2代码">
          <Input value={info.iso3166_2} onChange={(e) => onChange({ ...draft, basicInfo: { ...info, iso3166_2: e.target.value } })} disabled={!editable} />
        </Descriptions.Item>
        <Descriptions.Item label="英文名"><Input value={info.nameEn} onChange={(e) => onChange({ ...draft, basicInfo: { ...info, nameEn: e.target.value } })} disabled={!editable} /></Descriptions.Item>
        <Descriptions.Item label="标准时区"><Input value={info.timezone.standard} onChange={(e) => onChange({ ...draft, basicInfo: { ...info, timezone: { ...info.timezone, standard: e.target.value } } })} disabled={!editable} /></Descriptions.Item>
        <Descriptions.Item label="是否支持 DST"><Switch checked={info.timezone.supportsDst} disabled={!editable} onChange={(v) => onChange({ ...draft, basicInfo: { ...info, timezone: { ...info.timezone, supportsDst: v } } })} /></Descriptions.Item>
        <Descriptions.Item label="DST 说明"><Input value={info.timezone.dstNote} onChange={(e) => onChange({ ...draft, basicInfo: { ...info, timezone: { ...info.timezone, dstNote: e.target.value } } })} disabled={!editable} /></Descriptions.Item>
      </Descriptions>
    </Form>
  );
}

function LanguageTab({ draft, editable, onChange }: { draft: RegionDetailConfig; editable: boolean; onChange: (v: RegionDetailConfig) => void }) {
  const columns: ColumnsType<LanguageItem> = [
    { title: '语言代码', dataIndex: 'code' },
    { title: '语言中文名称', dataIndex: 'nameZh' },
    { title: '语言英文名称', dataIndex: 'nameEn' },
    { title: '系统中是否有语言包', render: (_, r) => (r.hasPackage ? 'Y' : 'N') },
    {
      title: '默认语言',
      render: (_, row) => <Switch disabled={!editable || !row.hasPackage} checked={row.isDefault} onChange={(v) => onChange({ ...draft, languages: draft.languages.map((l) => ({ ...l, isDefault: l.code === row.code ? v : false })) })} />
    },
    {
      title: '第一语言',
      render: (_, row) => <Switch disabled={!editable || !row.hasPackage} checked={row.isPrimary} onChange={(v) => onChange({ ...draft, languages: draft.languages.map((l) => ({ ...l, isPrimary: l.code === row.code ? v : false })) })} />
    }
  ];
  return <Table rowKey="code" pagination={false} columns={columns} dataSource={draft.languages} />;
}

function CurrencyTab({ draft, editable, onChange }: { draft: RegionDetailConfig; editable: boolean; onChange: (v: RegionDetailConfig) => void }) {
  const columns: ColumnsType<CurrencyItem> = [
    { title: '货币中文名', dataIndex: 'nameZh' },
    { title: '货币英文名', dataIndex: 'nameEn' },
    { title: '货币代码', dataIndex: 'code' },
    { title: '货币编号', dataIndex: 'number' },
    { title: '默认币种', render: (_, row) => <Switch disabled={!editable} checked={row.isDefault} onChange={(v) => onChange({ ...draft, currencies: draft.currencies.map((c) => ({ ...c, isDefault: c.code === row.code ? v : false })) })} /> },
    { title: '第一币种', render: (_, row) => <Switch disabled={!editable} checked={row.isPrimary} onChange={(v) => onChange({ ...draft, currencies: draft.currencies.map((c) => ({ ...c, isPrimary: c.code === row.code ? v : false })) })} /> }
  ];
  return <Table rowKey="code" pagination={false} columns={columns} dataSource={draft.currencies} />;
}

function FlowTab({ draft, editable, onChange }: { draft: RegionDetailConfig; editable: boolean; onChange: (v: RegionDetailConfig) => void }) {
  const updateItem = (index: number, patch: Partial<RegionDetailConfig['businessFlows'][number]>) => {
    onChange({
      ...draft,
      businessFlows: draft.businessFlows.map((item, i) => (i === index ? { ...item, ...patch } : item))
    });
  };

  const removeItem = (index: number) => {
    onChange({
      ...draft,
      businessFlows: draft.businessFlows.filter((_, i) => i !== index)
    });
  };

  const addItem = () => {
    onChange({
      ...draft,
      businessFlows: [...draft.businessFlows, { businessId: '', processId: '' }]
    });
  };

  const selectedBusinessIds = new Set(draft.businessFlows.map((item) => item.businessId).filter(Boolean));

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <div className="section-actions">
        <Button type="dashed" icon={<PlusOutlined />} onClick={addItem} disabled={!editable}>添加业务</Button>
      </div>
      {draft.businessFlows.length === 0 && <Typography.Text type="secondary">暂无业务配置，请点击“添加业务”。</Typography.Text>}
      {draft.businessFlows.map((item, index) => {
        const currentProcessOptions = processOptions[item.businessId] || [];
        return (
          <Card key={`${item.businessId || 'empty'}-${index}`} size="small" type="inner" title={`业务配置 #${index + 1}`} extra={<Button danger type="link" disabled={!editable} onClick={() => removeItem(index)}>删除</Button>}>
            <Form layout="vertical">
              <Form.Item label="选择业务" required>
                <Select
                  disabled={!editable}
                  value={item.businessId || undefined}
                  options={businessOptions.map((b) => ({
                    value: b.id,
                    label: b.name,
                    disabled: selectedBusinessIds.has(b.id) && item.businessId !== b.id
                  }))}
                  onChange={(businessId) => updateItem(index, { businessId, processId: '' })}
                  placeholder="请选择业务"
                />
              </Form.Item>
              <Form.Item label="选择业务流程" required>
                <Select
                  disabled={!editable || !item.businessId}
                  value={item.processId || undefined}
                  options={currentProcessOptions.map((p) => ({ value: p.id, label: p.name }))}
                  onChange={(processId) => updateItem(index, { processId })}
                  placeholder="请先选择业务"
                />
              </Form.Item>
            </Form>
          </Card>
        );
      })}
    </Space>
  );
}

function FeatureTab({ draft, editable, onChange }: { draft: RegionDetailConfig; editable: boolean; onChange: (v: RegionDetailConfig) => void }) {
  return <Tree checkable checkedKeys={draft.features} treeData={featureTreeData} onCheck={(keys) => editable && onChange({ ...draft, features: keys as string[] })} />;
}

function ChannelTab({ draft, editable, onChange }: { draft: RegionDetailConfig; editable: boolean; onChange: (v: RegionDetailConfig) => void }) {
  const cfg = draft.channelConfig;
  const [confirmedPair, setConfirmedPair] = useState<{ channel: string; service: string } | null>(null);
  const [ruleModal, setRuleModal] = useState<{ open: boolean; unitId: string; keyword: string }>({ open: false, unitId: '', keyword: '' });
  const [mccModal, setMccModal] = useState<{ open: boolean; unitId: string; keyword: string; selected: string[] }>({ open: false, unitId: '', keyword: '', selected: [] });
  const [webhookModal, setWebhookModal] = useState<{ open: boolean; unitId: string }>({ open: false, unitId: '' });
  const [webhookForm] = Form.useForm<WebhookGroup>();

  const selectedUnit = (id: string) => cfg.units.find((u) => u.id === id);
  const patchUnit = (id: string, updater: (u: OperationUnit) => OperationUnit) => {
    onChange({ ...draft, channelConfig: { ...cfg, units: cfg.units.map((u) => (u.id === id ? updater(u) : u)) } });
  };
  const canConfirm = !!cfg.channel && !!cfg.service;
  const isConfirmedAdyenAfp = confirmedPair?.channel === 'Adyen' && confirmedPair?.service === 'AFP_ISO';

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Steps current={1} items={[{ title: 'Step 1：选择通道（渠道 + 服务）' }, { title: 'Step 2：配置参数' }]} />
      <Card size="small" title="Step 1：选择通道与服务">
        <Space wrap size="middle">
          <Select
            disabled={!editable}
            style={{ width: 160 }}
            value={cfg.channel || undefined}
            placeholder="请选择渠道"
            options={channelOptions.map((o) => ({ value: o.channel, label: o.channel }))}
            onChange={(channel) => {
              onChange({ ...draft, channelConfig: { ...cfg, channel, service: '' } });
              setConfirmedPair(null);
            }}
          />
          <Select
            disabled={!editable || !cfg.channel}
            style={{ width: 180 }}
            value={cfg.service || undefined}
            placeholder="请选择服务"
            options={(channelOptions.find((c) => c.channel === cfg.channel)?.services || []).map((s) => ({ value: s, label: s }))}
            onChange={(service) => {
              onChange({ ...draft, channelConfig: { ...cfg, service } });
              setConfirmedPair(null);
            }}
          />
          <Button type="primary" disabled={!editable || !canConfirm} onClick={() => setConfirmedPair({ channel: cfg.channel, service: cfg.service })}>
            确认
          </Button>
        </Space>
      </Card>

      {confirmedPair && isConfirmedAdyenAfp && (
        <Card size="small" title="Step 2：Adyen-AFP 参数配置" extra={<Button disabled={!editable} icon={<PlusOutlined />} onClick={() => onChange({ ...draft, channelConfig: { ...cfg, units: [...cfg.units, { id: `u-${Date.now()}`, mccList: [], merchantAccountId: '', apiKey: '', balancePlatform: '', webhooks: [] }] } })}>新增运营单元</Button>}>
          {cfg.units.map((unit, idx) => (
            <Card key={unit.id} type="inner" title={`运营单元 #${idx + 1}`} style={{ marginBottom: 12 }}>
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                <Space size="middle" wrap>
                  <Button disabled={!editable} onClick={() => setRuleModal({ open: true, unitId: unit.id, keyword: '' })}>选择规则</Button>
                  <Typography.Text>{unit.rule ? `${unit.rule.id} - ${unit.rule.name}` : '未选择规则'}</Typography.Text>
                </Space>
                <Space size="middle" wrap>
                  <Button disabled={!editable} onClick={() => setMccModal({ open: true, unitId: unit.id, keyword: '', selected: unit.mccList.map((m) => m.code) })}>选择 MCC</Button>
                  <Typography.Text>{unit.mccList.map((m) => `${m.code}-${m.nameZh}`).join('；') || '未选择 MCC'}</Typography.Text>
                </Space>
                <Form layout="vertical">
                  <Form.Item label="merchant account id" required><Input disabled={!editable} value={unit.merchantAccountId} onChange={(e) => patchUnit(unit.id, (u) => ({ ...u, merchantAccountId: e.target.value }))} /></Form.Item>
                  <Form.Item label="API key" required><Input disabled={!editable} value={unit.apiKey} onChange={(e) => patchUnit(unit.id, (u) => ({ ...u, apiKey: e.target.value }))} /></Form.Item>
                  <Form.Item label="Balance platform" required><Input disabled={!editable} value={unit.balancePlatform} onChange={(e) => patchUnit(unit.id, (u) => ({ ...u, balancePlatform: e.target.value }))} /></Form.Item>
                </Form>
                <Button disabled={!editable} onClick={() => { webhookForm.resetFields(); setWebhookModal({ open: true, unitId: unit.id }); }}>新增 webhook 参数组</Button>
                <div className="dashed-box">
                  {unit.webhooks.length === 0 ? <Typography.Text type="secondary">暂无 webhook 参数组</Typography.Text> : unit.webhooks.map((w) => <div key={w.id}><b>{w.internalBizId}</b> - {w.endpointUrl} - {w.scope}</div>)}
                </div>
              </Space>
            </Card>
          ))}
        </Card>
      )}

      {confirmedPair && !isConfirmedAdyenAfp && (
        <Card size="small" title="Step 2：配置参数">
          <Typography.Text type="secondary">当前通道为占位演示，完整参数配置仅实现 Adyen-AFP</Typography.Text>
        </Card>
      )}

      <Modal open={ruleModal.open} onCancel={() => setRuleModal({ ...ruleModal, open: false })} onOk={() => setRuleModal({ ...ruleModal, open: false })} title="选择行业代码映射规则" width={700}>
        <Input placeholder="按规则名称搜索" value={ruleModal.keyword} onChange={(e) => setRuleModal({ ...ruleModal, keyword: e.target.value })} />
        <Radio.Group style={{ width: '100%', marginTop: 12 }} value={selectedUnit(ruleModal.unitId)?.rule?.id} onChange={(e) => patchUnit(ruleModal.unitId, (u) => ({ ...u, rule: mappingRules.find((r) => r.id === e.target.value) }))}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {mappingRules.filter((r) => r.name.includes(ruleModal.keyword)).map((rule) => <Radio key={rule.id} value={rule.id}>{rule.id} | {rule.name} | {rule.remark}</Radio>)}
          </Space>
        </Radio.Group>
      </Modal>

      <Modal open={mccModal.open} onCancel={() => setMccModal({ ...mccModal, open: false })} onOk={() => { patchUnit(mccModal.unitId, (u) => ({ ...u, mccList: mccOptions.filter((m) => mccModal.selected.includes(m.code)) })); setMccModal({ ...mccModal, open: false }); }} title="选择 MCC" width={700}>
        <Input placeholder="按编码/名称搜索" value={mccModal.keyword} onChange={(e) => setMccModal({ ...mccModal, keyword: e.target.value })} />
        <Table<MccItem>
          rowKey="code"
          rowSelection={{ type: 'checkbox', selectedRowKeys: mccModal.selected, onChange: (keys) => setMccModal({ ...mccModal, selected: keys as string[] }) }}
          pagination={false}
          style={{ marginTop: 12 }}
          columns={[{ title: 'MCC 编码', dataIndex: 'code' }, { title: '中文名称', dataIndex: 'nameZh' }]}
          dataSource={mccOptions.filter((m) => m.code.includes(mccModal.keyword) || m.nameZh.includes(mccModal.keyword))}
        />
      </Modal>

      <Modal
        open={webhookModal.open}
        title="新增 webhook 参数组"
        onCancel={() => setWebhookModal({ ...webhookModal, open: false })}
        onOk={async () => {
          const values = await webhookForm.validateFields();
          patchUnit(webhookModal.unitId, (u) => ({ ...u, webhooks: [...u.webhooks, { ...values, id: `${Date.now()}` }] }));
          setWebhookModal({ ...webhookModal, open: false });
        }}
      >
        <Form form={webhookForm} layout="vertical">
          <Form.Item name="internalBizId" label="内部业务ID" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="internalRemark" label="内部业务备注"><Input /></Form.Item>
          <Form.Item name="endpointUrl" label="Webhook endpoint URL" rules={[{ required: true }, { type: 'url', message: 'URL 格式不正确' }]}><Input /></Form.Item>
          <Form.Item name="scope" label="Webhook scope" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="webhookId" label="Webhook ID" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="hmacKey" label="HMAC Key" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

function validateChannel(cfg: RegionDetailConfig['channelConfig']) {
  if (!(cfg.channel === 'Adyen' && cfg.service === 'AFP_ISO')) return null;
  for (const unit of cfg.units) {
    if (!alnumPattern.test(unit.merchantAccountId) || !alnumPattern.test(unit.apiKey) || !alnumPattern.test(unit.balancePlatform)) {
      return `运营单元 ${unit.id} 中 merchant account id / API key / Balance platform 仅允许英文和数字`;
    }
    for (const w of unit.webhooks) {
      try { new URL(w.endpointUrl); } catch { return `运营单元 ${unit.id} 存在非法 webhook endpoint URL`; }
    }
  }
  return null;
}
