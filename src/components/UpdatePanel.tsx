import type { UpdateState } from '../updates';
export function UpdatePanel({
  state,
  action,
  install,
}: {
  state: UpdateState | null;
  action: (type: 'check' | 'download' | 'release') => void;
  install: () => void;
}) {
  if (!state) return <p role="status">Đang đọc thông tin phiên bản…</p>;
  return (
    <div className="update-panel">
      <p>
        Phiên bản đang dùng: <strong>{state.currentVersion}</strong>
      </p>
      <div role="status" aria-live="polite">
        {state.status === 'current' && <p>Em đang dùng phiên bản mới nhất.</p>}
        {state.status === 'checking' && <p>Đang kiểm tra phiên bản mới…</p>}
        {state.status === 'available' && (
          <p>
            Đã có phiên bản <strong>{state.version}</strong>.
          </p>
        )}
        {state.status === 'error' && <p className="form-error">{state.error}</p>}
        {state.status === 'unsupported' && (
          <p>Bản này cập nhật bằng cách tải bộ cài Windows mới từ GitHub.</p>
        )}
        {state.status === 'downloading' && (
          <>
            <p>Đang tải: {Math.floor(state.percent)}%</p>
            <progress aria-label="Tiến độ tải cập nhật" max={100} value={state.percent} />
          </>
        )}
        {state.status === 'downloaded' && <p>Bản mới đã sẵn sàng. Bấm nút bên dưới để lưu và cài đặt.</p>}
        {state.status === 'installing' && <p>Đang mở bộ cài bản mới…</p>}
      </div>
      {state.notes && (
        <details open>
          <summary>Có gì mới?</summary>
          <p className="release-notes">{state.notes}</p>
        </details>
      )}
      <p>
        Hồ sơ và điểm vẫn được giữ. Khi cài đặt, ứng dụng sẽ đóng và mở lại; hãy lưu xong lượt chơi trước khi
        cập nhật.
      </p>
      <div className="button-row">
        {['idle', 'current'].includes(state.status) && (
          <button className="button primary" onClick={() => action('check')}>
            Kiểm tra cập nhật
          </button>
        )}
        {(state.status === 'available' || (state.status === 'error' && state.version)) && (
          <button className="button primary" onClick={() => action('download')}>
            {state.status === 'error' ? 'Tải lại bản cập nhật' : 'Cập nhật ngay'}
          </button>
        )}
        {state.status === 'error' && !state.version && (
          <button className="button primary" onClick={() => action('check')}>
            Thử lại
          </button>
        )}
        {state.status === 'downloaded' && (
          <button className="button primary" onClick={install}>
            Lưu và cài đặt bản mới
          </button>
        )}
        {state.status === 'unsupported' && (
          <button className="button primary" onClick={() => action('release')}>
            Mở trang tải bản mới
          </button>
        )}
      </div>
    </div>
  );
}
