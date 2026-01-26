import React from "react";
import type { Lugar } from "../services/wikidataService";
import "../styles/ListadoLugares.css";

interface ListadoLugaresProps {
  lugares: Lugar[];
  onSeleccionar: (lugar: Lugar) => void;
  cargando: boolean;
}

export const ListadoLugares: React.FC<ListadoLugaresProps> = ({
  lugares,
  onSeleccionar,
  cargando,
}) => {
  if (cargando) return <div className="cargando">Cargando lugares...</div>;

  if (!lugares || lugares.length === 0) {
    return <div className="sin-resultados">No se encontraron lugares turísticos</div>;
  }

  return (
    <div className="listado-container">
      {lugares.map((lugar, index) => (
        <div
          key={`${lugar.id}-${index}`}
          className="lugar-card"
          onClick={() => onSeleccionar(lugar)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSeleccionar(lugar);
          }}
        >
          <div className="lugar-imagen">
            {lugar.imagen ? (
              <img src={lugar.imagen} alt={lugar.nombre} loading="lazy" />
            ) : (
              <div className="imagen-placeholder">
                <span>📍</span>
              </div>
            )}
          </div>

          <div className="lugar-contenido">
            <h3 className="lugar-titulo">{lugar.nombre}</h3>

            {lugar.pais && <p className="pais">🌍 {lugar.pais}</p>}

            <p className="descripcion">
              {lugar.descripcion?.substring(0, 100)}
              {lugar.descripcion && lugar.descripcion.length > 100 ? "..." : ""}
            </p>

            <button
              className="ver-mas"
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // ✅ evita doble click si luego haces modal
                onSeleccionar(lugar);
              }}
            >
              Ver más →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
