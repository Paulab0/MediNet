document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('sidebar-toggle-btn');

    // Función para mostrar u ocultar el sidebar
    const toggleSidebar = () => {
        sidebar.classList.toggle('open');
    };

    // Evento para el botón
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleSidebar);
    }

    // Opcional: Cerrar el sidebar si se hace clic fuera de él
    document.addEventListener('click', (event) => {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggleButton = toggleButton.contains(event.target);

        if (sidebar.classList.contains('open') && !isClickInsideSidebar && !isClickOnToggleButton) {
            sidebar.classList.remove('open');
        }
    });
});