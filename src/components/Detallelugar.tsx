import type { Lugar } from '../services/wikidataService';
import '../styles/DetallelugarAr.css';

interface DetallelugarArProps {
  lugar: Lugar | null;
  onCerrar: () => void;
}

export function DetallelugarAr({ lugar, onCerrar }: DetallelugarArProps) {
  if (!lugar) return null;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <button className="modal-cerrar" onClick={onCerrar}>
          ✕
        </button>

        {lugar.imagen && (
          <img src={lugar.imagen} alt={lugar.nombre} className="modal-imagen" />
        )}

        <div className="modal-cuerpo">
          <h1>{lugar.nombre}</h1>

          <div className="modal-info">
            {lugar.pais && (
              <div className="info-item">
                <span className="info-label">País:</span>
                <span className="info-valor">🌍 {lugar.pais}</span>
              </div>
            )}

            {lugar.tipo && (
              <div className="info-item">
                <span className="info-label">Tipo:</span>
                <span className="info-valor">{lugar.tipo}</span>
              </div>
            )}

            {lugar.coordenadas && (
              <div className="info-item">
                <span className="info-label">Ubicación:</span>
                <span className="info-valor">
                  📍 {lugar.coordenadas.latitud.toFixed(4)},{' '}
                  {lugar.coordenadas.longitud.toFixed(4)}
                </span>
              </div>
            )}
          </div>

          <div className="modal-descripcion">
            <h2>Descripción</h2>
            <p>{lugar.descripcion}</p>
          </div>

          <a
            href={`https://www.wikidata.org/wiki/${lugar.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="modal-enlace"
          >
            Ver en Wikidata →
          </a>
        </div>
      </div>
    </div>
  );
}
