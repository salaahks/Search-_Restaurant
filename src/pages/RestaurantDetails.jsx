import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapPin, ArrowLeft, Star, Utensils } from "lucide-react"; // Assure-toi d'avoir lucide-react

export default function RestaurantDetails() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `https://overpass-api.de/api/interpreter?data=[out:json];node(${id});out;`
    )
      .then(res => res.json())
      .then(data => {
        if (data.elements && data.elements.length > 0) {
          const p = data.elements[0];
          setPlace({
            name: p.tags?.name,
            lat: p.lat,
            lon: p.lon,
            type: p.tags?.amenity,
            cuisine: p.tags?.cuisine,
            website: p.tags?.website,
            phone: p.tags?.["contact:phone"] || p.tags?.phone
          });
        }
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen">Chargement de l'expérience...</div>;
  if (!place) return <div className="loading-screen">Lieu introuvable.</div>;

  return (
    <div className="container">
      
      {/* --- BOUTON RETOUR FLOTTANT --- */}
      <div style={{ marginBottom: '30px' }}>
        <Link to="/restaurants" className="back-link">
          <ArrowLeft size={20} /> Retour à la collection
        </Link>
      </div>

      {/* --- LA CARTE PRINCIPALE (DESIGN LUXE) --- */}
      <div className="details-card-royal">
        
        {/* EN-TÊTE */}
        <div className="details-header">
          <div className="tag-royal">
             <Utensils size={14} style={{marginRight:5}}/>
             {place.type === 'restaurant' ? 'Restaurant Gastronomique' : place.type?.toUpperCase()}
             {place.cuisine && ` • ${place.cuisine.toUpperCase()}`}
          </div>
          
          <h1>{place.name}</h1>
          
          <div className="stars-royal">
             <Star size={16} fill="#d4af37" color="#d4af37"/>
             <Star size={16} fill="#d4af37" color="#d4af37"/>
             <Star size={16} fill="#d4af37" color="#d4af37"/>
             <Star size={16} fill="#d4af37" color="#d4af37"/>
             <Star size={16} fill="#d4af37" color="#d4af37"/>
             <span style={{color: '#0a0a0a', marginLeft: '10px', fontSize: '0.9rem'}}>Excellence</span>
          </div>
        </div>

        {/* CONTENU & INFO */}
        <div className="details-info">
            <p>Une destination culinaire d'exception située au cœur du quartier.</p>
            {place.phone && <p><strong>Téléphone :</strong> {place.phone}</p>}
            {place.website && <p><strong>Site Web :</strong> <a href={place.website} target="_blank" rel="noreferrer" style={{textDecoration:'underline'}}>Visiter le site</a></p>}
        </div>

        {/* --- LA VRAIE MAP AU CENTRE --- */}
        <div className="map-container-royal">
            <iframe
              title="Map"
              width="100%"
              height="450"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              // Astuce pour avoir Google Maps sans clé API (Embed mode)
              src={`https://maps.google.com/maps?q=${place.lat},${place.lon}&hl=fr&z=16&output=embed`}
              style={{ filter: "grayscale(20%) contrast(1.1)" }} // Un look un peu plus "Luxe/Sobres"
            ></iframe>
        </div>

        {/* PIED DE PAGE AVEC BOUTON ACTION */}
        <div className="details-footer">
           <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
              target="_blank"
              rel="noreferrer"
              className="btn-gps-royal"
            >
              <MapPin size={18} style={{marginRight: 8}} />
              Lancer le GPS
            </a>
        </div>

      </div>
    </div>
  );
}