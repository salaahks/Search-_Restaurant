import { useEffect, useState } from "react";
// Import des icônes Lucide
import { Utensils, Coffee, Pizza, Beer, MapPin, Layers } from "lucide-react"; 
import RestaurantCard from "../components/RestaurantCard";
import CustomSelect from "../components/CustomSelect";

const ITEMS_PER_PAGE = 12;

export default function Restaurants() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- ETATS DES FILTRES ---
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc");
  const [location, setLocation] = useState("Paris"); // Valeur par défaut
  const [typeFilter, setTypeFilter] = useState("all");
  
  const [currentPage, setCurrentPage] = useState(1);

  /* ================= CONFIGURATION DES ZONES GPS ================= */
  // Pour chaque ville, on définit une "Bounding Box" (Sud, Ouest, Nord, Est)
  const cityCoordinates = {
    "Paris": "(48.815,2.224,48.902,2.469)",
    "Saint-Ouen": "(48.895,2.318,48.915,2.350)",   
    "Neuilly": "(48.877,2.252,48.895,2.288)",       
    "Boulogne": "(48.825,2.224,48.847,2.256)",      
    "Versailles": "(48.790,2.110,48.820,2.160)",   
    "IDF": "(48.0,1.4,49.2,3.6)"                     
  };

  /* ================= FETCH API ================= */
  useEffect(() => {
    setLoading(true);
    setPlaces([]); 

    // On récupère les coordonnées de la ville choisie
    const bbox = cityCoordinates[location] || cityCoordinates["Paris"];

    // Requête API Overpass
    fetch(
      `https://overpass-api.de/api/interpreter?data=[out:json];node['amenity'~'restaurant|cafe|fast_food|bar|pub']${bbox};out;`
    )
      .then(res => res.json())
      .then(data => {
        if (!data.elements) return;

        const cleanData = data.elements
          .filter(p => p.tags?.name)
          .map(p => ({
            id: p.id,
            name: p.tags.name,
            type: p.tags.amenity, 
            cuisine: p.tags.cuisine,
            // Note aléatoire pour la démo
            rating: +(Math.random() * (5 - 3.5) + 3.5).toFixed(1)
          }));

        setPlaces(cleanData);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [location]); // Se relance quand 'location' change

  /* ================= OPTIONS DES MENUS ================= */
  const typeOptions = [
    { value: "all", label: "Tout voir", icon: <Layers size={18} /> },
    { value: "restaurant", label: "Restaurants", icon: <Utensils size={18} /> },
    { value: "cafe", label: "Cafés", icon: <Coffee size={18} /> },
    { value: "fast_food", label: "Fast Food", icon: <Pizza size={18} /> },
    { value: "bar", label: "Bars & Pubs", icon: <Beer size={18} /> },
  ];

  // ICI : On ajoute tes villes avec départements
  const cityOptions = [
    { value: "Paris", label: "Paris (75)", icon: <MapPin size={18} /> },
    { value: "Saint-Ouen", label: "Saint-Ouen (93)", icon: <MapPin size={18} /> },
    { value: "Neuilly", label: "Neuilly-sur-Seine (92)", icon: <MapPin size={18} /> },
    { value: "Boulogne", label: "Boulogne-Billancourt (92)", icon: <MapPin size={18} /> },
    { value: "Versailles", label: "Versailles (78)", icon: <MapPin size={18} /> },
    { value: "IDF", label: "Île-de-France (Tout)", icon: <MapPin size={18} /> },
  ];

  /* ================= FILTRAGE CLIENT ================= */
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

  /* ================= RENDER ================= */
  return (
    <div className="container">
      <div className="hero">
          <h1>Collection {cityOptions.find(c => c.value === location)?.label}</h1>
          <p>Explorez les meilleures adresses sélectionnées pour vous.</p>
      </div>

      <div className="filters-container">
        
        {/* Recherche */}
        <div className="search-wrapper">
          <input 
            placeholder={`Rechercher à ${location}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtres */}
        <div className="filters-group">
          
          <CustomSelect 
            options={typeOptions} 
            value={typeFilter} 
            onChange={setTypeFilter} 
          />

          {/* SÉLECTEUR DE VILLE MIS À JOUR */}
          <CustomSelect 
            options={cityOptions} 
            value={location} 
            onChange={setLocation} 
          />

          {/* Options de tri simple */}
           <div style={{minWidth: '200px'}}> {/* Wrapper pour aligner si besoin */}
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
        <div style={{textAlign: "center", padding: "50px", color: "#002395", fontSize: "1.2rem"}}>
           Recherche des adresses à {location}...
        </div>
      ) : (
        <>
          <div className="grid">
            {paginatedPlaces.map(place => (
              <RestaurantCard key={place.id} place={place} />
            ))}
          </div>

          {filtered.length === 0 && (
             <p style={{textAlign:'center', marginTop: '40px'}}>
               Aucun lieu trouvé à {location}. Essayez une autre catégorie.
             </p>
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