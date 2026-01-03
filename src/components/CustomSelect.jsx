import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({ options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);

  // Trouver l'option actuellement sélectionnée pour l'afficher
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div style={{ position: "relative", minWidth: "200px" }}>
      {/* --- LE BOUTON PRINCIPAL --- */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "#fff",
          border: isOpen ? "1px solid #002395" : "1px solid #e2e8f0", 
          cursor: "pointer",
          userSelect: "none",
          transition: "all 0.2s ease"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#0a0a0a" }}>
          {selectedOption ? (
            <>
              {/* On affiche l'icône et le label de la sélection */}
              <span style={{ color: "#002395" }}>{selectedOption.icon}</span>
              <span style={{ fontWeight: 500 }}>{selectedOption.label}</span>
            </>
          ) : (
            <span style={{ color: "#64748b" }}>{placeholder}</span>
          )}
        </div>
        <ChevronDown size={18} color="#64748b" />
      </div>

      {/* --- LA LISTE DÉROULANTE (Absolue) --- */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            width: "100%",
            background: "#fff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            zIndex: 1000,
            maxHeight: "300px",
            overflowY: "auto"
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                cursor: "pointer",
                background: option.value === value ? "#f8fafc" : "#fff",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = option.value === value ? "#f8fafc" : "#fff")
              }
            >
              {/* L'icône de l'option */}
              <span style={{ color: option.value === value ? "#002395" : "#64748b" }}>
                {option.icon}
              </span>
              
              <span style={{ flex: 1, fontSize: "0.95rem", color: "#333" }}>
                {option.label}
              </span>

              {/* Petit check si actif */}
              {option.value === value && <Check size={16} color="#002395" />}
            </div>
          ))}
        </div>
      )}
      
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999 }} 
        />
      )}
    </div>
  );
}