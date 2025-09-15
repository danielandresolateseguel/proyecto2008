// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');
    const searchableItems = document.querySelectorAll('.searchable-item');
    const cartIcon = document.querySelector('.cart-icon');
    const cartCount = document.getElementById('cart-count');
    const shoppingCart = document.getElementById('shopping-cart');
    const closeCart = document.getElementById('close-cart');
    const cartItems = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    // Crear overlay para cuando el carrito está abierto
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    // Carrito de compras
    let cart = [];
    
    // Función para escapar caracteres especiales en una expresión regular
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Función para resaltar el término de búsqueda en un texto
    function highlightTerm(text, term) {
        // Crear una expresión regular para buscar el término (insensible a mayúsculas/minúsculas)
        const regex = new RegExp('(' + escapeRegExp(term) + ')', 'gi');
        
        // Reemplazar todas las ocurrencias del término con una versión resaltada
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
    
    // Función para resaltar un elemento
    function highlightElement(element) {
        // Agregar clase para resaltar
        element.classList.add('highlight-element');
        
        // Desplazarse al elemento
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Quitar la clase después de 2 segundos
        setTimeout(function() {
            element.classList.remove('highlight-element');
        }, 2000);
    }
    
    // Función para extraer un fragmento de texto que contiene el término de búsqueda
    function extractSnippet(text, term) {
        // Encontrar la posición del término de búsqueda en el texto
        const termIndex = text.indexOf(term);
        
        // Determinar el inicio del fragmento (máximo 50 caracteres antes del término)
        const snippetStart = Math.max(0, termIndex - 50);
        
        // Determinar el final del fragmento (máximo 50 caracteres después del término)
        const snippetEnd = Math.min(text.length, termIndex + term.length + 50);
        
        // Extraer el fragmento
        let snippet = text.substring(snippetStart, snippetEnd);
        
        // Agregar puntos suspensivos si el fragmento no comienza desde el inicio del texto
        if (snippetStart > 0) {
            snippet = '...' + snippet;
        }
        
        // Agregar puntos suspensivos si el fragmento no termina al final del texto
        if (snippetEnd < text.length) {
            snippet = snippet + '...';
        }
        
        return snippet;
    }
    
    // Función para realizar la búsqueda
    function performSearch(term, items) {
        const results = [];
        
        // Recorrer todos los elementos buscables
        items.forEach(item => {
            // Obtener el texto del elemento
            const itemText = item.textContent.toLowerCase();
            const itemId = item.id;
            const itemTitle = item.querySelector('h3').textContent;
            
            // Verificar si el texto contiene el término de búsqueda
            if (itemText.includes(term)) {
                // Extraer un fragmento de texto que contiene el término de búsqueda
                const snippet = extractSnippet(itemText, term);
                
                // Agregar el resultado a la lista de resultados
                results.push({
                    id: itemId,
                    title: itemTitle,
                    snippet: snippet
                });
            }
        });
        
        return results;
    }
    
    // Función para mostrar los resultados
    function displayResults(results, term, container) {
        // Limpiar el contenedor de resultados
        container.innerHTML = '';
        
        // Verificar si hay resultados
        if (results.length === 0) {
            // Mostrar mensaje de que no hay resultados
            container.innerHTML = '<p class="no-results">No se encontraron resultados para "' + term + '".</p>';
            return;
        }
        
        // Crear un elemento para mostrar el número de resultados
        const resultsCount = document.createElement('p');
        resultsCount.className = 'results-count';
        resultsCount.textContent = 'Se encontraron ' + results.length + ' resultado(s) para "' + term + '":';
        container.appendChild(resultsCount);
        
        // Crear un elemento para cada resultado
        results.forEach(result => {
            // Crear el elemento del resultado
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            // Crear el título del resultado
            const resultTitle = document.createElement('h3');
            resultTitle.innerHTML = highlightTerm(result.title, term);
            
            // Crear el fragmento del resultado
            const resultSnippet = document.createElement('p');
            resultSnippet.className = 'result-snippet';
            resultSnippet.innerHTML = highlightTerm(result.snippet, term);
            
            // Crear un enlace para ir al resultado
            const resultLink = document.createElement('a');
            resultLink.href = '#' + result.id;
            resultLink.className = 'result-link';
            resultLink.textContent = 'Ver más';
            resultLink.addEventListener('click', function(event) {
                event.preventDefault();
                
                // Ocultar los resultados
                container.innerHTML = '';
                
                // Resaltar el elemento encontrado
                const targetElement = document.getElementById(result.id);
                if (targetElement) {
                    highlightElement(targetElement);
                }
            });
            
            // Agregar los elementos al resultado
            resultItem.appendChild(resultTitle);
            resultItem.appendChild(resultSnippet);
            resultItem.appendChild(resultLink);
            
            // Agregar el resultado al contenedor
            container.appendChild(resultItem);
        });
    }
    
    // Cargar carrito desde localStorage si existe
    function loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartCount();
        }
    }
    
    // Guardar carrito en localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    // Actualizar contador del carrito
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    // Actualizar la visualización del carrito
    function updateCartDisplay() {
        // Limpiar el contenedor de elementos del carrito
        cartItems.innerHTML = '';
        
        // Verificar si el carrito está vacío
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
            cartTotalPrice.textContent = '$0 ARS';
            return;
        }
        
        // Variable para el precio total
        let totalPrice = 0;
        
        // Crear un elemento para cada producto en el carrito
        cart.forEach(item => {
            // Crear el elemento del producto
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.setAttribute('data-id', item.id);
            
            // Crear la imagen del producto
            const itemImage = document.createElement('div');
            itemImage.className = 'cart-item-image';
            if (item.image) {
                const img = document.createElement('img');
                img.src = item.image;
                img.alt = item.name;
                img.loading = 'lazy';
                itemImage.appendChild(img);
            }
            
            // Crear contenedor de información del producto
            const itemInfo = document.createElement('div');
            itemInfo.className = 'cart-item-info';
            
            // Crear el nombre del producto
            const itemName = document.createElement('div');
            itemName.className = 'cart-item-name';
            itemName.textContent = item.name;
            
            // Crear el precio del producto
            const itemPrice = document.createElement('div');
            itemPrice.className = 'cart-item-price';
            itemPrice.textContent = '$' + parseInt(item.price).toLocaleString('es-AR') + ' ARS';
            
            // Crear el contenedor para la cantidad
            const itemQuantityContainer = document.createElement('div');
            itemQuantityContainer.className = 'cart-item-quantity-container';
            
            // Crear el botón para disminuir la cantidad
            const decreaseBtn = document.createElement('button');
            decreaseBtn.className = 'quantity-btn decrease';
            decreaseBtn.textContent = '-';
            decreaseBtn.addEventListener('click', function() {
                // Disminuir la cantidad del producto
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    // Eliminar el producto si la cantidad es 1
                    const itemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
                    if (itemIndex !== -1) {
                        cart.splice(itemIndex, 1);
                    }
                }
                
                // Actualizar el carrito
                saveCart();
                updateCartDisplay();
                updateCartCount();
            });
            
            // Crear el elemento para mostrar la cantidad
            const itemQuantity = document.createElement('span');
            itemQuantity.className = 'cart-item-quantity';
            itemQuantity.textContent = item.quantity;
            
            // Crear el botón para aumentar la cantidad
            const increaseBtn = document.createElement('button');
            increaseBtn.className = 'quantity-btn increase';
            increaseBtn.textContent = '+';
            increaseBtn.addEventListener('click', function() {
                // Aumentar la cantidad del producto
                item.quantity++;
                
                // Actualizar el carrito
                saveCart();
                updateCartDisplay();
                updateCartCount();
            });
            
            // Agregar los botones y la cantidad al contenedor
            itemQuantityContainer.appendChild(decreaseBtn);
            itemQuantityContainer.appendChild(itemQuantity);
            itemQuantityContainer.appendChild(increaseBtn);
            
            // Crear el botón para eliminar el producto
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-item-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', function() {
                // Eliminar el producto del carrito
                const itemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
                if (itemIndex !== -1) {
                    cart.splice(itemIndex, 1);
                }
                
                // Actualizar el carrito
                saveCart();
                updateCartDisplay();
                updateCartCount();
            });
            
            // Agregar elementos al contenedor de información
            itemInfo.appendChild(itemName);
            itemInfo.appendChild(itemPrice);
            itemInfo.appendChild(itemQuantityContainer);
            
            // Agregar los elementos al elemento del producto
            cartItem.appendChild(itemImage);
            cartItem.appendChild(itemInfo);
            cartItem.appendChild(removeBtn);
            
            // Agregar el elemento del producto al contenedor
            cartItems.appendChild(cartItem);
            
            // Actualizar el precio total
            totalPrice += item.price * item.quantity;
        });
        
        // Actualizar el precio total
         cartTotalPrice.textContent = '$' + parseInt(totalPrice).toLocaleString('es-AR') + ' ARS';
         
         // No necesitamos mostrar métodos de pago ya que se envía por WhatsApp
    }
    
    // Función para añadir un producto al carrito
    function addToCart(id, name, price, imageSrc, event) {
        // Verificar si el producto ya está en el carrito
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            // Incrementar la cantidad si el producto ya está en el carrito
            existingItem.quantity++;
        } else {
            // Agregar el producto al carrito si no está
            cart.push({
                id: id,
                name: name,
                price: price,
                image: imageSrc,
                quantity: 1
            });
        }
        
        // Actualizar el carrito
        saveCart();
        updateCartDisplay();
        updateCartCount();
        
        // Mostrar animación de añadir al carrito
        if (event) {
            showAddToCartAnimation(event);
            
            // Mostrar indicador visual en el botón
            const button = event.currentTarget;
            showAddedToCartIndicator(button);
        }
    }
    
    // Función para vaciar el carrito
    function clearCart() {
        // Vaciar el array del carrito
        cart = [];
        
        // Actualizar el carrito
        saveCart();
        updateCartDisplay();
        updateCartCount();
    }
    
    // Función para mostrar la animación de añadir al carrito
    function showAddToCartAnimation(event) {
        // Crear un elemento para la animación
        const animationElement = document.createElement('div');
        animationElement.className = 'add-to-cart-animation';
        
        // Posicionar el elemento en la posición del clic
        animationElement.style.left = event.clientX + 'px';
        animationElement.style.top = event.clientY + 'px';
        
        // Agregar el elemento al body
        document.body.appendChild(animationElement);
        
        // Obtener la posición del icono del carrito
        const cartIconRect = cartIcon.getBoundingClientRect();
        const cartIconX = cartIconRect.left + cartIconRect.width / 2;
        const cartIconY = cartIconRect.top + cartIconRect.height / 2;
        
        // Animar el elemento hacia el icono del carrito
        animationElement.style.transition = 'all 0.5s ease-in-out';
        animationElement.style.left = cartIconX + 'px';
        animationElement.style.top = cartIconY + 'px';
        animationElement.style.opacity = '0';
        animationElement.style.transform = 'scale(0.1)';
        
        // Eliminar el elemento después de la animación
        setTimeout(function() {
            document.body.removeChild(animationElement);
        }, 500);
    }
    
    // Función para mostrar indicador visual en el botón de añadir al carrito
    function showAddedToCartIndicator(button) {
        // Guardar el texto original del botón
        const originalText = button.textContent;
        
        // Cambiar el texto y estilo del botón
        button.textContent = '¡Añadido!';
        button.classList.add('added-to-cart');
        
        // Restaurar el botón después de 1.5 segundos
        setTimeout(function() {
            button.textContent = originalText;
            button.classList.remove('added-to-cart');
        }, 1500);
    }
    
    // Estilo para resaltar elementos
    const style = document.createElement('style');
    style.textContent = `
        .highlight {
            background-color: yellow;
            font-weight: bold;
        }
        
        .highlight-element {
            animation: highlight-pulse 2s;
        }
        
        @keyframes highlight-pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 255, 0, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(255, 255, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 255, 0, 0); }
        }
        
        .added-to-cart {
            background-color: #4CAF50 !important;
            color: white !important;
            animation: pulse-green 1.5s;
        }
        
        @keyframes pulse-green {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Eventos para el carrito de compras
    
    // Abrir carrito al hacer clic en el icono
    cartIcon.addEventListener('click', function() {
        shoppingCart.classList.add('active');
        overlay.classList.add('active');
    });
    
    // Cerrar carrito al hacer clic en el botón de cerrar
    closeCart.addEventListener('click', function() {
        shoppingCart.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Cerrar carrito al hacer clic en el overlay
    overlay.addEventListener('click', function() {
        shoppingCart.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Evento para los botones de añadir al carrito
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            
            // Obtener la imagen del producto usando el atributo src original
            const productCard = this.closest('.product-card');
            const productImage = productCard.querySelector('.product-image img');
            let imageSrc = '';
            if (productImage) {
                // Obtener solo la ruta relativa de la imagen
                const fullSrc = productImage.getAttribute('src');
                imageSrc = fullSrc;
            }
            
            addToCart(id, name, price, imageSrc, event);
        });
    });
    
    // Evento para el botón de vaciar carrito
    clearCartBtn.addEventListener('click', clearCart);
    
    // Evento para el botón de enviar por WhatsApp
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        
        // Crear el mensaje de WhatsApp
        let mensaje = '¡Hola! 👋 Espero que estés muy bien.\n\n';
        mensaje += '🛒 Me gustaría realizar el siguiente pedido:\n\n';
        
        // Agregar cada producto del carrito
        cart.forEach((item, index) => {
            const precioFormateado = '$' + parseInt(item.price).toLocaleString('es-AR') + ' ARS';
            mensaje += `${index + 1}. 📦 ${item.name}\n`;
            mensaje += `   📊 Cantidad: ${item.quantity}\n`;
            mensaje += `   💵 Precio unitario: ${precioFormateado}\n`;
            mensaje += `   💰 Subtotal: $${parseInt(item.price * item.quantity).toLocaleString('es-AR')} ARS\n`;
            mensaje += '\n';
        });
        
        // Agregar el total
        const totalText = cartTotalPrice.textContent;
        mensaje += `💰 TOTAL: ${totalText}\n\n`;
        mensaje += '¿Podrías confirmarme la disponibilidad y el método de entrega?\n\n';
        mensaje += '¡Muchas gracias! 😊';
        
        // Codificar el mensaje para URL
        const mensajeCodificado = encodeURIComponent(mensaje);
        
        // Crear el enlace de WhatsApp (puedes cambiar el número por el tuyo)
        const numeroWhatsApp = '+5492615893590'; // Cambia este número por tu número de WhatsApp
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;
        
        // Abrir WhatsApp
        window.open(urlWhatsApp, '_blank');
        
        // Limpiar el carrito después de enviar
        clearCart();
        shoppingCart.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Escuchar el evento de envío del formulario de búsqueda
    searchForm.addEventListener('submit', function(event) {
        // Prevenir el comportamiento predeterminado del formulario
        event.preventDefault();
        
        // Obtener el término de búsqueda y eliminar espacios en blanco al inicio y final
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        // Obtener la sección de resultados
        const searchResultsSection = document.querySelector('.search-results');
        
        // Verificar si el término de búsqueda está vacío
        if (searchTerm === '') {
            // Ocultar la sección de resultados
            searchResultsSection.classList.remove('active');
            // Mostrar mensaje de que no hay resultados
            resultsContainer.innerHTML = '<p class="no-results">Por favor, ingresa un término de búsqueda.</p>';
            return;
        }
        
        // Mostrar la sección de resultados
        searchResultsSection.classList.add('active');
        
        // Realizar la búsqueda
        const results = performSearch(searchTerm, searchableItems);
        
        // Mostrar los resultados
        displayResults(results, searchTerm, resultsContainer);
        
        // Mostrar el botón de limpiar búsqueda
        clearSearchBtn.style.display = 'inline-block';
    });
    
    // Escuchar cambios en el campo de búsqueda para ocultar resultados cuando esté vacío
    searchInput.addEventListener('input', function() {
        const searchResultsSection = document.querySelector('.search-results');
        if (searchInput.value.trim() === '') {
            searchResultsSection.classList.remove('active');
            clearSearchBtn.style.display = 'none';
        }
    });
    
    // Funcionalidad del botón limpiar búsqueda
    clearSearchBtn.addEventListener('click', function() {
        // Limpiar el campo de búsqueda
        searchInput.value = '';
        
        // Ocultar la sección de resultados
        const searchResultsSection = document.querySelector('.search-results');
        searchResultsSection.classList.remove('active');
        
        // Ocultar el botón de limpiar
        clearSearchBtn.style.display = 'none';
        
        // Limpiar el contenedor de resultados
        resultsContainer.innerHTML = '';
        
        // Enfocar el campo de búsqueda
        searchInput.focus();
    });
    
    // Funcionalidad del modal de producto
    const productModal = document.getElementById('product-modal');
    const modalProductImage = document.getElementById('modal-product-image');
    const modalProductTitle = document.getElementById('modal-product-title');
    const modalProductDescription = document.getElementById('modal-product-description');
    const modalProductFeatures = document.getElementById('modal-product-features');
    const modalProductPrice = document.getElementById('modal-product-price');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');
    const closeModal = document.querySelector('.close-modal');

    // Verificar si los elementos del modal existen
    if (!productModal) {
        return;
    }

    // Datos detallados de productos
    const productDetails = {
        1: {
            features: [
                'Pantalla AMOLED de 6.5" con resolución 2400x1080',
                'Cámara principal de 108MP con estabilización óptica',
                'Batería de 5000mAh con carga rápida de 65W',
                'Procesador Snapdragon 8 Gen 2',
                '8GB de RAM y 256GB de almacenamiento',
                'Resistente al agua IP68',
                'Conectividad 5G y WiFi 6'
            ]
        },
        2: {
            features: [
                'Procesador Intel Core i7 de 12va generación',
                '16GB de RAM DDR5 expandible hasta 32GB',
                'SSD NVMe de 512GB de alta velocidad',
                'Pantalla de 14" Full HD con tecnología IPS',
                'Tarjeta gráfica integrada Intel Iris Xe',
                'Batería de hasta 12 horas de duración',
                'Peso ultraligero de solo 1.2kg'
            ]
        },
        3: {
            features: [
                'Cancelación activa de ruido adaptativa',
                'Hasta 30 horas de reproducción con estuche',
                'Drivers de 40mm para sonido de alta fidelidad',
                'Conectividad Bluetooth 5.3 con codec aptX',
                'Carga rápida: 15 min = 3 horas de música',
                'Resistentes al sudor y agua IPX4',
                'Control táctil intuitivo'
            ]
        },
        4: {
            features: [
                'Monitor de ritmo cardíaco 24/7',
                'GPS integrado para seguimiento de rutas',
                'Más de 20 modos deportivos predefinidos',
                'Pantalla AMOLED de 1.4" siempre activa',
                'Batería de hasta 14 días de duración',
                'Resistente al agua hasta 50 metros',
                'Monitoreo del sueño y estrés'
            ]
        },
        5: {
            features: [
                'Pantalla IPS de 10.5" con resolución 2K',
                'Procesador octa-core de alto rendimiento',
                '128GB de almacenamiento expandible',
                '6GB de RAM para multitarea fluida',
                'Cámaras de 13MP trasera y 8MP frontal',
                'Batería de 8000mAh con carga rápida',
                'Soporte para stylus incluido'
            ]
        },
        6: {
            features: [
                'Sensor CMOS de 24.2MP de formato completo',
                'Grabación de video 4K a 60fps',
                'Sistema de enfoque automático de 693 puntos',
                'Estabilización de imagen en 5 ejes',
                'Pantalla LCD táctil de 3.2" articulada',
                'Conectividad WiFi y Bluetooth integrada',
                'Batería de larga duración (hasta 610 fotos)'
            ]
        },
        7: {
            features: [
                'Consola de nueva generación con 1TB de almacenamiento',
                'Procesador AMD Zen 2 de 8 núcleos',
                'GPU personalizada RDNA 2 con ray tracing',
                'Soporte para resolución 4K y 120fps',
                'SSD ultra rápido para tiempos de carga mínimos',
                'Retrocompatibilidad con miles de juegos',
                'Control inalámbrico con retroalimentación háptica'
            ]
        },
        8: {
            features: [
                'Pantalla OLED de 55" con tecnología 4K HDR',
                'Procesador α9 Gen 5 AI con Deep Learning',
                'Dolby Vision IQ y Dolby Atmos integrados',
                'webOS 22 con asistente de voz ThinQ AI',
                'HDMI 2.1 para gaming a 120Hz',
                'Diseño ultra delgado Gallery Design',
                'Certificación NVIDIA G-SYNC Compatible'
            ]
        },
        9: {
            features: [
                'Refrigerador No Frost de 350 litros',
                'Tecnología Twin Cooling Plus',
                'Dispensador de agua y hielo automático',
                'Control de temperatura digital preciso',
                'Cajones FreshZone para frutas y verduras',
                'Eficiencia energética clase A++',
                'Garantía extendida de 10 años en compresor'
            ]
        },
        10: {
            features: [
                'Capacidad de 8kg para familias grandes',
                '14 programas de lavado especializados',
                'Tecnología EcoBubble para lavado eficiente',
                'Motor Digital Inverter ultra silencioso',
                'Función de vapor para eliminar bacterias',
                'Pantalla LED con temporizador',
                'Garantía de 20 años en motor'
            ]
        }
    };

    // Función simple para mostrar el modal
    function showModal(productData) {
        modalProductImage.src = productData.imageSrc;
        modalProductTitle.textContent = productData.name;
        modalProductDescription.textContent = productData.description;
        modalProductPrice.textContent = '$' + parseInt(productData.price).toLocaleString('es-AR') + ' ARS';
        
        // Limpiar características anteriores
        modalProductFeatures.innerHTML = '';
        
        // Agregar características si existen
        if (productDetails[productData.id] && productDetails[productData.id].features) {
            productDetails[productData.id].features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                modalProductFeatures.appendChild(li);
            });
        }
        
        // Configurar botón del modal
        modalAddToCartBtn.setAttribute('data-id', productData.id);
        modalAddToCartBtn.setAttribute('data-name', productData.name);
        modalAddToCartBtn.setAttribute('data-price', productData.price.replace(/[^0-9]/g, ''));
        
        // Mostrar modal
        productModal.style.display = 'flex';
        productModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Agregar event listeners a las imágenes de productos
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach((card) => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function(e) {
            // Evitar que se active si se hace click en el botón de añadir al carrito
            if (e.target.classList.contains('add-to-cart-btn')) {
                return;
            }
            
            e.preventDefault();
            
            // Obtener información del producto
            const productCard = this;
            const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
            const productId = addToCartBtn.getAttribute('data-id');
            const productName = addToCartBtn.getAttribute('data-name');
            const productPrice = addToCartBtn.getAttribute('data-price');
            const productDescription = productCard.querySelector('.product-description').textContent;
            const productImageSrc = productCard.querySelector('.product-image img').src;
            
            // Crear objeto con datos del producto
            const productData = {
                id: productId,
                name: productName,
                price: productPrice,
                description: productDescription,
                imageSrc: productImageSrc
            };
            
            // Mostrar modal
            showModal(productData);
        });
        
        // Variables para detectar movimiento táctil
        let touchStartPos = { x: 0, y: 0 };
        let touchMoved = false;
        
        // Detectar inicio del toque
        card.addEventListener('touchstart', function(e) {
            touchStartPos.x = e.touches[0].clientX;
            touchStartPos.y = e.touches[0].clientY;
            touchMoved = false;
        }, { passive: true });
        
        // Detectar movimiento durante el toque
        card.addEventListener('touchmove', function(e) {
            const touchCurrentX = e.touches[0].clientX;
            const touchCurrentY = e.touches[0].clientY;
            const deltaX = Math.abs(touchCurrentX - touchStartPos.x);
            const deltaY = Math.abs(touchCurrentY - touchStartPos.y);
            
            // Si el movimiento es mayor a 10px, considerarlo como deslizamiento
            if (deltaX > 10 || deltaY > 10) {
                touchMoved = true;
            }
        }, { passive: true });
        
        // Agregar soporte táctil para dispositivos móviles
        card.addEventListener('touchend', function(e) {
            // Evitar que se abra el modal si se hace click en el botón de añadir al carrito
            if (e.target.classList.contains('add-to-cart-btn')) {
                return;
            }
            
            // Solo abrir modal si no hubo movimiento significativo
            if (!touchMoved) {
                // Prevenir el evento click duplicado en dispositivos táctiles
                e.preventDefault();
                
                // Obtener información del producto
                const productCard = this;
                const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
                const productId = addToCartBtn.getAttribute('data-id');
                const productName = addToCartBtn.getAttribute('data-name');
                const productPrice = addToCartBtn.getAttribute('data-price');
                const productDescription = productCard.querySelector('.product-description').textContent;
                const productImageSrc = productCard.querySelector('.product-image img').src;
                
                // Crear objeto con datos del producto
                const productData = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    description: productDescription,
                    imageSrc: productImageSrc
                };
                
                // Mostrar modal
                showModal(productData);
            }
        });
    });

    // Cerrar modal
    function closeProductModal() {
        productModal.classList.remove('active');
        productModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    closeModal.addEventListener('click', closeProductModal);

    // Cerrar modal al hacer clic fuera del contenido
    productModal.addEventListener('click', function(e) {
        if (e.target === productModal) {
            closeProductModal();
        }
    });

    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && productModal.classList.contains('active')) {
            closeProductModal();
        }
    });

    // Funcionalidad del botón agregar al carrito del modal
    modalAddToCartBtn.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        const productName = this.getAttribute('data-name');
        const productPrice = parseInt(this.getAttribute('data-price'));
        
        // Obtener la imagen del modal
        const modalImage = document.getElementById('modal-product-image');
        const imageSrc = modalImage ? modalImage.src : '';
        
        addToCart(productId, productName, productPrice, imageSrc);
        closeProductModal();
        
        // Mostrar animación de éxito
        showCartAnimation(this);
    });

    // Cargar carrito al iniciar
    loadCart();
    updateCartDisplay();
    
    // Variables del carrusel
    let currentSlideIndex = 0;
    let carouselInterval;
    let isDragging = false;
    
    // Funciones del carrusel
    function initializeCarousel() {
        const carouselContainer = document.querySelector('.carousel-container');
        if (!carouselContainer) return;
        
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        
        if (slides.length === 0) return;
        
        // Eventos de los botones
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                previousSlide();
                resetCarouselInterval();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetCarouselInterval();
            });
        }
        
        // Eventos de los indicadores
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                goToSlide(index);
                resetCarouselInterval();
            });
        });
        
        // Auto-play del carrusel
        startCarouselInterval();
        
        // Pausar auto-play al hacer hover
        carouselContainer.addEventListener('mouseenter', stopCarouselInterval);
        carouselContainer.addEventListener('mouseleave', startCarouselInterval);
        
        // Soporte para navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                previousSlide();
                resetCarouselInterval();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                resetCarouselInterval();
            }
        });
        
        // Soporte para deslizamiento táctil natural en móviles
        let touchStartX = 0;
        let touchCurrentX = 0;
        let isDragging = false;
        let startTransform = 0;
        const slidesContainer = carouselContainer.querySelector('.carousel-slides');
        
        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchCurrentX = touchStartX;
            isDragging = true;
            
            // Usar directamente el índice actual para evitar inconsistencias
            startTransform = -currentSlideIndex * 33.333;
            
            stopCarouselInterval();
            // Eliminar completamente las transiciones durante gestos táctiles
            slidesContainer.style.transition = 'none';
        }, { passive: true });
        
        carouselContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            touchCurrentX = e.changedTouches[0].screenX;
            const deltaX = touchCurrentX - touchStartX;
            const containerWidth = carouselContainer.offsetWidth;
            // Convertir el movimiento del dedo a porcentaje del contenedor de slides
            const dragPercentage = (deltaX / containerWidth) * 33.333;
            
            // Aplicar transformación en tiempo real siguiendo el dedo
            const newTransform = startTransform + dragPercentage;
            slidesContainer.style.transition = 'none'; // Sin transición durante el arrastre
            slidesContainer.style.transform = `translateX(${newTransform}%)`;
        }, { passive: true });
        
        carouselContainer.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            const swipeDistance = touchCurrentX - touchStartX;
            const containerWidth = carouselContainer.offsetWidth;
            const swipeThreshold = containerWidth * 0.25; // Aumentar umbral para reducir sensibilidad
            
            // Restaurar transición suave
            slidesContainer.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0) {
                    // Deslizamiento hacia la derecha - slide anterior
                    const newIndex = currentSlideIndex > 0 ? currentSlideIndex - 1 : 2;
                    currentSlideIndex = newIndex;
                    slidesContainer.style.transform = `translateX(-${currentSlideIndex * 33.333}%)`;
                } else {
                    // Deslizamiento hacia la izquierda - slide siguiente
                    const newIndex = currentSlideIndex < 2 ? currentSlideIndex + 1 : 0;
                    currentSlideIndex = newIndex;
                    slidesContainer.style.transform = `translateX(-${currentSlideIndex * 33.333}%)`;
                }
                // Actualizar indicadores sin llamar showSlide para evitar conflictos
                updateIndicators();
            } else {
                // Volver a la posición original si no se alcanzó el umbral
                slidesContainer.style.transform = `translateX(-${currentSlideIndex * 33.333}%)`;
            }
            
            resetCarouselInterval();
        }, { passive: true });
        
        // Cancelar arrastre si se sale del área
         carouselContainer.addEventListener('touchcancel', (e) => {
             if (isDragging) {
                 isDragging = false;
                 slidesContainer.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                 slidesContainer.style.transform = `translateX(-${currentSlideIndex * 33.333}%)`;
                 resetCarouselInterval();
             }
         }, { passive: true });
    }
    
    function showSlide(index) {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        const slidesContainer = document.querySelector('.carousel-slides');
        
        if (slides.length === 0) return;
        
        // Remover clase active de todos los slides e indicadores
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Asegurar que el índice esté en el rango válido
        if (index >= slides.length) {
            currentSlideIndex = 0;
        } else if (index < 0) {
            currentSlideIndex = slides.length - 1;
        } else {
            currentSlideIndex = index;
        }
        
        // Aplicar transformación CSS para mostrar el slide correcto
        if (slidesContainer) {
            // Solo aplicar transición si no se está arrastrando
            if (!isDragging) {
                slidesContainer.style.transition = 'transform 0.5s ease-in-out';
            }
            // Con 3 slides en flexbox, cada slide ocupa 33.333% del contenedor
            slidesContainer.style.transform = `translateX(-${currentSlideIndex * 33.333}%)`;
        }
        
        // Mostrar slide e indicador activos
        if (slides[currentSlideIndex]) {
            slides[currentSlideIndex].classList.add('active');
        }
        if (indicators[currentSlideIndex]) {
            indicators[currentSlideIndex].classList.add('active');
        }
    }
    
    function nextSlide() {
        showSlide(currentSlideIndex + 1);
    }
    
    function previousSlide() {
        showSlide(currentSlideIndex - 1);
    }
    
    function goToSlide(index) {
        showSlide(index);
    }
    
    function updateIndicators() {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        
        // Remover clase active de todos los slides e indicadores
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Mostrar slide e indicador activos
        if (slides[currentSlideIndex]) {
            slides[currentSlideIndex].classList.add('active');
        }
        if (indicators[currentSlideIndex]) {
            indicators[currentSlideIndex].classList.add('active');
        }
    }
    
    function startCarouselInterval() {
        // Limpiar cualquier intervalo existente antes de crear uno nuevo
        if (carouselInterval) {
            clearInterval(carouselInterval);
        }
        carouselInterval = setInterval(() => {
            nextSlide();
        }, 5000); // Cambiar slide cada 5 segundos
    }
    
    function stopCarouselInterval() {
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null; // Resetear la variable
        }
    }
    
    function resetCarouselInterval() {
        stopCarouselInterval();
        startCarouselInterval();
    }
    
    // Inicializar carrusel
    initializeCarousel();
});