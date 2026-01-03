import { useEffect, useState } from "react";
import { Utensils, Coffee, Pizza, Beer, MapPin, Layers } from "lucide-react"; 
import RestaurantCard from "../components/RestaurantCard";
import CustomSelect from "../components/CustomSelect";

const ITEMS_PER_PAGE = 12;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24h de cache

// TA CLÉ API
const API_KEY = "b23395c86f1b46ec8dceb5233cb8cef8";

export default function Restaurants() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- ETATS ---
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc");
  const [location, setLocation] = useState("Paris");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // --- COORDONNÉES (Format Geoapify : LonMin,LatMin,LonMax,LatMax) ---
  const cityCoordinates = {
    "Paris": "2.224,48.815,2.469,48.902",
    "Saint-Ouen": "2.318,48.895,2.350,48.915",
    "Neuilly": "2.252,48.877,2.288,48.895",
    "Boulogne": "2.224,48.825,2.256,48.847",
    "Versailles": "2.110,48.790,2.160,48.820",
    "IDF": "1.4,48.0,3.6,49.2"
  };

  /* ================= FETCH OPTIMISÉ (CACHE + GEOAPIFY) ================= */
  useEffect(() => {
    setLoading(true);
    setPlaces([]); 

    // 1. Gestion du Cache
    const cacheKey = `cache_geo_${location}`; // Nouvelle clé pour éviter les conflits
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log("⚡ Chargement depuis le cache (Rapide)");
        setPlaces(data);
        setLoading(false);
        setCurrentPage(1);
        return; 
      }
    }

    // 2. Préparation de l'URL Geoapify
    const bbox = cityCoordinates[location] || cityCoordinates["Paris"];
    // On demande : Restaurant, Café, Fast Food, Bar, Pub
    const categories = "catering.restaurant,catering.cafe,catering.fast_food,catering.bar,catering.pub";
    
    const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=rect:${bbox}&limit=60&apiKey=${API_KEY}`;

    // 3. Appel API
    fetch(url)
      .then(res => res.json())
      .then(data => {
        // Geoapify renvoie "features", pas "elements"
        if (!data.features) return;

        const cleanData = data.features.map(f => {
            // Logique pour déterminer le type (ex: catering.cafe -> cafe)
            const cats = f.properties.categories || [];
            let type = "restaurant";
            if (cats.includes("catering.cafe")) type = "cafe";
            if (cats.includes("catering.fast_food")) type = "fast_food";
            if (cats.includes("catering.bar") || cats.includes("catering.pub")) type = "bar";

            // Tentative de trouver la cuisine (ex: catering.restaurant.italian)
            const cuisineRaw = cats.find(c => c.startsWith("catering.restaurant.")) || "";
            const cuisine = cuisineRaw.split('.').pop();

            return {
                id: f.properties.place_id,
                // Parfois le nom est vide, on prend la rue à la place
                name: f.properties.name || f.properties.street || "Lieu sans nom",
                type: type, 
                cuisine: cuisine !== "restaurant" ? cuisine : null,
                lat: f.properties.lat,
                lon: f.properties.lon,
                // Note aléatoire (car l'API ne donne pas les notes)
                rating: +(Math.random() * (5 - 3.5) + 3.5).toFixed(1)
            };
        }).filter(p => p.name !== "Lieu sans nom"); // On retire les lieux vides

        // 4. Sauvegarde dans le Cache
        localStorage.setItem(cacheKey, JSON.stringify({
          data: cleanData,
          timestamp: Date.now()
        }));

        setPlaces(cleanData);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch(err => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, [location]);

  /* ================= OPTIONS ================= */
  const typeOptions = [
    { value: "all", label: "Tout voir", icon: <Layers size={18} /> },
    { value: "restaurant", label: "Restaurants", icon: <Utensils size={18} /> },
    { value: "cafe", label: "Cafés", icon: <Coffee size={18} /> },
    { value: "fast_food", label: "Fast Food", icon: <Pizza size={18} /> },
    { value: "bar", label: "Bars & Pubs", icon: <Beer size={18} /> },
  ];

  const cityOptions = [
    { value: "Paris", label: "Paris (75)", icon: <MapPin size={18} /> },
    { value: "Saint-Ouen", label: "Saint-Ouen (93)", icon: <MapPin size={18} /> },
    { value: "Neuilly", label: "Neuilly (92)", icon: <MapPin size={18} /> },
    { value: "Boulogne", label: "Boulogne (92)", icon: <MapPin size={18} /> },
    { value: "Versailles", label: "Versailles (78)", icon: <MapPin size={18} /> },
    { value: "IDF", label: "Île-de-France", icon: <MapPin size={18} /> },
  ];

  /* ================= RENDER & FILTRES ================= */
  const filtered = places
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => typeFilter === "all" ? true : p.type === typeFilter)
    .sort((a, b) => sort === "desc" ? b.rating - a.rating : a.rating - b.rating);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedPlaces = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [search, sort, typeFilter, location]);

  return (
    <div className="container">
      <div className="hero">
          <h1>Collection {cityOptions.find(c => c.value === location)?.label}</h1>
          <p>Données temps réel • Geoapify API</p>
      </div>

      <div className="filters-container">
        <div className="search-wrapper">
          <input 
            placeholder={`Rechercher à ${location}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <CustomSelect options={typeOptions} value={typeFilter} onChange={setTypeFilter} />
          <CustomSelect options={cityOptions} value={location} onChange={setLocation} />
          <div style={{minWidth: '200px'}}>
               <CustomSelect
                options={[
                    { value: "desc", label: "Note : Haute", icon: "⭐" },
                    { value: "asc", label: "Note : Basse", icon: "⭐" }
                ]}
                value={sort}
                onChange={setSort}
                />
            </div>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: "center", padding: "100px", color: "#002395"}}>
           <div className="spinner" style={{margin: '0 auto 20px'}}></div>
           <p>Connexion satellite en cours...</p>
        </div>
      ) : (
        <>
          <div className="grid">
            {paginatedPlaces.map(place => (
              <RestaurantCard key={place.id} place={place} />
            ))}
          </div>

          {filtered.length === 0 && (
             <p style={{textAlign:'center', marginTop: '40px'}}>Aucun lieu trouvé.</p>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({length: Math.min(5, totalPages)}, (_, i) => i + 1).map(page => (
                <button 
                  key={page} 
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'active' : ''}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}