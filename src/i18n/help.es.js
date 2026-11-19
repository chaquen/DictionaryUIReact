/**
 * Spanish help catalog (FR-017). The UI stays in English and each key adds a
 * help line in Spanish. To add a language, copy this file (e.g. `help.pt.js`),
 * translate the values and register it in `languages.js`.
 *
 * Values are strings or functions of the variables passed by the screen
 * (`{ n }`, `{ pct }`…), so each language can handle its own plurals.
 * Comments give translators the English text or the context.
 */
const plural = (n, one, many) => (n === 1 ? one : many);

export default {
  // Navigation bar
  'nav.brand': 'Diccionario',
  'nav.home': 'Inicio',
  'nav.learn': 'Aprender',
  'nav.review': 'Repasar',
  'nav.words': 'Mis palabras',
  'nav.search': 'Buscar',
  'nav.lab': 'Laboratorio',

  // Home: vocabulary path card
  'home.path.start': 'Descubre tu nivel y recibe primero las palabras más útiles.',
  'home.path.remaining': ({ n }) => plural(n, 'Hoy te espera 1 palabra nueva.', `Hoy te esperan ${n} palabras nuevas.`),
  'home.path.done': 'Ya cumpliste tu meta de palabras nuevas de hoy.',
  'home.path.startButton': 'Empezar a aprender', // "Start learning"
  'home.path.learnButton': 'Aprender palabras nuevas', // "Learn new words"
  // Home: collection and review
  'home.empty': 'Guarda palabras mientras buscas y aparecerán aquí para repasarlas.',
  'home.searchFirst': 'Busca tu primera palabra', // button "Search your first word"
  'home.review.due': ({ n }) => plural(n, 'Tienes 1 palabra para repasar hoy.', `Tienes ${n} palabras para repasar hoy.`),
  'home.review.none': 'Estás al día. No hay palabras para repasar ahora.',
  'home.review.start': 'Empezar repaso', // button "Start review"
  // Home: game progress
  'home.streakLost': 'Tu racha terminó. ¡Estudia hoy para empezar una nueva!',
  'home.streak': 'Racha (días seguidos estudiando)',
  'home.streak.keep': 'Estudia hoy para mantener tu racha.',
  'home.level': ({ level }) => `Nivel ${level} (XP = puntos de experiencia)`,
  'home.achievements': 'Logros',

  // Achievements (keys come from `ACHIEVEMENTS` in domain/gamification.js)
  'achievement.first-word': 'Primera palabra: guarda tu primera palabra',
  'achievement.ten-words': 'Coleccionista: guarda 10 palabras',
  'achievement.first-review': 'Primer repaso: completa tu primer repaso',
  'achievement.fifty-reviews': 'Constancia: completa 50 repasos',
  'achievement.perfect-ten': 'Buena memoria: recuerda 10 palabras seguidas',
  'achievement.streak-3': 'En racha: 3 días seguidos',
  'achievement.streak-7': 'Hábito: 7 días seguidos',

  // Learn (/learn)
  'learn.title': 'Aprende palabras nuevas',
  'learn.today': ({ n, quota }) =>
    `Hoy: ${n} ${plural(n, 'palabra nueva', 'palabras nuevas')} (meta diaria: ${quota}). Las palabras que aprendes pasan a tus repasos.`,
  'learn.rank': ({ rank }) => `la n.º ${rank} más usada`, // badge "#701 most common"
  'learn.noDefinition': 'No hay una definición sencilla para esta palabra.',
  'learn.moreMeanings': 'Más significados y ejemplos',
  'learn.example': 'Ejemplo de uso',
  'learn.learnIt': 'La aprendo', // button "Learn it": save it and review it later
  'learn.knowIt': 'Ya la sé', // button "I know it": skip it
  'learn.doneToday': '¡Listo por hoy! Vuelve mañana por más palabras o sigue ahora.',
  'learn.moreButton': 'Aprender 5 más',
  'learn.listDone': 'Recorriste toda la lista. ¡Impresionante!',
  'learn.loadError': 'No se pudo cargar la lista de palabras.',
  'learn.goal': ({ pct, goal }) => `Meta de lectura: ${pct} / ${goal} palabras`,
  'learn.coverage': ({ pct, goal }) =>
    `Conoces ${pct} de cada 100 palabras de un texto común en inglés. Con ${goal} puedes leer con comodidad.`,
  'learn.sentence': 'En una frase común entenderías:',
  'learn.coverage.why': 'Palabras cortas como "the" e "is" se repiten mucho, por eso al principio el número sube rápido.',
  // Placement test
  'placement.title': '¿Cuáles de estas palabras conoces?',
  'placement.instructions': ({ step, total }) =>
    `Toca las palabras cuyo significado conoces. Así sabremos dónde empieza tu ruta (${step} de ${total}).`,
  'placement.next': 'Siguiente',
  'placement.skip': 'Saltar: empezar con las palabras más comunes',

  // Review (/review)
  'review.noWords': 'Aún no tienes palabras guardadas. Busca y guarda algunas para empezar a repasar.',
  'review.allDone': '¡Estás al día!',
  'review.summary': ({ n, correct }) => `Repasaste ${n} ${plural(n, 'palabra', 'palabras')} y recordaste ${correct}.`,
  'review.next': ({ date }) => `Próximo repaso: ${date}`,
  'review.noneScheduled': 'No hay repasos programados.',
  'review.left': ({ n, done }) => `Quedan ${n}${done ? ` · ${done} hechas` : ''}`,
  'review.question': '¿Recuerdas qué significa? Califícate, o mira primero la respuesta.',
  'review.showAnswer': 'Ver respuesta',
  'review.sayFirst': 'Primero di la palabra en voz alta para calificarte.',
  'review.allMeanings': 'Todos los significados',
  'review.noDefinition': 'No hay definiciones disponibles.',
  // Grades (keys come from `GRADES` in domain/scheduling/grades.js)
  'grade.1': 'Otra vez (la olvidé)',
  'grade.2': 'Difícil',
  'grade.3': 'Bien',
  'grade.4': 'Fácil',

  // My words (/words)
  'words.empty': 'Aún no has guardado ninguna palabra.',
  'words.details': 'Detalles',
  'words.more': ({ n }) => `+${n} ${plural(n, 'definición', 'definiciones')} más`,

  // Search (/search)
  'search.hint': 'Escribe una palabra en inglés y pulsa Search.',
  'search.button': 'Buscar',
  'search.empty': 'Escribe una palabra para buscar.',
  'search.notFound': 'No encontramos esa palabra en el diccionario. Revisa cómo se escribe.',
  'search.error': 'Hubo un problema con el diccionario. Inténtalo de nuevo en un momento.',
  'search.saveError': 'No se pudieron guardar o cargar tus palabras.',

  // Word details
  'word.save': 'Guardar palabra',
  'word.saved': 'Guardada (pulsa para quitarla)',
  'word.synonyms': 'Sinónimos (significan lo mismo)',
  'word.antonyms': 'Antónimos (significan lo contrario)',
  'word.close': 'Cerrar',
  // Parts of speech (optional: shown when the dictionary uses one of these)
  'pos.noun': 'sustantivo',
  'pos.verb': 'verbo',
  'pos.adjective': 'adjetivo',
  'pos.adverb': 'adverbio',
  'pos.pronoun': 'pronombre',
  'pos.preposition': 'preposición',
  'pos.conjunction': 'conjunción',
  'pos.interjection': 'interjección',
  'pos.determiner': 'determinante',
  'pos.article': 'artículo',
  'pos.numeral': 'numeral',

  // Word image (Wikimedia)
  'image.another': 'Otra imagen',

  // Pronunciation practice (#2)
  'say.button': 'Dilo en voz alta',
  'say.again': 'Intentar de nuevo',
  'say.listening': ({ term }) => `Escuchando… di "${term}"`,
  'say.installing': 'Descargando el modelo de voz…',
  'say.correct': '¡Bien dicho! Se entendió la palabra.',
  'say.wrong': 'No se entendió la palabra. Escúchala y vuelve a intentarlo.',
  'say.cloud': 'En este navegador tu voz se envía a Google para reconocerla.',
  'say.error.mic': 'Permite el uso del micrófono para practicar.',
  'say.error.noMic': 'No se encontró un micrófono.',
  'say.error.silence': 'No se oyó nada. Inténtalo de nuevo.',
  'say.error.network': 'En este navegador el reconocimiento de voz necesita conexión.',
  'say.error.install': 'El reconocimiento en el equipo no está disponible aquí. Pulsa de nuevo para usar el servicio de Google.',
  'say.error.generic': 'Algo salió mal. Inténtalo de nuevo.',

  // Pronunciation aids (phonetics)
  'phonetic.sayLike': ({ text }) => `Se pronuncia más o menos: ${text}`,
  'phonetic.slow': 'Escuchar lento',
  'say.diff.change': ({ target, heard, where }) => `Di /${target}/ en lugar de /${heard}/ ${where}.`,
  'say.diff.missing': ({ target, where }) => `Te faltó el sonido /${target}/ ${where}.`,
  'say.diff.extra': ({ heard, where }) => `Sobra el sonido /${heard}/ ${where}.`,
  'say.compare': 'Compara tu voz con la grabación:',
  'say.yourVoice': 'Tu voz',
  'say.native': 'Nativo',
  // Sound tips (keys come from SOUND_TIPS in domain/phonetics.js)
  'sound.ae': 'Abre la boca como para decir "a", pero di "e". Está entre las dos.',
  'sound.uh': 'Una "a" corta y relajada, con la boca medio abierta.',
  'sound.schwa': 'Una vocal débil y muy corta, como una "e" perezosa. Nunca lleva acento.',
  'sound.ih': 'Una "i" corta y relajada, entre "i" y "e".',
  'sound.ee': 'Una "i" larga: sonríe y sostenla.',
  'sound.oo': 'Una "u" corta y relajada, con los labios apenas redondeados.',
  'sound.ooo': 'Una "u" larga: redondea los labios y sostenla.',
  'sound.er': 'Como una "e" con la lengua hacia atrás, casi "er", sin hacer vibrar la r.',
  'sound.th': 'Lengua entre los dientes y sopla, como la "z" de España.',
  'sound.dh': 'Lengua entre los dientes con voz, como una "d" suave ("nada").',
  'sound.sh': 'Como cuando pides silencio: "shh".',
  'sound.zh': 'Como "sh" pero con voz, como en "measure".',
  'sound.h': 'Un soplo suave, mucho más suave que la "j" española.',
  'sound.v': 'Dientes de arriba sobre el labio de abajo, con voz. No suena como "b".',
  'sound.z': 'Una "s" con zumbido, con voz, como una abeja.',
  'sound.r': 'La lengua no toca el paladar. Nunca vibra.',
  'sound.ng': 'Como la "n" de "tengo", desde atrás. La "g" no se oye.',
  'sound.j': 'Como una "y" fuerte con una "d" antes: "dy".',
  'sound.w': 'Redondea los labios como para "u" y ábrelos rápido.',

  // Translation help
  'translate.show': ({ language }) => `Ver en ${language}`, // "Show in Spanish"
  'translate.downloading': ({ pct }) => `Descargando el traductor ${pct} %…`,
  'translate.working': 'Traduciendo…',
  'translate.unavailable': 'Este navegador no puede traducir. Prueba con Chrome de escritorio.',
  'translate.failed': 'No se pudo traducir ahora. Inténtalo de nuevo.',

  // Ideas switched off
  'idea.disabled': ({ title }) => `"${title}" está desactivada. Puedes activarla de nuevo en el Laboratorio.`,
  // Ideas (keys come from `IDEAS` in domain/ideas.js)
  'idea.learn': 'Ruta de vocabulario esencial: palabras nuevas cada día, las más útiles primero',
  'idea.review': 'Repaso espaciado: repasa tus palabras justo antes de olvidarlas',
  'idea.gamification': 'Mecánicas de juego: rachas, puntos de experiencia, niveles y logros',
  'idea.pronunciation': 'Pronunciación: di la palabra en voz alta y descubre si se entendió',
  'idea.images': 'Imágenes: un pictograma que muestra el significado de sustantivos y verbos',
  'idea.translation': 'Ayuda de traducción: traducción opcional de palabras y definiciones en tu equipo',

  // Lab (/lab)
  'lab.title': 'Laboratorio',
  'lab.intro': 'Activa o desactiva ideas y compara cuánto te ayudan a aprender. Tus datos se quedan en este navegador.',
  'lab.ideas': 'Ideas',
  'lab.algorithm': 'Algoritmo de repaso',
  'lab.algorithm.note': 'Se aplica a las palabras que guardes desde ahora. Las existentes conservan su algoritmo.',
  'lab.newWords': 'Palabras nuevas por día',
  'lab.helpLanguage': 'Idioma de ayuda',
  'lab.helpLanguage.note': 'Las instrucciones siguen en inglés; aquí eliges el idioma de la línea de ayuda.',
  'lab.device': 'Este equipo',
  'lab.device.speech': 'Reconocimiento de voz',
  'lab.device.mic': 'Micrófono',
  'lab.device.ai': 'IA en el equipo',
  'lab.usage': 'Uso por idea',
  'lab.noActivity': 'Aún no hay actividad.',
  'lab.quality': 'Calidad del repaso',
  'lab.export': 'Exportar datos (JSON)',
  'lab.exported': ({ n }) => `Se exportaron ${n} eventos.`,
  'lab.exportFailed': 'Este navegador no puede descargar archivos.',
  // Algorithms (keys come from `STRATEGIES` in domain/scheduling)
  'strategy.fsrs6': 'Modelo de memoria adaptativo; el más preciso en el benchmark abierto de repaso espaciado.',
  'strategy.leitner': '5 cajas que se repasan cada 1, 2, 4, 8 y 16 días. Simple y predecible.',
};
