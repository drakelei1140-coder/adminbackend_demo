import { App } from 'antd';
import { useEffect } from 'react';

export function useUnsavedWarning(when: boolean) {
  const { modal } = App.useApp();

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!when) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [when]);

  const confirmIfNeeded = () =>
    new Promise<boolean>((resolve) => {
      if (!when) {
        resolve(true);
        return;
      }
      modal.confirm({
        title: '存在未保存内容',
        content: '当前 Tab 有未保存内容，确定离开编辑状态吗？',
        onOk: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });

  return { confirmIfNeeded };
}
