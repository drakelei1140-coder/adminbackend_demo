import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import RegionListPage from './pages/RegionListPage';
import RegionDetailPage from './pages/RegionDetailPage';

export default function App() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Layout.Content style={{ padding: 24 }}>
        <Routes>
          <Route path="/regions" element={<RegionListPage />} />
          <Route path="/regions/:id" element={<RegionDetailPage />} />
          <Route path="*" element={<Navigate to="/regions" replace />} />
        </Routes>
      </Layout.Content>
    </Layout>
  );
}
