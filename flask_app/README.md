# 📖 Bitácora Digital (Flask + SQLite + HTML + CSS + JS)

Una aplicación web completa y moderna para registrar, clasificar y dar seguimiento a actividades diarias, aprendizajes, notas de desarrollo e incidencias.

---

## 🛠 Tecnologías Utilizadas
* **Backend:** Python 3 + [Flask](https://flask.palletsprojects.com/)
* **Base de Datos:** SQLite3 (integrada automáticamente en `bitacora.db`, sin configuración adicional)
* **Frontend:**
  * HTML5 semántico y accesible con plantillas Jinja2 (`templates/`)
  * CSS3 moderno con diseño responsivo, variables y tipografía Plus Jakarta Sans (`static/css/style.css`)
  * JavaScript nativo (DOM interactivo, contador de caracteres, alertas) (`static/js/main.js`)

---

## 📁 Estructura del Proyecto

```text
flask_app/
│
├── app.py                     # Servidor Flask, rutas CRUD y conexión SQLite
├── requirements.txt           # Dependencias de Python (Flask)
├── bitacora.db                # Base de datos SQLite (se genera automáticamente)
├── README.md                  # Guía de instalación y uso
│
├── templates/                 # Vistas HTML (Jinja2)
│   ├── base.html              # Plantilla base (Navbar, Flash alerts, Footer)
│   ├── index.html             # Listado de entradas, búsqueda y filtros
│   ├── nueva_entrada.html     # Formulario de registro de entrada
│   ├── editar_entrada.html    # Formulario para editar entrada
│   └── ver_entrada.html       # Vista detallada de una entrada
│
└── static/                    # Archivos estáticos
    ├── css/
    │   └── style.css          # Estilos CSS personalizados
    └── js/
        └── main.js            # Lógica interactiva en JavaScript
```

---

## 🚀 Cómo ejecutar en tu computadora

### 1. Requisitos Previos
* Tener instalado **Python 3.8 o superior**. Puedes comprobarlo con:
  ```bash
  python --version
  ```

### 2. Crear y activar un entorno virtual (Recomendado)
* **En Linux / macOS:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```
* **En Windows:**
  ```bash
  python -m venv venv
  venv\Scripts\activate
  ```

### 3. Instalar las dependencias
```bash
pip install -r requirements.txt
```

### 4. Iniciar la aplicación Flask
```bash
python app.py
```

### 5. Abrir en el navegador
Visita en tu navegador:
```text
http://127.0.0.1:5000
```

---

## ✨ Características Principales
1. **Creación y Edición de Entradas:** Título, fecha, categoría, etiquetas separadas por comas, estado (Completado, En progreso, etc.) y descripción completa.
2. **Búsqueda y Filtros en Tiempo Real:** Filtra por texto libre en título/contenido/tags o por categoría.
3. **Persistencia Local Segura:** Utiliza SQLite para almacenar todas las entradas sin perder información al reiniciar el servidor.
4. **Exportación de Datos:** Descarga en un clic un archivo JSON con todas las entradas para respaldo o análisis externo.
5. **Diseño Limpio y Adaptable:** Funciona perfectamente en computadoras, tablets y teléfonos móviles.
