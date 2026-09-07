import { FlaskFile } from '../types';

export const FLASK_FILES: FlaskFile[] = [
  {
    nombre: 'app.py',
    ruta: 'flask_app/app.py',
    lenguaje: 'python',
    descripcion: 'Servidor Flask con rutas CRUD completas, SQLite3 y exportación JSON',
    contenido: `from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, Response
import sqlite3
import datetime
import json

app = Flask(__name__)
app.secret_key = 'bitacora_secreta_clave_desarrollo'

DB_FILE = 'bitacora.db'

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS entradas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            categoria TEXT NOT NULL,
            fecha TEXT NOT NULL,
            contenido TEXT NOT NULL,
            tags TEXT,
            estado TEXT DEFAULT 'Completado',
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def index():
    query = request.args.get('q', '').strip()
    categoria_filtro = request.args.get('categoria', '').strip()
    
    conn = get_db_connection()
    sql = 'SELECT * FROM entradas WHERE 1=1'
    params = []
    
    if query:
        sql += ' AND (titulo LIKE ? OR contenido LIKE ? OR tags LIKE ?)'
        params.extend([f'%{query}%', f'%{query}%', f'%{query}%'])
        
    if categoria_filtro:
        sql += ' AND categoria = ?'
        params.append(categoria_filtro)
        
    sql += ' ORDER BY fecha DESC, id DESC'
    entradas = conn.execute(sql, params).fetchall()
    categorias = conn.execute('SELECT DISTINCT categoria FROM entradas ORDER BY categoria').fetchall()
    total_entradas = conn.execute('SELECT COUNT(*) FROM entradas').fetchone()[0]
    conn.close()
    
    return render_template('index.html', 
        entradas=entradas, 
        categorias=[c['categoria'] for c in categorias],
        query=query, 
        categoria_filtro=categoria_filtro,
        total_entradas=total_entradas
    )

@app.route('/nueva', methods=['GET', 'POST'])
def nueva_entrada():
    if request.method == 'POST':
        titulo = request.form.get('titulo', '').strip()
        categoria = request.form.get('categoria', '').strip() or 'General'
        fecha = request.form.get('fecha', '').strip() or datetime.date.today().strftime('%Y-%m-%d')
        contenido = request.form.get('contenido', '').strip()
        tags = request.form.get('tags', '').strip()
        estado = request.form.get('estado', 'Completado').strip()
        
        if not titulo or not contenido:
            flash('El título y el contenido son obligatorios.', 'error')
            return render_template('nueva_entrada.html', hoy=datetime.date.today().strftime('%Y-%m-%d'))
            
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO entradas (titulo, categoria, fecha, contenido, tags, estado)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (titulo, categoria, fecha, contenido, tags, estado))
        conn.commit()
        conn.close()
        flash('¡Entrada guardada con éxito!', 'success')
        return redirect(url_for('index'))
        
    hoy = datetime.date.today().strftime('%Y-%m-%d')
    return render_template('nueva_entrada.html', hoy=hoy)

@app.route('/entrada/<int:id>')
def ver_entrada(id):
    conn = get_db_connection()
    entrada = conn.execute('SELECT * FROM entradas WHERE id = ?', (id,)).fetchone()
    conn.close()
    if entrada is None:
        flash('La entrada solicitada no existe.', 'error')
        return redirect(url_for('index'))
    return render_template('ver_entrada.html', entrada=entrada)

@app.route('/editar/<int:id>', methods=['GET', 'POST'])
def editar_entrada(id):
    conn = get_db_connection()
    entrada = conn.execute('SELECT * FROM entradas WHERE id = ?', (id,)).fetchone()
    if entrada is None:
        conn.close()
        flash('Entrada no encontrada.', 'error')
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        titulo = request.form.get('titulo', '').strip()
        categoria = request.form.get('categoria', '').strip() or 'General'
        fecha = request.form.get('fecha', '').strip()
        contenido = request.form.get('contenido', '').strip()
        tags = request.form.get('tags', '').strip()
        estado = request.form.get('estado', 'Completado').strip()
        
        conn.execute('''
            UPDATE entradas 
            SET titulo = ?, categoria = ?, fecha = ?, contenido = ?, tags = ?, estado = ?
            WHERE id = ?
        ''', (titulo, categoria, fecha, contenido, tags, estado, id))
        conn.commit()
        conn.close()
        flash('Entrada actualizada correctamente.', 'success')
        return redirect(url_for('ver_entrada', id=id))
        
    conn.close()
    return render_template('editar_entrada.html', entrada=entrada)

@app.route('/eliminar/<int:id>', methods=['POST'])
def eliminar_entrada(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM entradas WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('Entrada eliminada de la bitácora.', 'info')
    return redirect(url_for('index'))

@app.route('/exportar')
def exportar():
    conn = get_db_connection()
    entradas = conn.execute('SELECT * FROM entradas ORDER BY fecha ASC').fetchall()
    conn.close()
    lista = [dict(e) for e in entradas]
    return Response(
        json.dumps(lista, indent=2, ensure_ascii=False),
        mimetype='application/json',
        headers={'Content-Disposition': 'attachment;filename=bitacora_exportada.json'}
    )

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
`
  },
  {
    nombre: 'templates/base.html',
    ruta: 'flask_app/templates/base.html',
    lenguaje: 'html',
    descripcion: 'Plantilla maestra Jinja2 con encabezado, mensajes flash y pie de página',
    contenido: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Bitácora Digital{% endblock %} - Registro de Actividades</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <header class="navbar">
        <div class="container nav-content">
            <a href="{{ url_for('index') }}" class="logo">
                <span class="logo-icon">📖</span>
                <span class="logo-text">Bitácora<strong>Digital</strong></span>
            </a>
            <nav class="nav-links">
                <a href="{{ url_for('index') }}" class="nav-link">Inicio</a>
                <a href="{{ url_for('nueva_entrada') }}" class="btn btn-primary">+ Nueva Entrada</a>
                <a href="{{ url_for('exportar') }}" class="btn btn-secondary">⬇ Exportar</a>
            </nav>
        </div>
    </header>

    <main class="container main-content">
        {% with messages = get_flashed_messages(with_categories=true) %}
            {% if messages %}
                <div class="flash-messages">
                    {% for category, message in messages %}
                        <div class="alert alert-{{ category }}">
                            <span>{{ message }}</span>
                            <button type="button" class="close-alert" onclick="this.parentElement.remove();">&times;</button>
                        </div>
                    {% endfor %}
                </div>
            {% endif %}
        {% endwith %}

        {% block content %}{% endblock %}
    </main>

    <footer class="footer">
        <div class="container footer-content">
            <p>Bitácora Digital &copy; 2026 &bull; Flask + HTML5 + CSS3 + JS</p>
        </div>
    </footer>

    <script src="{{ url_for('static', filename='js/main.js') }}"></script>
</body>
</html>`
  },
  {
    nombre: 'templates/index.html',
    ruta: 'flask_app/templates/index.html',
    lenguaje: 'html',
    descripcion: 'Página de inicio con buscador, filtros y tarjetas de entradas',
    contenido: `{% extends "base.html" %}

{% block title %}Inicio{% endblock %}

{% block content %}
<section class="dashboard-header">
    <div class="header-info">
        <h1>Entradas de la Bitácora</h1>
        <p class="subtitle">Registra el progreso, soluciones, lecciones aprendidas y actividades diarias.</p>
    </div>
    <div class="stats-badge">
        <span class="stats-num">{{ total_entradas }}</span>
        <span class="stats-label">Entradas Registradas</span>
    </div>
</section>

<section class="filter-section">
    <form method="GET" action="{{ url_for('index') }}" class="search-form">
        <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" name="q" placeholder="Buscar por título, contenido o etiqueta..." value="{{ query }}">
        </div>
        <div class="category-select-wrapper">
            <select name="categoria" onchange="this.form.submit()">
                <option value="">Todas las Categorías</option>
                {% for cat in categorias %}
                    <option value="{{ cat }}" {% if categoria_filtro == cat %}selected{% endif %}>{{ cat }}</option>
                {% endfor %}
            </select>
        </div>
        <button type="submit" class="btn btn-filter">Filtrar</button>
    </form>
</section>

<section class="entries-grid">
    {% for entrada in entradas %}
        <article class="entry-card">
            <div class="entry-header">
                <span class="badge-category">{{ entrada.categoria }}</span>
                <time class="entry-date">{{ entrada.fecha }}</time>
            </div>
            <h2 class="entry-title">
                <a href="{{ url_for('ver_entrada', id=entrada.id) }}">{{ entrada.titulo }}</a>
            </h2>
            <p class="entry-preview">{{ entrada.contenido[:140] }}...</p>
            <div class="entry-footer">
                <span class="status-indicator status-{{ entrada.estado|lower|replace(' ', '-') }}">{{ entrada.estado }}</span>
                <a href="{{ url_for('ver_entrada', id=entrada.id) }}" class="link-action">Leer más &rarr;</a>
            </div>
        </article>
    {% endfor %}
</section>
{% endblock %}`
  },
  {
    nombre: 'templates/nueva_entrada.html',
    ruta: 'flask_app/templates/nueva_entrada.html',
    lenguaje: 'html',
    descripcion: 'Formulario de registro con validaciones y contador de caracteres',
    contenido: `{% extends "base.html" %}

{% block title %}Nueva Entrada{% endblock %}

{% block content %}
<div class="form-wrapper">
    <div class="form-header">
        <a href="{{ url_for('index') }}" class="back-link">&larr; Volver</a>
        <h1>Registrar Nueva Entrada</h1>
    </div>

    <form method="POST" action="{{ url_for('nueva_entrada') }}" class="entry-form">
        <div class="form-group">
            <label for="titulo">Título *</label>
            <input type="text" id="titulo" name="titulo" required>
        </div>
        <div class="form-row">
            <div class="form-group flex-1">
                <label for="fecha">Fecha *</label>
                <input type="date" id="fecha" name="fecha" value="{{ hoy }}" required>
            </div>
            <div class="form-group flex-1">
                <label for="categoria">Categoría</label>
                <input type="text" id="categoria" name="categoria" value="Desarrollo">
            </div>
        </div>
        <div class="form-group">
            <label for="tags">Etiquetas (separadas por comas)</label>
            <input type="text" id="tags" name="tags" placeholder="python, frontend, base de datos">
        </div>
        <div class="form-group">
            <div class="label-with-counter">
                <label for="contenido">Contenido *</label>
                <span id="charCount" class="char-counter">0 caracteres</span>
            </div>
            <textarea id="contenido" name="contenido" rows="8" required></textarea>
        </div>
        <div class="form-actions">
            <a href="{{ url_for('index') }}" class="btn btn-secondary">Cancelar</a>
            <button type="submit" class="btn btn-primary">Guardar Entrada</button>
        </div>
    </form>
</div>
{% endblock %}`
  },
  {
    nombre: 'static/css/style.css',
    ruta: 'flask_app/static/css/style.css',
    lenguaje: 'css',
    descripcion: 'Hojas de estilo CSS con diseño responsivo y variables temáticas',
    contenido: `:root {
    --color-primary: #2563eb;
    --color-primary-hover: #1d4ed8;
    --color-bg: #f8fafc;
    --color-surface: #ffffff;
    --color-border: #e2e8f0;
    --color-text-main: #0f172a;
    --color-text-muted: #64748b;
    --radius-md: 10px;
    --font-main: 'Plus Jakarta Sans', system-ui, sans-serif;
}

body {
    font-family: var(--font-main);
    background-color: var(--color-bg);
    color: var(--color-text-main);
    margin: 0;
}

.container {
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 1.25rem;
}

.navbar {
    background-color: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
}

.nav-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 4.25rem;
}

.entries-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.25rem;
    margin-top: 1.5rem;
}

.entry-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.entry-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08);
}
`
  },
  {
    nombre: 'static/js/main.js',
    ruta: 'flask_app/static/js/main.js',
    lenguaje: 'javascript',
    descripcion: 'JavaScript del cliente para contador de caracteres y desvanecimiento de alertas',
    contenido: `document.addEventListener('DOMContentLoaded', () => {
    // Contador de caracteres en tiempo real
    const contenidoTextarea = document.getElementById('contenido');
    const charCounter = document.getElementById('charCount');

    if (contenidoTextarea && charCounter) {
        const updateCount = () => {
            const count = contenidoTextarea.value.length;
            charCounter.textContent = \`\${count} carácter\${count === 1 ? '' : 'es'}\`;
        };
        contenidoTextarea.addEventListener('input', updateCount);
        updateCount();
    }

    // Desvanecer alertas flash
    const flashAlerts = document.querySelectorAll('.alert');
    flashAlerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s ease';
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 500);
        }, 5000);
    });
});`
  },
  {
    nombre: 'requirements.txt',
    ruta: 'flask_app/requirements.txt',
    lenguaje: 'text',
    descripcion: 'Dependencias de Python para instalar con pip',
    contenido: `Flask>=3.0.0
Werkzeug>=3.0.0`
  },
  {
    nombre: 'README.md',
    ruta: 'flask_app/README.md',
    lenguaje: 'markdown',
    descripcion: 'Instrucciones paso a paso para ejecutar el servidor Flask localmente',
    contenido: `# 📖 Bitácora Digital en Flask

### Ejecución Local:
1. Instalar dependencias:
   pip install -r requirements.txt

2. Iniciar servidor:
   python app.py

3. Abrir en navegador:
   http://127.0.0.1:5000
`
  }
];
