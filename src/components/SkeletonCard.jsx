export const SkeletonCard = () => (
  <div className="card skeleton-card">
    <div className="skeleton-header">
      <div className="skeleton skeleton-avatar"></div>
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-subtitle"></div>
      </div>
    </div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text" style={{ width: "60%" }}></div>
  </div>
);
