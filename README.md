# MoviesHN - Estado Actual del Proyecto

## 📋 Resumen del Proyecto

**MoviesHN** es una plataforma web para ver películas y series online de forma gratuita. El proyecto ofrece un catálogo de contenido en español latino con una interfaz moderna inspirada en servicios de streaming populares como Netflix.

### Estado: 🚧 En Construcción Activa

El proyecto se encuentra en fase de desarrollo continuo con actualizaciones semanales de contenido y mejoras en la plataforma.

---

## 📊 Estadísticas del Contenido

### Películas
- **Total de películas**: 89
- **Portadas disponibles**: 97 imágenes en formato WebP
- **Géneros cubiertos**: Acción, Terror, Suspenso, Comedia, Ciencia Ficción, Drama, Fantasía, Aventura, Animación, Documentales, y más

### Series
- **Total de series**: 3
- **Series disponibles**: 
  - The Mandalorian
  - Breaking Bad
  - Mr. Robot & Stranger Things (recientemente añadidas con backdrop y cover)

---

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5**: Estructura semántica del sitio
- **CSS3**: Estilos personalizados con diseño responsive
- **JavaScript Vanilla**: Lógica de la aplicación sin frameworks
- **Font Awesome 6.5.2**: Iconos
- **Google Fonts**: Share Tech Mono

### Herramientas de Desarrollo
- **Node.js**: Entorno de desarrollo
- **live-server**: Servidor de desarrollo local con hot reload
- **npm**: Gestor de paquetes

### Almacenamiento
- **JSON Files**: Base de datos local para películas y series
- **LocalStorage**: Almacenamiento de lista de usuario y progreso de visualización

---

## 🎨 Características Implementadas

### Página Principal (index.html)
✅ **Hero Section Dinámico**
- Rotación automática de películas destacadas
- Imágenes de fondo de alta calidad
- Botones de acción (Ver ahora, Mi lista)

✅ **Carrusel de Últimos Agregados**
- Muestra las películas más recientes
- Navegación deslizante

✅ **Categorías por Género**
- Recientes
- Más vistas
- Acción
- Terror
- Suspenso
- Comedia
- Fantasía
- Ciencia Ficción
- Aventura
- Animación
- Drama
- Documentales
- +18
- Hackers y Ciberseguridad

✅ **Barra de Búsqueda**
- Búsqueda en tiempo real de películas
- Resultados filtrados

✅ **Menú de Navegación Responsive**
- Diseño adaptable para móviles
- Menú hamburguesa
- Navegación por categorías

### Exploración Avanzada
✅ **Filtros de Navegación**
- Por género (10+ categorías)
- Por año (1979-2025)
- Por plataforma (Netflix, Amazon, Disney+, HBO Max, Apple TV+)
- Por sagas (Star Wars, Marvel, Harry Potter, James Bond, Rápidos y Furiosos)
- Por actores
- Por país

### Funcionalidad de Series
✅ **Página de Series** (series.html)
- Visualización de temporadas y episodios
- Reproductor integrado
- Enlaces de descarga

✅ **Página de Todas las Series** (all-series.html)
- Listado completo de series disponibles
- Tarjetas con información de cada serie

### Sistema de Listas Personales
✅ **Mi Lista** (mylist.html)
- Guardar películas favoritas
- Persistencia en LocalStorage
- Gestión de lista (añadir/eliminar)

✅ **Continuar Viendo**
- Guarda el progreso de visualización
- Muestra películas/series en progreso

### Página de Película Individual
✅ **Reproductor Integrado**
- Múltiples opciones de reproducción
- Calidad Full HD 1080p
- Subtítulos disponibles

✅ **Información Detallada**
- Sinopsis
- Director y elenco
- Año de estreno
- Duración
- Clasificación por edad
- Trailer de YouTube

✅ **Enlaces de Visualización y Descarga**
- Múltiples servidores
- Opciones de descarga

### Elementos Visuales
✅ **Sidebar Izquierdo**
- Navegación por categorías
- Filtros dinámicos
- Contador de "Mi Lista"

✅ **Sidebar Derecho**
- Últimas series agregadas
- Serie del día
- Películas destacadas
- Próximos estrenos
- Noticias

---

## 📁 Estructura del Proyecto

```
movieshn/
├── index.html              # Página principal
├── movie.html             # Página de película individual
├── series.html            # Página de serie individual
├── all-series.html        # Listado de todas las series
├── mylist.html            # Página de lista personal
├── package.json           # Configuración del proyecto
├── README.md             # Documentación
│
├── css/
│   └── styles.css        # Estilos principales
│
├── js/
│   ├── index.js          # Lógica de página principal (528 líneas)
│   ├── movie.js          # Lógica de película (541 líneas)
│   ├── series.js         # Lógica de series (408 líneas)
│   ├── all-series.js     # Lógica de listado series (491 líneas)
│   ├── mylist.js         # Lógica de mi lista (105 líneas)
│   ├── menu.js           # Lógica de menú responsive (58 líneas)
│   ├── effects.js        # Efectos visuales (20 líneas)
│   └── background.js     # Efectos de fondo
│
├── data/
│   ├── movies.json       # Base de datos de películas (105KB, 3005 líneas)
│   └── series.json       # Base de datos de series (35KB, 921 líneas)
│
└── assets/
    └── covers/           # 97 imágenes de portadas (formato WebP)
```

---

## 🚀 Configuración del Entorno de Desarrollo

### Requisitos Previos
- Node.js (v14 o superior)
- npm (incluido con Node.js)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Codevhn/movieshn.git
cd movieshn
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

El sitio se abrirá automáticamente en `http://localhost:8080` (o el puerto disponible).

---

## 📈 Características en Desarrollo

### Próximas Mejoras Planificadas
- [ ] Aumentar catálogo de series (actualmente 3)
- [ ] Implementar sistema de calificaciones
- [ ] Añadir comentarios de usuarios
- [ ] Mejorar algoritmo de recomendaciones
- [ ] Integrar más servidores de streaming
- [ ] Optimización de rendimiento
- [ ] PWA (Progressive Web App)
- [ ] Modo oscuro/claro
- [ ] Sistema de notificaciones para nuevos estrenos

---

## 🎯 Últimas Actualizaciones

### Commit Reciente
```
feat(series): add new backdrop and cover to series Mr Robot & Strangers Things
```

Se añadieron imágenes de fondo y portadas para las series Mr. Robot y Stranger Things, mejorando la presentación visual del contenido.

---

## 👥 Contribución

**Autor**: Francisco Vasquez (codevhn@gmail.com)

### Repositorio
- **GitHub**: https://github.com/Codevhn/movieshn
- **Issues**: https://github.com/Codevhn/movieshn/issues

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 🔗 Enlaces Útiles

- [Repositorio GitHub](https://github.com/Codevhn/movieshn)
- [Reportar un problema](https://github.com/Codevhn/movieshn/issues)

---

## 📝 Notas Adicionales

### SEO y Metadata
El sitio incluye:
- Meta tags de descripción y keywords
- Open Graph para redes sociales
- Twitter Cards
- Favicon

### Optimizaciones Implementadas
- Imágenes en formato WebP para mejor rendimiento
- Lazy loading de imágenes
- Fuentes de Google preconectadas
- CSS optimizado

### Compatibilidad
- ✅ Chrome/Edge (últimas versiones)
- ✅ Firefox (últimas versiones)
- ✅ Safari (últimas versiones)
- ✅ Responsive: Mobile, Tablet, Desktop

---

**Última actualización**: Octubre 2025
**Versión**: 1.0.0
**Estado**: En Construcción Activa 🚧
