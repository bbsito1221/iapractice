/**
 * Bitácora Digital - Scripts del Lado del Cliente (JavaScript)
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Contador de caracteres en tiempo real en los formularios
    const contenidoTextarea = document.getElementById('contenido');
    const charCounter = document.getElementById('charCount');

    if (contenidoTextarea && charCounter) {
        const updateCount = () => {
            const count = contenidoTextarea.value.length;
            charCounter.textContent = `${count} carácter${count === 1 ? '' : 'es'}`;
        };
        contenidoTextarea.addEventListener('input', updateCount);
        updateCount(); // inicial
    }

    // 2. Desvanecimiento automático de mensajes flash tras 5 segundos
    const flashAlerts = document.querySelectorAll('.alert');
    flashAlerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-10px)';
            setTimeout(() => alert.remove(), 500);
        }, 5000);
    });

    // 3. Confirmación accesible antes de eliminar
    const deleteForms = document.querySelectorAll('form[action*="/eliminar/"]');
    deleteForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const confirmed = window.confirm('¿Confirmas que deseas eliminar esta entrada permanentemente de la bitácora?');
            if (!confirmed) {
                e.preventDefault();
            }
        });
    });

    // 4. Formateador de etiquetas al escribir (convierte espacios en comas si es necesario)
    const tagsInput = document.getElementById('tags');
    if (tagsInput) {
        tagsInput.addEventListener('blur', () => {
            let tags = tagsInput.value.split(',')
                .map(t => t.trim().toLowerCase())
                .filter(t => t.length > 0);
            tagsInput.value = tags.join(', ');
        });
    }

    console.log('Bitácora Digital: JavaScript inicializado correctamente.');
});
