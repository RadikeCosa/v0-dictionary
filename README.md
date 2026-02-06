# 📚 Diccionario - Juego Multijugador

Un juego multijugador en línea donde los jugadores ponen a prueba su creatividad y habilidad para engañar. Inspirado en el clásico juego "Fictionary" o "Balderdash", los jugadores deben inventar definiciones convincentes para palabras poco comunes y adivinar cuál es la definición real.

## 🎮 ¿Cómo se juega?

1. **Crear o unirse a una sala**: El anfitrión crea una sala y comparte el código con otros jugadores
2. **Fase de escritura**: Cada ronda, se presenta una palabra poco común. Todos los jugadores escriben una definición falsa pero convincente
3. **Fase de votación**: Los jugadores leen todas las definiciones (incluyendo la real) y votan por la que creen es correcta
4. **Puntuación**: 
   - Ganas puntos si otros jugadores votan por tu definición falsa
   - Ganas puntos si adivinas la definición correcta
5. **Ganador**: Al final de todas las rondas, gana el jugador con más puntos

## ✨ Características

- 🎲 **Multijugador en tiempo real**: Juega con amigos usando un código de sala
- 📝 **Definiciones creativas**: Pon a prueba tu ingenio inventando definiciones convincentes
- 🏆 **Sistema de puntuación**: Gana puntos por engañar a otros y por adivinar correctamente
- 🎨 **Interfaz moderna**: Diseño limpio y responsivo con Tailwind CSS
- 🌙 **Modo oscuro**: Soporte para tema oscuro/claro
- 📊 **Tabla de puntuaciones**: Seguimiento en tiempo real de los puntos de cada jugador
- 🔄 **Múltiples rondas**: Configura el número de rondas al crear la sala

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 16](https://nextjs.org/) con App Router
- **UI**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes**: [Radix UI](https://www.radix-ui.com/)
- **Base de datos**: [Neon](https://neon.tech/) (PostgreSQL serverless)
- **Gestión de paquetes**: [pnpm](https://pnpm.io/)

## 📋 Requisitos Previos

- Node.js 18+ instalado
- pnpm instalado (o npm/yarn)
- Cuenta en [Neon](https://neon.tech/) para la base de datos

## 🚀 Instalación

1. **Clona el repositorio**:
```bash
git clone <url-del-repositorio>
cd v0-dictionary
```

2. **Instala las dependencias**:
```bash
pnpm install
```

3. **Configura las variables de entorno**:

Crea un archivo `.env.local` en la raíz del proyecto:

```env
DATABASE_URL=tu_url_de_neon_aqui
```

Para obtener tu `DATABASE_URL`:
- Crea una cuenta en [Neon](https://neon.tech/)
- Crea un nuevo proyecto
- Copia la cadena de conexión (connection string)

4. **Configura la base de datos**:

Ejecuta el script SQL para crear las tablas necesarias:

```bash
# Puedes ejecutar el archivo setup-database.sql directamente en el dashboard de Neon
# O ejecutar el script proporcionado:
pnpm tsx scripts/setup-database.ts
```

El script creará las siguientes tablas:
- `rooms`: Salas de juego
- `players`: Jugadores
- `rounds`: Rondas de cada partida
- `definitions`: Definiciones escritas por los jugadores
- `votes`: Votos de los jugadores

## 🎯 Uso

1. **Inicia el servidor de desarrollo**:
```bash
pnpm dev
```

2. **Abre el navegador**:
Visita [http://localhost:3000](http://localhost:3000)

3. **Crear una sala**:
   - Ingresa tu nombre
   - Haz clic en "Crear Sala"
   - Configura el número de rondas
   - Comparte el código de sala con tus amigos

4. **Unirse a una sala**:
   - Ingresa tu nombre
   - Ingresa el código de sala
   - Haz clic en "Unirse"

5. **¡A jugar!**:
   - Espera a que todos los jugadores se unan
   - El anfitrión inicia la partida
   - Sigue las instrucciones en pantalla para cada fase

## 📁 Estructura del Proyecto

```
v0-dictionary/
├── app/                      # App Router de Next.js
│   ├── api/                  # Rutas API
│   │   └── rooms/            # Endpoints de salas y juego
│   ├── sala/                 # Páginas de salas
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Página de inicio
├── components/               # Componentes React
│   ├── game/                 # Componentes del juego
│   │   ├── home-screen.tsx   # Pantalla inicial
│   │   ├── waiting-room.tsx  # Sala de espera
│   │   ├── writing-phase.tsx # Fase de escritura
│   │   ├── voting-phase.tsx  # Fase de votación
│   │   ├── results-phase.tsx # Resultados de ronda
│   │   └── game-over.tsx     # Fin del juego
│   └── ui/                   # Componentes UI reutilizables
├── lib/                      # Utilidades y lógica
│   ├── db.ts                 # Conexión a base de datos
│   ├── types.ts              # Tipos TypeScript
│   ├── words.ts              # Palabras y definiciones
│   └── use-game.ts           # Hook personalizado del juego
├── scripts/                  # Scripts de configuración
│   └── setup-database.sql    # Schema de la base de datos
└── public/                   # Archivos estáticos
```

## 🎲 API Endpoints

### Salas
- `POST /api/rooms` - Crear una nueva sala
- `GET /api/rooms/[roomId]/state` - Obtener el estado de una sala

### Jugadores
- `POST /api/rooms/[roomId]/join` - Unirse a una sala

### Juego
- `POST /api/rooms/[roomId]/start-round` - Iniciar una nueva ronda
- `POST /api/rooms/[roomId]/definition` - Enviar definición
- `POST /api/rooms/[roomId]/vote` - Votar por una definición

## 🎨 Personalización

### Añadir nuevas palabras

Edita el archivo [lib/words.ts](lib/words.ts) para añadir más palabras y sus definiciones:

```typescript
export const words = [
  {
    word: "palabra",
    definition: "definición real"
  },
  // Añade más aquí...
];
```

### Cambiar el número de rondas por defecto

Modifica el estado inicial en [components/game/home-screen.tsx](components/game/home-screen.tsx):

```typescript
const [maxRounds, setMaxRounds] = useState(5); // Cambia el 5 por el número deseado
```

## 🧪 Desarrollo

### Comandos útiles

```bash
# Desarrollo
pnpm dev

# Build de producción
pnpm build

# Iniciar servidor de producción
pnpm start

# Linting
pnpm lint
```

## 🚀 Despliegue

Este proyecto está listo para ser desplegado en [Vercel](https://vercel.com):

1. Sube tu código a GitHub
2. Importa el proyecto en Vercel
3. Configura la variable de entorno `DATABASE_URL`
4. ¡Despliega!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🙏 Agradecimientos

- Inspirado en el juego de mesa "Balderdash"
- UI construida con [shadcn/ui](https://ui.shadcn.com/)
- Iconos de [Lucide](https://lucide.dev/)

## 📧 Contacto

Si tienes preguntas o sugerencias, no dudes en abrir un issue en el repositorio.

---

¡Diviértete jugando! 🎉
