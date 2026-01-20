export interface Lugar {
  id: string;
  nombre: string;
  descripcion: string;
  imagen?: string;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
  pais?: string;
  tipo?: string;
}

interface WikidataResponse {
  results: {
    bindings: Array<Record<string, { value: string }>>;
  };
}

const BASE_URL = 'https://query.wikidata.org/sparql';

// ✅ cards por página
const ITEMS_POR_PAGINA = 8;

// ✅ máximo resultados cuando se busca
const MAX_BUSQUEDA = 25;

// ✅ (opcional) máximo resultados en el listado inicial (sin buscar)
const MAX_LISTADO = 25;

function buildPageQuery(limit: number, offset: number) {
  return `
SELECT ?item ?itemLabel ?itemDescription ?image ?coordinate ?countryLabel
WHERE {
  ?item wdt:P31 wd:Q570116.
  OPTIONAL { ?item wdt:P18 ?image. }
  OPTIONAL { ?item wdt:P625 ?coordinate. }
  OPTIONAL { ?item wdt:P17 ?country. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
}
LIMIT ${limit}
OFFSET ${offset}
`;
}

function buildCountQuery() {
  // ✅ limita el total del listado inicial para que no salga “14572”
  return `
SELECT (COUNT(?item) AS ?total)
WHERE {
  {
    SELECT ?item WHERE {
      ?item wdt:P31 wd:Q570116.
    }
    LIMIT ${MAX_LISTADO}
  }
}
`;
}

function buildSearchQuery(searchTerm: string, limit: number, offset: number) {
  const safe = searchTerm.replace(/"/g, '\\"');
  return `
SELECT ?item ?itemLabel ?itemDescription ?image ?coordinate ?countryLabel
WHERE {
  ?item wdt:P31 wd:Q570116.
  ?item rdfs:label ?itemLabel.
  FILTER(LANG(?itemLabel) = "es" || LANG(?itemLabel) = "en")
  FILTER(REGEX(?itemLabel, "${safe}", "i")).
  OPTIONAL { ?item wdt:P18 ?image. }
  OPTIONAL { ?item wdt:P625 ?coordinate. }
  OPTIONAL { ?item wdt:P17 ?country. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
}
LIMIT ${limit}
OFFSET ${offset}
`;
}

function buildSearchCountQuery(searchTerm: string) {
  // ✅ limita el total de búsqueda a máximo 25
  const safe = searchTerm.replace(/"/g, '\\"');
  return `
SELECT (COUNT(?item) AS ?total)
WHERE {
  {
    SELECT ?item WHERE {
      ?item wdt:P31 wd:Q570116.
      ?item rdfs:label ?itemLabel.
      FILTER(LANG(?itemLabel) = "es" || LANG(?itemLabel) = "en")
      FILTER(REGEX(?itemLabel, "${safe}", "i")).
    }
    LIMIT ${MAX_BUSQUEDA}
  }
}
`;
}

async function fetchSparql<T>(query: string): Promise<T> {
  const url = new URL(BASE_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/sparql-results+json' },
  });

  if (!res.ok) throw new Error(`Wikidata error: ${res.status}`);
  return res.json();
}

function procesarCoordenadas(
  coordinateString?: string
): { latitud: number; longitud: number } | undefined {
  if (!coordinateString) return undefined;
  const match = coordinateString.match(/Point\(([^ ]+) ([^ ]+)\)/);
  if (!match) return undefined;

  return {
    longitud: parseFloat(match[1]),
    latitud: parseFloat(match[2]),
  };
}

function procesarResultados(data: WikidataResponse): Lugar[] {
  return data.results.bindings
    .map((b) => ({
      id: b.item?.value?.split('/').pop() || '',
      nombre: b.itemLabel?.value || 'Sin nombre',
      descripcion: b.itemDescription?.value || 'Sin descripción',
      imagen: b.image?.value || undefined,
      pais: b.countryLabel?.value || undefined,
      tipo: 'Lugar turístico',
      coordenadas: procesarCoordenadas(b.coordinate?.value),
    }))
    .filter((l) => l.id && l.nombre);
}

export const wikidataService = {
  // ✅ total del listado inicial (limitado a 25)
  async obtenerTotal(): Promise<number> {
    try {
      const data: any = await fetchSparql(buildCountQuery());
      return parseInt(data.results.bindings[0]?.total?.value ?? '0', 10);
    } catch (e) {
      console.error('obtenerTotal:', e);
      return 0;
    }
  },

  // ✅ listado inicial paginado (real con OFFSET)
  async obtenerLugaresPaginados(pagina: number): Promise<Lugar[]> {
    try {
      const offset = (pagina - 1) * ITEMS_POR_PAGINA;

      // para no pasarte de 25 en el listado inicial
      const restantes = MAX_LISTADO - offset;
      const limit = Math.min(ITEMS_POR_PAGINA, Math.max(restantes, 0));
      if (limit <= 0) return [];

      const data = await fetchSparql<WikidataResponse>(buildPageQuery(limit, offset));
      return procesarResultados(data);
    } catch (e) {
      console.error('obtenerLugaresPaginados:', e);
      return [];
    }
  },

  // ✅ total de búsqueda (limitado a 25)
  async obtenerTotalBusqueda(termino: string): Promise<number> {
    if (!termino.trim()) return 0;
    try {
      const data: any = await fetchSparql(buildSearchCountQuery(termino));
      return parseInt(data.results.bindings[0]?.total?.value ?? '0', 10);
    } catch (e) {
      console.error('obtenerTotalBusqueda:', e);
      return 0;
    }
  },

  // ✅ búsqueda paginada (real con OFFSET, máximo 25 resultados)
  async buscarLugaresPaginados(termino: string, pagina: number): Promise<Lugar[]> {
    if (!termino.trim()) return [];

    try {
      const maxPaginas = Math.ceil(MAX_BUSQUEDA / ITEMS_POR_PAGINA);
      const paginaSegura = Math.min(Math.max(pagina, 1), maxPaginas);

      const offset = (paginaSegura - 1) * ITEMS_POR_PAGINA;
      const restantes = MAX_BUSQUEDA - offset;
      const limit = Math.min(ITEMS_POR_PAGINA, Math.max(restantes, 0));
      if (limit <= 0) return [];

      const data = await fetchSparql<WikidataResponse>(
        buildSearchQuery(termino, limit, offset)
      );
      return procesarResultados(data);
    } catch (e) {
      console.error('buscarLugaresPaginados:', e);
      return [];
    }
  },
};
