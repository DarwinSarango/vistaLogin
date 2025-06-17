document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.sidebar');
    const dashboardContainer = document.querySelector('.dashboard-container');
    let isTransitioning = false; // Prevenir doble click durante transiciones
    
    // Crear overlay para móvil si no existe
    let overlay = document.querySelector('.mobile-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
    }

    // Función para manejar el sidebar en desktop
    function handleDesktopSidebar(e) {
        if (e) e.preventDefault();
        if (window.innerWidth <= 768 || isTransitioning) return;
        
        isTransitioning = true;
        sidebar.classList.toggle('collapsed');
        
        // Actualizar el estado en localStorage
        try {
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        } catch (error) {
            console.warn('Error saving sidebar state:', error);
        }
        
        // Ajustar el margen del contenido
        if (dashboardContainer) {
            const newMargin = sidebar.classList.contains('collapsed') ? '80px' : '260px';
            dashboardContainer.style.marginLeft = newMargin;
        }

        // Permitir nueva interacción después de la transición
        setTimeout(() => {
            isTransitioning = false;
        }, 300); // Coincidir con la duración de la transición CSS
    }

    // Función para manejar el menú en móvil
    function handleMobileSidebar(e) {
        if (e) e.preventDefault();
        if (window.innerWidth > 768 || isTransitioning) return;
        
        isTransitioning = true;
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';

        // Permitir nueva interacción después de la transición
        setTimeout(() => {
            isTransitioning = false;
        }, 300);
    }

    // Event listeners
    if (menuToggle) {
        menuToggle.addEventListener('click', handleDesktopSidebar);
    }

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', handleMobileSidebar);
    }

    // Cerrar menú móvil al hacer click en el overlay
    overlay.addEventListener('click', () => {
        if (sidebar.classList.contains('active') && !isTransitioning) {
            handleMobileSidebar();
        }
    });

    // Manejar cambio de tamaño de ventana con debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > 768) {
                // Restaurar estado desktop
                try {
                    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
                    sidebar.classList.toggle('collapsed', sidebarCollapsed);
                    if (dashboardContainer) {
                        dashboardContainer.style.marginLeft = sidebarCollapsed ? '80px' : '260px';
                    }
                } catch (error) {
                    console.warn('Error reading sidebar state:', error);
                }
                
                // Limpiar estados móviles
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                // En móvil, asegurar que el sidebar esté en su estado inicial
                sidebar.classList.remove('collapsed');
                if (dashboardContainer) {
                    dashboardContainer.style.marginLeft = '0';
                }
            }
        }, 250); // Debounce de 250ms
    });

    // Inicializar estado del sidebar
    if (window.innerWidth > 768) {
        try {
            const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (sidebarCollapsed) {
                sidebar.classList.add('collapsed');
                if (dashboardContainer) {
                    dashboardContainer.style.marginLeft = '80px';
                }
            }
        } catch (error) {
            console.warn('Error reading initial sidebar state:', error);
        }
    }

    // Activar elemento de menú según la página actual
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.menu-item').forEach(item => {
        const link = item.querySelector('a');
        if (link && link.getAttribute('href').includes(currentPage)) {
            item.classList.add('active');
        }
    });
});
