import { useEffect, useState, useCallback } from 'react';
import { wikidataService } from './services/wikidataService';
import type { Lugar } from './services/wikidataService';
import { ListadoLugares } from './components/ListadoLugares';
import { BuscadorLugares } from './components/BuscadorLugares';
import { Paginacion } from './components/Paginacion';
import { DetallelugarAr } from './components/Detallelugar';
import AnimatedBackground from './components/AnimatedBackground';
import BlurText from "./components/BlurText";
import { motion } from "framer-motion";

import './App.css';

const ITEMS_POR_PAGINA = 8;

export default function App() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [cargando, setCargando] = useState(true);

  // paginación real: total viene del COUNT
  const [totalItems, setTotalItems] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);

  // detalle
  const [lugarSeleccionado, setLugarSeleccionado] = useState<Lugar | null>(null);

  // búsqueda
  const [termino, setTermino] = useState('');

  // cargar primera página + total inicial
  useEffect(() => {
    const cargarInicial = async () => {
      setCargando(true);

      const total = await wikidataService.obtenerTotal();
      setTotalItems(total);

      const datos = await wikidataService.obtenerLugaresPaginados(1);
      setLugares(datos);

      setPaginaActual(1);
      setCargando(false);
    };

    cargarInicial();
  }, []);

  // cambiar página (OFFSET real)
  const cambiarPagina = useCallback(
    async (nuevaPagina: number) => {
      if (nuevaPagina < 1) return;

      setCargando(true);
      setPaginaActual(nuevaPagina);

      if (termino.trim()) {
        const datos = await wikidataService.buscarLugaresPaginados(termino, nuevaPagina);
        setLugares(datos);
      } else {
        const datos = await wikidataService.obtenerLugaresPaginados(nuevaPagina);
        setLugares(datos);
      }

      setCargando(false);
    },
    [termino]
  );

  // buscar (paginación real)
  const handleBuscar = useCallback(async (nuevoTermino: string) => {
    const t = nuevoTermino.trim();

    setTermino(nuevoTermino);
    setPaginaActual(1);
    setLugarSeleccionado(null);

    setCargando(true);

    if (!t) {
      // volver al listado normal
      const total = await wikidataService.obtenerTotal();
      setTotalItems(total);

      const datos = await wikidataService.obtenerLugaresPaginados(1);
      setLugares(datos);

      setCargando(false);
      return;
    }

    // total de resultados de la búsqueda (en tu servicio ya está limitado a 25)
    const totalBusqueda = await wikidataService.obtenerTotalBusqueda(t);
    setTotalItems(totalBusqueda);

    // primera página de búsqueda
    const datos = await wikidataService.buscarLugaresPaginados(t, 1);
    setLugares(datos);

    setCargando(false);
  }, []);

  const totalPaginas = Math.ceil(totalItems / ITEMS_POR_PAGINA);

  return (
    <>
      {/* ✅ Fondo animado (queda detrás) */}
      <AnimatedBackground />

      <div className="app-container">
        <header className="app-header">
 <h1 className="titulo-header">
  <motion.span
    style={{ display: "inline-block" }}
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
  >
    🌍
  </motion.span>
  Descubre Lugares Turísticos
</h1>


  <p>
    <BlurText
      text="Explora los destinos más interesantes del mundo."
      delay={0.6}
      className="subtitulo"
    />
  </p>
</header>


        <main className="app-main">
          <BuscadorLugares onBuscar={handleBuscar} cargando={cargando} />

          <section className="resultados-info">
            <p>
              {totalItems > 0
                ? `Se encontraron ${totalItems} lugares turísticos`
                : 'Sin resultados'}
            </p>
          </section>

          <ListadoLugares
            lugares={lugares}
            onSeleccionar={setLugarSeleccionado}
            cargando={cargando}
          />

          {totalPaginas > 1 && (
            <Paginacion
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onCambiarPagina={cambiarPagina}
            />
          )}
        </main>

        <DetallelugarAr
          lugar={lugarSeleccionado}
          onCerrar={() => setLugarSeleccionado(null)}
        />
      </div>
    </>
  );
}
