import { Link } from "react-router-dom";

const IMAGE_MAP = {
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  pizza: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&q=80",
  italian: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=600&q=80",
  sushi: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80",
  japanese: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600&q=80",
  asian: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80",
  indian: "https://images.unsplash.com/photo-1585937421612-70a008356f36?w=600&q=80",
  coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
  bar: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80",
  french: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?w=600&q=80",
  default: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80" 
};

const getSmartImage = (cuisine, type) => {
  const key = cuisine ? cuisine.toLowerCase() : type;
  
  if (key.includes('pizza')) return IMAGE_MAP.pizza;
  if (key.includes('burger')) return IMAGE_MAP.burger;
  if (key.includes('sushi')) return IMAGE_MAP.sushi;
  if (key.includes('japan')) return IMAGE_MAP.japanese;
  if (key.includes('asian') || key.includes('chinese') || key.includes('viet')) return IMAGE_MAP.asian;
  if (key.includes('india')) return IMAGE_MAP.indian;
  if (key.includes('italian') || key.includes('pasta')) return IMAGE_MAP.italian;
  if (key.includes('cafe') || key.includes('coffee')) return IMAGE_MAP.coffee;
  if (key.includes('bar') || key.includes('pub')) return IMAGE_MAP.bar;
  
  return IMAGE_MAP.default;
};

export default function RestaurantCard({ place }) {
  
  const imageUrl = getSmartImage(place.cuisine, place.type);

  // On formate le sous-titre
  const subtitle = place.cuisine 
    ? `${place.cuisine.charAt(0).toUpperCase() + place.cuisine.slice(1)}`
    : place.type?.replace('_', ' ');

  return (
    <div className="card">
      <div 
        className="card-img-placeholder"
        style={{
             
             backgroundImage: `linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.9)), url(${imageUrl})`,
             backgroundSize: 'cover',
             backgroundPosition: 'center'
        }}
      ></div>

      <div className="card-content">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <p className="type">{subtitle || 'Gastronomie'}</p>
            <span className="rating">★ {place.rating}</span>
        </div>
        
        <h3>{place.name}</h3>
        
        <Link to={`/restaurant/${place.id}`} className="btn-details">
          Voir localisation
        </Link>
      </div>
    </div>
  );
}