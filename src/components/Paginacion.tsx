import React from 'react';
import '../styles/Paginacion.css';

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
}

export const Paginacion: React.FC<PaginacionProps> = ({
  paginaActual,
  totalPaginas,
  onCambiarPagina,
}) => {
  const paginas: number[] = [];
  const ventana = 2;

  // Primera página
  paginas.push(1);

  // Páginas alrededor de la actual
  for (
    let i = Math.max(2, paginaActual - ventana);
    i <= Math.min(totalPaginas - 1, paginaActual + ventana);
    i++
  ) {
    if (!paginas.includes(i)) {
      paginas.push(i);
    }
  }

  // Última página
  if (totalPaginas > 1 && !paginas.includes(totalPaginas)) {
    paginas.push(totalPaginas);
  }

  return (
    <div className="paginacion-container">
      <button
        onClick={() => onCambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="paginacion-btn"
      >
        ← Anterior
      </button>

      <div className="paginacion-numeros">
        {paginas.map((pagina, index) => {
          const esSalto =
            index > 0 && paginas[index - 1] !== pagina - 1;
          return (
            <React.Fragment key={pagina}>
              {esSalto && <span className="paginacion-salto">...</span>}
              <button
                onClick={() => onCambiarPagina(pagina)}
                className={`paginacion-numero ${
                  pagina === paginaActual ? 'activa' : ''
                }`}
              >
                {pagina}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <button
        onClick={() => onCambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="paginacion-btn"
      >
        Siguiente →
      </button>
    </div>
  );
};
