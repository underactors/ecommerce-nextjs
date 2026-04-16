export default function CategoryCard({ iconUrl, color, title, description }) {
  return (
    <div className="category-card" style={{ borderTopColor: color }}>
      <div className="category-icon">
        {iconUrl ? (
          <img 
            src={iconUrl} 
            alt={title} 
            style={{ width: '60px', height: '60px' }} 
          />
        ) : (
          <i className="fas fa-box" style={{ color, fontSize: '40px' }}></i>
        )}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}