import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{
      height: "100vh", /* Prend tout l'écran */
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      background: "radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)" /* Léger dégradé subtil */
    }}>
      
      {/* Titre Géant */}
      <h1 style={{ fontSize: "5rem", marginBottom: "10px", color: "#0a0a0a" }}>
        Viens Manger
      </h1>

      {/* Sous-titre élégant */}
      <p style={{ 
        fontSize: "1.2rem", 
        marginBottom: "50px", 
        color: "#64748b",
        fontFamily: '"Playfair Display", serif',
        fontStyle: "italic"
      }}>
        Trouvez l'exceptionnel, près de chez vous.
      </p>

      {/* LE BOUTON MANQUANT (Style Royal Blue) */}
      <Link 
        to="/restaurants" 
        style={{
          padding: "18px 50px",
          backgroundColor: "#002395", /* Bleu Roi */
          color: "white",
          textDecoration: "none",
          fontSize: "1rem",
          letterSpacing: "3px",
          textTransform: "uppercase",
          fontWeight: "600",
          transition: "0.3s",
          boxShadow: "0 20px 40px -10px rgba(0, 35, 149, 0.4)" /* Ombre portée luxe */
        }}
        onMouseOver={(e) => e.target.style.transform = "translateY(-3px)"}
        onMouseOut={(e) => e.target.style.transform = "translateY(0px)"}
      >
        Explorer la collection
      </Link>

    </div>
  );
}