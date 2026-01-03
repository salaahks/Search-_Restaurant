import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapPin, ArrowLeft, Star, Utensils, Globe, Phone } from "lucide-react"; 


const API_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

export default function RestaurantDetails() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
 
    fetch(
      `https://api.geoapify.com/v2/place-details?id=${id}&apiKey=${API_KEY}`
    )
      .then(res => res.json())
      .then(data => {
        // Geoapify renvoie un tableau "features"
        if (data.features && data.features.length > 0) {
          const props = data.features[0].properties;
          
          // Logique pour retrouver le type et la cuisine
          const cats = props.categories || [];
          let type = "Lieu";
          if (cats.includes("catering.restaurant")) type = "Restaurant";
          else if (cats.includes("catering.cafe")) type = "Café";
          else if (cats.includes("catering.bar")) type = "Bar";
          
          // Cuisine (ex: catering.restaurant.italian -> italian)
          const cuisineRaw = cats.find(c => c.startsWith("catering.restaurant.")) || "";
          const cuisine = cuisineRaw.split('.').pop();

          setPlace({
            name: props.name || props.street || "Lieu sans nom",
            lat: props.lat,
            lon: props.lon,
            type: type,
            cuisine: cuisine !== "restaurant" ? cuisine : null,
            // Geoapify range parfois le site/téléphone dans "contact" ou à la racine
            website: props.website || props.contact?.website,
            phone: props.phone || props.contact?.phone,
            address: props.formatted
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
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
             {place.type.toUpperCase()}
             {place.cuisine && ` • ${place.cuisine.toUpperCase()}`}
          </div>
          
          <h1>{place.name}</h1>
          
          <div className="stars-royal">
             {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#d4af37" color="#d4af37"/>
             ))}
             <span style={{color: '#0a0a0a', marginLeft: '10px', fontSize: '0.9rem'}}>Excellence</span>
          </div>
        </div>

        {/* CONTENU & INFO */}
        <div className="details-info">
            <p>Une destination culinaire d'exception : {place.address}</p>
            
            <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', flexWrap: 'wrap'}}>
                {place.phone && (
                    <div style={{display:'flex', alignItems:'center', gap:'8px', color: '#0a0a0a'}}>
                        <Phone size={16} color="#002395"/> 
                        <strong>{place.phone}</strong>
                    </div>
                )}
                
                {place.website && (
                    <a href={place.website} target="_blank" rel="noreferrer" style={{display:'flex', alignItems:'center', gap:'8px', color: '#002395', textDecoration:'underline'}}>
                        <Globe size={16} /> 
                        Visiter le site officiel
                    </a>
                )}
            </div>
        </div>

        {/* --- LA VRAIE MAP AU CENTRE (Corrigée) --- */}
        <div className="map-container-royal">
            <iframe
              title="Map"
              width="100%"
              height="450"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              // Voici le lien correct pour embed Google Maps gratuitement
              src={`https://maps.google.com/maps?q=${place.lat},${place.lon}&hl=fr&z=16&output=embed`}
              style={{ filter: "grayscale(20%) contrast(1.1)" }}
            ></iframe>
        </div>

        {/* PIED DE PAGE AVEC BOUTON ACTION */}
        <div className="details-footer">
           <a
              // Lien correct pour ouvrir l'appli GPS
              href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`}
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