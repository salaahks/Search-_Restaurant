import { useEffect, useState } from "react";
import { Utensils, Coffee, Pizza, Beer, MapPin, Layers, Search, Globe } from "lucide-react"; 
import RestaurantCard from "../components/RestaurantCard";
import CustomSelect from "../components/CustomSelect";

const ITEMS_PER_PAGE = 12;
const CACHE_DURATION = 1000 * 60 * 60 * 24; 

// Récupération sécurisée de la clé API
const API_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

export default function Restaurants() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- ETATS ---
  const [search, setSearch] = useState("");
  const [customCity, setCustomCity] = useState(""); 
  const [sort, setSort] = useState("desc");
  const [locationLabel, setLocationLabel] = useState("Paris (75)"); 
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // 1. LISTE PRÉDÉFINIE
  const PRESET_CITIES = {
    "Paris": "2.224,48.815,2.469,48.902",
    "Saint-Ouen": "2.318,48.895,2.350,48.915",
    "Neuilly": "2.252,48.877,2.288,48.895",
    "Puteaux": "2.225,48.870,2.250,48.890",
    "Courbevoie": "2.235,48.890,2.265,48.910",
    "Levallois": "2.270,48.885,2.300,48.905",
    "Boulogne": "2.224,48.825,2.256,48.847",
    "Versailles": "2.110,48.790,2.160,48.820",
    "IDF": "1.4,48.0,3.6,49.2"
  };

  const [currentBbox, setCurrentBbox] = useState(PRESET_CITIES["Paris"]);

  // --- LOGIQUE PRESET ---
  const handlePresetChange = (cityName) => {
    setLocationLabel(cityName);
    if (PRESET_CITIES[cityName]) {
        setCurrentBbox(PRESET_CITIES[cityName]);
        setCustomCity(""); 
    }
  };

  // --- LOGIQUE RECHERCHE VILLE ---
  const handleCustomSearch = (e) => {
    e.preventDefault();
    if (!customCity) return;

    setLoading(true);
    fetch(`https://api.geoapify.com/v1/geocode/search?text=${customCity}&apiKey=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          const result = data.features[0];
          const bbox = result.bbox.join(',');
          
          setCurrentBbox(bbox);
          setLocationLabel(result.properties.city || result.properties.name);
        } else {
          alert("Ville introuvable !");
          setLoading(false);
        }
      })
      .catch(err => setLoading(false));
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    setLoading(true);
    setPlaces([]); 

    const cacheKey = `cache_geo_${currentBbox}`; 
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log("⚡ Chargement cache");
        setPlaces(data);
        setLoading(false);
        setCurrentPage(1);
        return; 
      }
    }

    const categories = "catering.restaurant,catering.cafe,catering.fast_food,catering.bar,catering.pub";
    const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=rect:${currentBbox}&limit=60&apiKey=${API_KEY}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!data.features) { setLoading(false); return; }

        const cleanData = data.features.map(f => {
            const cats = f.properties.categories || [];
            let type = "restaurant";
            if (cats.includes("catering.cafe")) type = "cafe";
            if (cats.includes("catering.fast_food")) type = "fast_food";
            if (cats.includes("catering.bar") || cats.includes("catering.pub")) type = "bar";

            const cuisineRaw = cats.find(c => c.startsWith("catering.restaurant.")) || "";
            const cuisine = cuisineRaw.split('.').pop();

            return {
                id: f.properties.place_id,
                name: f.properties.name || f.properties.street || "Lieu sans nom",
                type: type, 
                cuisine: cuisine !== "restaurant" ? cuisine : null,
                lat: f.properties.lat,
                lon: f.properties.lon,
                rating: +(Math.random() * (5 - 3.5) + 3.5).toFixed(1)
            };
        }).filter(p => p.name !== "Lieu sans nom"); 

        localStorage.setItem(cacheKey, JSON.stringify({
          data: cleanData,
          timestamp: Date.now()
        }));

        setPlaces(cleanData);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch(err => setLoading(false));
  }, [currentBbox]);

  /* ================= OPTIONS UI ================= */
  const typeOptions = [
    { value: "all", label: "Tout voir", icon: <Layers size={18} /> },
    { value: "restaurant", label: "Restaurants", icon: <Utensils size={18} /> },
    { value: "cafe", label: "Cafés", icon: <Coffee size={18} /> },
    { value: "fast_food", label: "Fast Food", icon: <Pizza size={18} /> },
    { value: "bar", label: "Bars & Pubs", icon: <Beer size={18} /> },
  ];

  const citySelectOptions = [
    { value: "Paris", label: "Paris (75)", icon: <MapPin size={18} /> },
    { value: "Puteaux", label: "Puteaux (92)", icon: <MapPin size={18} /> },
    { value: "Courbevoie", label: "Courbevoie (92)", icon: <MapPin size={18} /> },
    { value: "Levallois", label: "Levallois (92)", icon: <MapPin size={18} /> },
    { value: "Neuilly", label: "Neuilly (92)", icon: <MapPin size={18} /> },
    { value: "Saint-Ouen", label: "Saint-Ouen (93)", icon: <MapPin size={18} /> },
    { value: "Boulogne", label: "Boulogne (92)", icon: <MapPin size={18} /> },
    { value: "Versailles", label: "Versailles (78)", icon: <MapPin size={18} /> },
    { value: "IDF", label: "Île-de-France", icon: <MapPin size={18} /> },
  ];

  const filtered = places
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => typeFilter === "all" ? true : p.type === typeFilter)
    .sort((a, b) => sort === "desc" ? b.rating - a.rating : a.rating - b.rating);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedPlaces = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [search, sort, typeFilter, currentBbox]);

  return (
    <div className="container">
      {/* On cache le gros titre sur mobile pour gagner de la place */}
      <div className="hero desktop-only">
          <h1>Collection {locationLabel}</h1>
          <p>Explorez les meilleures adresses sélectionnées.</p>
      </div>

      <div className="filters-container">
        
        {/* LIGNE 1 : RECHERCHE NOM (Prend toute la largeur) */}
        <div className="search-full">
          <input 
            placeholder={`Chercher un resto à ${locationLabel.split('(')[0]}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* LIGNE 2 : VILLE + RECHERCHE MANUELLE (Côte à côte) */}
        <div className="compact-row">
            <div style={{flex: 3}}> {/* Prend 70% de la largeur */}
                <CustomSelect 
                    options={citySelectOptions} 
                    value={citySelectOptions.find(c => c.value === locationLabel) ? locationLabel : ""} 
                    onChange={handlePresetChange} 
                    placeholder="Ville..."
                />
            </div>

            <form onSubmit={handleCustomSearch} className="mini-search-form" style={{flex: 2}}> {/* Prend 30% */}
                <input 
                    placeholder="Autre ville..."
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                />
                <button type="submit">
                    <Globe size={16} />
                </button>
            </form>
        </div>

        {/* LIGNE 3 : TYPE + NOTE (Côte à côte 50/50) */}
        <div className="compact-row">
            <div style={{flex: 1}}>
                <CustomSelect options={typeOptions} value={typeFilter} onChange={setTypeFilter} />
            </div>
            <div style={{flex: 1}}>
                <CustomSelect
                    options={[
                        { value: "desc", label: "Top", icon: "⭐" },
                        { value: "asc", label: "Flop", icon: "⭐" }
                    ]}
                    value={sort}
                    onChange={setSort}
                />
            </div>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: "center", padding: "80px", color: "#002395"}}>
           <div className="spinner" style={{margin: '0 auto 20px'}}></div>
           <p>Exploration en cours...</p>
        </div>
      ) : (
        <>
          <div className="grid">
            {paginatedPlaces.map(place => (
              <RestaurantCard key={place.id} place={place} />
            ))}
          </div>

          {filtered.length === 0 && (
             <p style={{textAlign:'center', marginTop: '40px'}}>Aucun résultat.</p>
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