// Script para optimización de imágenes
document.addEventListener('DOMContentLoaded', function() {
    // Función para verificar si un elemento está en el viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Función para cargar imágenes cuando entran en el viewport
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        images.forEach(img => {
            if (isInViewport(img) && !img.dataset.loaded) {
                // Marcar la imagen como cargada
                img.dataset.loaded = true;
                
                // Aplicar clase para animación de fade-in
                img.classList.add('loaded');
            }
        });
    }

    // Función para manejar errores de carga de imágenes
    function handleImageError() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            img.onerror = function() {
                // Reemplazar con imagen local de respaldo si falla la carga
                this.src = 'Imagenes/asus-proart-p16.png';
                this.alt = 'Imagen no disponible';
            };
        });
    }

    // Función para aplicar srcset a imágenes responsivas
    function setupResponsiveImages() {
        const productImages = document.querySelectorAll('.product-image img');
        
        productImages.forEach(img => {
            // Obtener la ruta base de la imagen
            const src = img.getAttribute('src');
            if (!src.includes('placeholder')) {
                // No modificar imágenes de respaldo
                img.setAttribute('srcset', src);
            }
        });
    }

    // Inicializar funciones
    lazyLoadImages();
    handleImageError();
    setupResponsiveImages();

    // Escuchar eventos de scroll para lazy loading
    window.addEventListener('scroll', lazyLoadImages);
    window.addEventListener('resize', lazyLoadImages);
});