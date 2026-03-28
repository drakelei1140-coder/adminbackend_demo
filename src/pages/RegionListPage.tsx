import { DownOutlined, MoreOutlined } from '@ant-design/icons';
import { App, Button, Card, Dropdown, Form, Input, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryRegions, updateRegionBusinessStatus } from '../services/mockService';
import type { Region } from '../types';

interface FilterValues {
  name?: string;
  code?: string;
  enabled?: 'all' | 'yes' | 'no';
}

export default function RegionListPage() {
  const navigate = useNavigate();
  const { modal, message } = App.useApp();
  const [form] = Form.useForm<FilterValues>();
  const [data, setData] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const values = form.getFieldsValue();
    const enabled = values.enabled === 'all' || values.enabled === undefined ? undefined : values.enabled === 'yes';
    const res = await queryRegions({ name: values.name, code: values.code, enabled });
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    form.setFieldValue('enabled', 'all');
    void load();
  }, []);

  const toggleStatus = (r: Region, target: boolean) => {
    modal.confirm({
      title: target ? '确认展开业务？' : '确认停止业务？',
      content: `${r.nameZh}（${r.iso2}）将${target ? '开启' : '停止'}业务。`,
      onOk: async () => {
        await updateRegionBusinessStatus(r.id, target);
        message.success('状态更新成功');
        await load();
      }
    });
  };

  const columns: ColumnsType<Region> = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', width: 70 },
      { title: '地区中文', dataIndex: 'nameZh' },
      { title: 'ISO 2编码', dataIndex: 'iso2', width: 110 },
      { title: 'ISO 3编码', dataIndex: 'iso3', width: 110 },
      { title: '数字代码', dataIndex: 'numericCode', width: 100 },
      { title: 'ISO 3166-2代码', dataIndex: 'iso3166_2', width: 130 },
      { title: '英文名', dataIndex: 'nameEn' },
      {
        title: '是否开展业务',
        dataIndex: 'businessEnabled',
        width: 140,
        render: (_, record) => (record.businessEnabled ? 'Y' : 'N')
      },
      { title: '最近更新时间', dataIndex: 'updatedAt', width: 180 },
      {
        title: '操作',
        width: 70,
        render: (_, record) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              menu={{
                items: [
                  { key: 'detail', label: '详情' },
                  { key: 'toggle', label: record.businessEnabled ? '停止业务' : '展开业务' }
                ],
                onClick: ({ key, domEvent }) => {
                  domEvent.stopPropagation();
                  if (key === 'detail') navigate(`/regions/${record.id}`);
                  if (key === 'toggle') toggleStatus(record, !record.businessEnabled);
                }
              }}
            >
              <Button type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
            </Dropdown>
          </div>
        )
      }
    ],
    [navigate]
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card className="page-card">
        <Typography.Title level={4} style={{ marginBottom: 8 }}>地区业务开通与参数配置管理</Typography.Title>
        <Typography.Text type="secondary">管理各地区业务开通状态；仅开通地区会被对外查询接口命中。</Typography.Text>
      </Card>

      <Card className="page-card">
        <Form form={form} layout="inline" onFinish={load}>
          <Form.Item name="name" label="地区名称"><Input placeholder="中文/英文名称" allowClear /></Form.Item>
          <Form.Item name="code" label="地区编码"><Input placeholder="ISO2 / ISO3" allowClear /></Form.Item>
          <Form.Item name="enabled" label="开通状态">
            <Select
              style={{ width: 150 }}
              options={[{ value: 'all', label: '全部' }, { value: 'yes', label: '已开通' }, { value: 'no', label: '未开通' }]}
              suffixIcon={<DownOutlined />}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button onClick={() => { form.resetFields(); form.setFieldValue('enabled', 'all'); void load(); }}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className="page-card">
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
          onRow={(record) => ({ onClick: () => navigate(`/regions/${record.id}`), style: { cursor: 'pointer' } })}
          rowClassName={(r) => (r.businessEnabled ? '' : 'muted')}
        />
        <Tag color="blue" style={{ marginTop: 8 }}>说明：仅“已开通业务”的地区会被外部查询接口命中（mock 规则）。</Tag>
      </Card>
    </Space>
  );
}
