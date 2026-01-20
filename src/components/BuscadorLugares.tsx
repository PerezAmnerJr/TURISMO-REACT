import { useEffect, useState } from 'react';
import '../styles/BuscadorLugares.css';

interface BuscadorLugaresProps {
  onBuscar: (termino: string) => void;
  cargando: boolean;
}

export function BuscadorLugares({ onBuscar, cargando }: BuscadorLugaresProps) {
  const [valor, setValor] = useState('');

  // ✅ Debounce: espera 500ms después de dejar de escribir
  useEffect(() => {
    const id = setTimeout(() => {
      onBuscar(valor);
    }, 500);

    return () => clearTimeout(id);
  }, [valor, onBuscar]);

  return (
    <div className="buscador-wrapper">
      <div className="buscador-input-container">
        <input
          className="buscador-input"
          type="text"
          placeholder="Busca un lugar turístico..."
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          // ❌ NO lo deshabilites, si no te deja escribir
          disabled={false}
        />

        {valor.length > 0 && (
          <button
            type="button"
            className="buscador-clear"
            onClick={() => setValor('')}
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}

        <span className="buscador-icon" aria-hidden="true">
          🔍
        </span>
      </div>

      {/* ✅ Solo mostramos cargando como texto, sin bloquear el input */}
      {cargando && <div className="buscador-loading">Buscando...</div>}
    </div>
  );
}
