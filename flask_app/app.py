from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, Response
import sqlite3
import datetime
import json
import os

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
    
    # Insertar datos de ejemplo iniciales si la tabla está vacía
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM entradas')
    count = cursor.fetchone()[0]
    if count == 0:
        hoy = datetime.date.today().strftime('%Y-%m-%d')
        conn.execute('''
            INSERT INTO entradas (titulo, categoria, fecha, contenido, tags, estado)
            VALUES 
            (?, ?, ?, ?, ?, ?),
            (?, ?, ?, ?, ?, ?)
        ''', (
            'Inicio del proyecto de Bitácora Digital',
            'Desarrollo',
            hoy,
            'Se definió la arquitectura del proyecto utilizando Flask para el backend y HTML, CSS y JavaScript para la interfaz de usuario. El objetivo es registrar el avance diario y notas técnicas.',
            'flask, python, arquitectura, inicio',
            'Completado'
        ), (
            'Configuración de la Base de Datos SQLite',
            'Base de Datos',
            hoy,
            'Se diseñó el esquema de la tabla de entradas para almacenar título, categoría, fecha, contenido en texto y etiquetas (tags). SQLite permite portabilidad total sin configuraciones complejas.',
            'sqlite, backend, datos',
            'Completado'
        ))
    conn.commit()
    conn.close()

# Ruta principal: listar entradas con búsqueda y filtro
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
    
    # Obtener lista de categorías únicas para el selector de filtros
    categorias = conn.execute('SELECT DISTINCT categoria FROM entradas ORDER BY categoria').fetchall()
    total_entradas = conn.execute('SELECT COUNT(*) FROM entradas').fetchone()[0]
    
    conn.close()
    return render_template(
        'index.html', 
        entradas=entradas, 
        categorias=[c['categoria'] for c in categorias],
        query=query, 
        categoria_filtro=categoria_filtro,
        total_entradas=total_entradas
    )

# Ruta para ver una entrada en detalle
@app.route('/entrada/<int:id>')
def ver_entrada(id):
    conn = get_db_connection()
    entrada = conn.execute('SELECT * FROM entradas WHERE id = ?', (id,)).fetchone()
    conn.close()
    if entrada is None:
        flash('La entrada solicitada no existe.', 'error')
        return redirect(url_for('index'))
    return render_template('ver_entrada.html', entrada=entrada)

# Ruta para crear una nueva entrada
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
        
        flash('¡Entrada guardada con éxito en tu bitácora!', 'success')
        return redirect(url_for('index'))
        
    hoy = datetime.date.today().strftime('%Y-%m-%d')
    return render_template('nueva_entrada.html', hoy=hoy)

# Ruta para editar una entrada existente
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
        
        if not titulo or not contenido:
            flash('El título y el contenido no pueden estar vacíos.', 'error')
            conn.close()
            return render_template('editar_entrada.html', entrada=entrada)
            
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

# Ruta para eliminar una entrada
@app.route('/eliminar/<int:id>', methods=['POST'])
def eliminar_entrada(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM entradas WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('Entrada eliminada de la bitácora.', 'info')
    return redirect(url_for('index'))

# Endpoint API JSON para consultar entradas desde JS
@app.route('/api/entradas')
def api_entradas():
    conn = get_db_connection()
    entradas = conn.execute('SELECT * FROM entradas ORDER BY fecha DESC').fetchall()
    conn.close()
    lista = [dict(e) for e in entradas]
    return jsonify(lista)

# Ruta para exportar todas las entradas en formato JSON descargable
@app.route('/exportar')
def exportar():
    conn = get_db_connection()
    entradas = conn.execute('SELECT * FROM entradas ORDER BY fecha ASC').fetchall()
    conn.close()
    lista = [dict(e) for e in entradas]
    json_data = json.dumps(lista, indent=2, ensure_ascii=False)
    
    return Response(
        json_data,
        mimetype='application/json',
        headers={'Content-Disposition': 'attachment;filename=bitacora_exportada.json'}
    )

if __name__ == '__main__':
    init_db()
    # Ejecución local en el puerto 5000
    app.run(debug=True, host='0.0.0.0', port=5000)
