import type { Lugar } from '../services/wikidataService';
import '../styles/ListadoLugares.css';

interface ListadoLugaresProps {
  lugares: Lugar[];
  onSeleccionar: (lugar: Lugar) => void;
  cargando: boolean;
}

export function ListadoLugares({
  lugares,
  onSeleccionar,
  cargando,
}: ListadoLugaresProps) {
  if (cargando) {
    return <div className="cargando">Cargando lugares...</div>;
  }

  if (lugares.length === 0) {
    return <div className="sin-resultados">No se encontraron lugares turísticos</div>;
  }

  return (
    <div className="listado-container">
      {lugares.map((lugar) => (
        <div
          key={lugar.id}
          className="lugar-card"
          onClick={() => onSeleccionar(lugar)}
        >
          <div className="lugar-imagen">
            {lugar.imagen ? (
              <img src={lugar.imagen} alt={lugar.nombre} />
            ) : (
              <div className="imagen-placeholder">
                <span>📍</span>
              </div>
            )}
          </div>

          <div className="lugar-contenido">
            <h3>{lugar.nombre}</h3>
            {lugar.pais && <p className="pais">🌍 {lugar.pais}</p>}

            <p className="descripcion">
              {lugar.descripcion.substring(0, 100)}
              {lugar.descripcion.length > 100 ? '...' : ''}
            </p>

            <button className="ver-mas" type="button">
              Ver más →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
