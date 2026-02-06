// Curated list of unusual/obscure Spanish words for the game
// Each word has a fallback definition in case the dictionary API fails
export const WORDS: { word: string; fallback: string }[] = [
  { word: "petricor", fallback: "Olor que produce la lluvia al caer sobre la tierra seca." },
  { word: "acendrado", fallback: "Puro, sin mancha ni defecto." },
  { word: "efugio", fallback: "Evasiva, recurso para eludir una dificultad." },
  { word: "zangolotino", fallback: "Muchacho que pretende pasar por nino." },
  { word: "crasitud", fallback: "Gordura, grosura." },
  { word: "orate", fallback: "Persona que ha perdido el juicio." },
  { word: "baladron", fallback: "Fanfarron que presume de valiente sin serlo." },
  { word: "flocadura", fallback: "Guarnicion hecha de flecos." },
  { word: "garambaina", fallback: "Adorno de mal gusto o cosa superflua." },
  { word: "hacanea", fallback: "Jaca o caballo de tamano mediano y paso suave." },
  { word: "ignavia", fallback: "Pereza, flojedad, desidia." },
  { word: "jocundo", fallback: "Alegre, festivo, apacible." },
  { word: "libripens", fallback: "En el derecho romano, el que sostenia la balanza en ciertos actos." },
  { word: "mohatra", fallback: "Compra fingida o venta simulada que se hace con engano." },
  { word: "nefelibata", fallback: "Soñador que no se apercibe de la realidad." },
  { word: "opimo", fallback: "Rico, fertil, abundante." },
  { word: "pergeño", fallback: "Traza, disposicion o apariencia exterior." },
  { word: "regoldar", fallback: "Eructar." },
  { word: "sesteadero", fallback: "Lugar donde sestea el ganado." },
  { word: "tantaleo", fallback: "Relativo a Tantalo, que padece un suplicio semejante al suyo." },
  { word: "ubiquo", fallback: "Que esta presente a un mismo tiempo en todas partes." },
  { word: "venatorio", fallback: "Perteneciente o relativo a la caza." },
  { word: "zahurda", fallback: "Pocilga, lugar muy sucio." },
  { word: "aliquebrado", fallback: "Caido de alas, decaido de animo." },
  { word: "buciofalo", fallback: "Hombre necio, bobo." },
  { word: "corambre", fallback: "Conjunto de cueros o pellejos curtidos o sin curtir." },
  { word: "dendrologia", fallback: "Parte de la botanica que trata de los arboles." },
  { word: "ergotismo", fallback: "Abuso del silogismo o de la argumentacion." },
  { word: "filacteria", fallback: "Tira de pergamino con pasajes de la Escritura." },
  { word: "galimatias", fallback: "Lenguaje oscuro por la impropiedad de la frase o por la confusion de las ideas." },
  { word: "hermeneutica", fallback: "Arte de interpretar textos." },
  { word: "idiosincrasia", fallback: "Rasgos y caracter propios y distintivos de un individuo o una colectividad." },
  { word: "jergon", fallback: "Colchon de paja, esparto o hierbas sin bastas." },
  { word: "laceria", fallback: "Conjunto de lazos, especialmente como adorno arquitectonico." },
  { word: "melifluo", fallback: "Que tiene miel o es parecido a ella en sus propiedades." },
  { word: "nubil", fallback: "Dicho de una persona, en edad de contraer matrimonio." },
  { word: "obnubilar", fallback: "Ofuscar, obscurecer la razon." },
  { word: "palimpsesto", fallback: "Manuscrito antiguo que conserva huellas de una escritura anterior borrada artificialmente." },
  { word: "quimera", fallback: "Monstruo imaginario. Ilusion que se crea en la fantasia." },
  { word: "reticente", fallback: "Que no dice todo lo que podria o deberia decir." },
];

export function getRandomWord(usedWords: string[]): { word: string; fallback: string } | null {
  const available = WORDS.filter((w) => !usedWords.includes(w.word));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
