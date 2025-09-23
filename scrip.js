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
    const floatingCart = document.getElementById('floating-cart');
    const floatingCartCount = document.getElementById('floating-cart-count');

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
                // Obtener información adicional del producto
                const productImage = item.querySelector('.product-image img');
                const productDescription = item.querySelector('.product-description');
                const productPrice = item.querySelector('.product-price');
                const addToCartBtn = item.querySelector('.add-to-cart-btn');
                
                // Extraer un fragmento de texto que contiene el término de búsqueda
                const snippet = extractSnippet(itemText, term);
                
                // Agregar el resultado a la lista de resultados
                results.push({
                    id: itemId,
                    title: itemTitle,
                    snippet: snippet,
                    image: productImage ? productImage.src : '',
                    imageAlt: productImage ? productImage.alt : '',
                    description: productDescription ? productDescription.textContent : '',
                    price: productPrice ? productPrice.textContent : '',
                    productId: addToCartBtn ? addToCartBtn.getAttribute('data-id') : '',
                    productName: addToCartBtn ? addToCartBtn.getAttribute('data-name') : '',
                    productPrice: addToCartBtn ? addToCartBtn.getAttribute('data-price') : ''
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
        

        
        // Crear un elemento para cada resultado con diseño horizontal
        results.forEach(result => {
            // Crear el elemento del resultado con diseño horizontal
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            // Crear la imagen del producto
            const resultImageContainer = document.createElement('div');
            resultImageContainer.className = 'search-result-image';
            
            if (result.image) {
                const resultImage = document.createElement('img');
                resultImage.src = result.image;
                resultImage.alt = result.imageAlt;
                resultImage.loading = 'lazy';
                resultImageContainer.appendChild(resultImage);
            } else {
                // Placeholder si no hay imagen
                const placeholder = document.createElement('div');
                placeholder.className = 'image-placeholder';
                placeholder.innerHTML = '<i class="fas fa-image"></i>';
                resultImageContainer.appendChild(placeholder);
            }
            
            // Crear el contenedor de información del producto
            const resultInfo = document.createElement('div');
            resultInfo.className = 'search-result-info';
            
            // Crear el título del resultado
            const resultTitle = document.createElement('h3');
            resultTitle.className = 'search-result-title';
            resultTitle.innerHTML = highlightTerm(result.title, term);
            
            // Crear la descripción del producto
            const resultDescription = document.createElement('p');
            resultDescription.className = 'search-result-description';
            resultDescription.innerHTML = highlightTerm(result.description, term);
            
            // Crear el precio del producto
            const resultPrice = document.createElement('p');
            resultPrice.className = 'search-result-price';
            resultPrice.innerHTML = highlightTerm(result.price, term);
            
            // Agregar elementos al contenedor de información
            resultInfo.appendChild(resultTitle);
            resultInfo.appendChild(resultDescription);
            resultInfo.appendChild(resultPrice);
            
            // Crear el contenedor de acciones
            const resultActions = document.createElement('div');
            resultActions.className = 'search-result-actions';
            
            // Crear botón de agregar al carrito
            if (result.productId) {
                const addToCartBtn = document.createElement('button');
                addToCartBtn.className = 'search-add-to-cart-btn';
                addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Agregar';
                addToCartBtn.setAttribute('data-id', result.productId);
                addToCartBtn.setAttribute('data-name', result.productName);
                addToCartBtn.setAttribute('data-price', result.productPrice);
                
                // Event listener para agregar al carrito
                addToCartBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const productId = this.getAttribute('data-id');
                    const productName = this.getAttribute('data-name');
                    const productPrice = this.getAttribute('data-price');
                    
                    // Convertir el precio a número (viene como string sin formato)
                    const priceNumber = parseInt(productPrice);
                    
                    // Llamar a addToCart con los parámetros correctos
                    addToCart(productId, productName, priceNumber, result.image, e);
                    
                    // Feedback visual
                    this.innerHTML = '<i class="fas fa-check"></i> Agregado';
                    this.style.backgroundColor = '#28a745';
                    setTimeout(() => {
                        this.innerHTML = '<i class="fas fa-cart-plus"></i> Agregar';
                        this.style.backgroundColor = '';
                    }, 2000);
                });
                
                resultActions.appendChild(addToCartBtn);
            }
            
            // Crear enlace para ver más detalles
            const resultLink = document.createElement('button');
            resultLink.className = 'search-view-more-btn';
            resultLink.innerHTML = '<i class="fas fa-eye"></i> Ver más';
            resultLink.addEventListener('click', function(event) {
                event.preventDefault();
                
                // Ocultar los resultados
                const searchResultsSection = document.querySelector('.search-results');
                searchResultsSection.classList.remove('active');
                
                // Resaltar el elemento encontrado
                const targetElement = document.getElementById(result.id);
                if (targetElement) {
                    highlightElement(targetElement);
                    // Scroll suave al elemento
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
            
            resultActions.appendChild(resultLink);
            
            // Ensamblar el resultado completo
            resultItem.appendChild(resultImageContainer);
            resultItem.appendChild(resultInfo);
            resultItem.appendChild(resultActions);
            
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
        floatingCartCount.textContent = totalItems;
        
        // Mostrar u ocultar el carrito flotante según si hay productos
        if (totalItems > 0) {
            floatingCart.classList.add('show');
        } else {
            floatingCart.classList.remove('show');
        }
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
        
        // Obtener coordenadas del evento (compatible con touch y mouse)
        let clientX, clientY;
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else if (event.changedTouches && event.changedTouches.length > 0) {
            clientX = event.changedTouches[0].clientX;
            clientY = event.changedTouches[0].clientY;
        } else {
            clientX = event.clientX || event.target.getBoundingClientRect().left + event.target.offsetWidth / 2;
            clientY = event.clientY || event.target.getBoundingClientRect().top + event.target.offsetHeight / 2;
        }
        
        // Posicionar el elemento en la posición del clic/touch
        animationElement.style.left = clientX + 'px';
        animationElement.style.top = clientY + 'px';
        
        // Agregar el elemento al body
        document.body.appendChild(animationElement);
        
        // Obtener la posición del icono del carrito
        const cartIconRect = cartIcon.getBoundingClientRect();
        const cartIconX = cartIconRect.left + cartIconRect.width / 2;
        const cartIconY = cartIconRect.top + cartIconRect.height / 2;
        
        // Usar requestAnimationFrame para mejor rendimiento
        requestAnimationFrame(() => {
            // Animar el elemento hacia el icono del carrito
            animationElement.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            animationElement.style.left = cartIconX + 'px';
            animationElement.style.top = cartIconY + 'px';
            animationElement.style.opacity = '0';
            animationElement.style.transform = 'scale(0.1)';
        });
        
        // Eliminar el elemento después de la animación
        setTimeout(function() {
            if (animationElement.parentNode) {
                document.body.removeChild(animationElement);
            }
        }, 600);
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
            color: #007bff;
            font-weight: 600;
            background-color: rgba(0, 123, 255, 0.1);
            padding: 2px 4px;
            border-radius: 3px;
            border-bottom: 2px solid #007bff;
        }
        
        .highlight-element {
            animation: highlight-pulse 2s;
        }
        
        @keyframes highlight-pulse {
            0% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
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
        // Ocultar carrito flotante cuando se abre el carrito principal
        if (floatingCart) {
            floatingCart.classList.remove('show');
        }
    });
    
    // Abrir carrito al hacer clic en el carrito flotante
    if (floatingCart) {
        floatingCart.addEventListener('click', function() {
            shoppingCart.classList.add('active');
            overlay.classList.add('active');
            // Ocultar carrito flotante cuando se abre el carrito principal
            floatingCart.classList.remove('show');
        });
    }
    
    // Cerrar carrito al hacer clic en el botón de cerrar
    closeCart.addEventListener('click', function() {
        shoppingCart.classList.remove('active');
        overlay.classList.remove('active');
        // Mostrar carrito flotante si hay productos
        if (floatingCart && cart.length > 0) {
            floatingCart.classList.add('show');
        }
    });
    
    // Cerrar carrito al hacer clic en el overlay
    overlay.addEventListener('click', function() {
        shoppingCart.classList.remove('active');
        overlay.classList.remove('active');
        // Mostrar carrito flotante si hay productos
        if (floatingCart && cart.length > 0) {
            floatingCart.classList.add('show');
        }
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
        console.error('Modal de producto no encontrado');
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
        if (!productModal) return;
        
        if (modalProductImage) modalProductImage.src = productData.imageSrc;
        if (modalProductTitle) modalProductTitle.textContent = productData.name;
        if (modalProductDescription) modalProductDescription.textContent = productData.description;
        if (modalProductPrice) modalProductPrice.textContent = '$' + parseInt(productData.price).toLocaleString('es-AR') + ' ARS';
        
        // Limpiar características anteriores
        if (modalProductFeatures) modalProductFeatures.innerHTML = '';
        
        // Agregar características si existen
        if (modalProductFeatures && productDetails[productData.id] && productDetails[productData.id].features) {
            productDetails[productData.id].features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                modalProductFeatures.appendChild(li);
            });
        }
        
        // Configurar botón del modal
        if (modalAddToCartBtn) {
            modalAddToCartBtn.setAttribute('data-id', productData.id);
            modalAddToCartBtn.setAttribute('data-name', productData.name);
            modalAddToCartBtn.setAttribute('data-price', productData.price.replace(/[^0-9]/g, ''));
        }
        
        // Mostrar modal
        productModal.style.display = 'flex';
        productModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Agregar event listeners a las imágenes de productos
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach((card) => {
        card.style.cursor = 'pointer';
        
        // Evento click simple para todos los dispositivos
        card.addEventListener('click', function(e) {
            // Evitar que se active si se hace click en el botón de añadir al carrito
            if (e.target.classList.contains('add-to-cart-btn')) {
                return;
            }
            
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
    });

    // Cerrar modal
    function closeProductModal() {
        productModal.classList.remove('active');
        productModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    if (closeModal) {
        closeModal.addEventListener('click', closeProductModal);
    }

    // Cerrar modal al hacer clic fuera del contenido
    if (productModal) {
        productModal.addEventListener('click', function(e) {
            if (e.target === productModal) {
                closeProductModal();
            }
        });
    }

    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && productModal && productModal.classList.contains('active')) {
            closeProductModal();
        }
    });

    // Funcionalidad del botón agregar al carrito del modal
    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener('click', function(event) {
        const productId = this.getAttribute('data-id');
        const productName = this.getAttribute('data-name');
        const productPrice = parseInt(this.getAttribute('data-price'));
        
        // Obtener la imagen del modal
        const modalImage = document.getElementById('modal-product-image');
        const imageSrc = modalImage ? modalImage.src : '';
        
        addToCart(productId, productName, productPrice, imageSrc);
        
        // Mostrar indicador visual en el botón
        showAddedToCartIndicator(this);
        
        // Mostrar animación de éxito
        showAddToCartAnimation(event);
        
        // Cerrar modal después de un breve delay para que se vea el feedback
        setTimeout(() => {
            closeProductModal();
        }, 800);
        });
    }

    // Cargar carrito al iniciar
    loadCart();
    updateCartDisplay();
    
    // Variables del carrusel
    let currentSlideIndex = 0;
    let carouselInterval;
    let isDragging = false;
    let isAutoPlayActive = true;
    
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
            
            // Feedback visual: reducir ligeramente la escala del carrusel
            carouselContainer.style.transform = 'scale(0.98)';
            carouselContainer.style.transition = 'transform 0.2s ease';
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
            
            // Feedback visual adicional: cambiar opacidad basado en la distancia del arrastre
            const dragIntensity = Math.min(Math.abs(deltaX) / containerWidth, 0.3);
            carouselContainer.style.filter = `brightness(${1 - dragIntensity * 0.2})`;
        }, { passive: true });
        
        carouselContainer.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            const swipeDistance = touchCurrentX - touchStartX;
            const containerWidth = carouselContainer.offsetWidth;
            const swipeThreshold = containerWidth * 0.25; // Aumentar umbral para reducir sensibilidad
            
            // Restaurar transición suave
            slidesContainer.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            // Restaurar efectos visuales
            carouselContainer.style.transform = 'scale(1)';
            carouselContainer.style.filter = 'brightness(1)';
            carouselContainer.style.transition = 'transform 0.3s ease, filter 0.3s ease';
            
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
                
                // Feedback visual de éxito: breve pulso
                setTimeout(() => {
                    carouselContainer.style.transform = 'scale(1.02)';
                    setTimeout(() => {
                        carouselContainer.style.transform = 'scale(1)';
                    }, 100);
                }, 50);
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
                 
                 // Restaurar efectos visuales
                 carouselContainer.style.transform = 'scale(1)';
                 carouselContainer.style.filter = 'brightness(1)';
                 carouselContainer.style.transition = 'transform 0.3s ease, filter 0.3s ease';
                 
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
        // Solo iniciar si el auto-play está activo
        if (!isAutoPlayActive) return;
        
        // Limpiar cualquier intervalo existente antes de crear uno nuevo
        if (carouselInterval) {
            clearInterval(carouselInterval);
        }
        carouselInterval = setInterval(() => {
            nextSlide();
        }, 5000); // Cambiar slide cada 5 segundos
    }
    
    function toggleAutoPlay() {
        const playPauseIcon = document.getElementById('play-pause-icon');
        
        if (isAutoPlayActive) {
            // Pausar auto-play
            stopCarouselInterval();
            isAutoPlayActive = false;
            if (playPauseIcon) {
                playPauseIcon.className = 'fas fa-play';
            }
        } else {
            // Reanudar auto-play
            isAutoPlayActive = true;
            startCarouselInterval();
            if (playPauseIcon) {
                playPauseIcon.className = 'fas fa-pause';
            }
        }
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

    // ==========================================
    // SISTEMA DE BÚSQUEDA INTELIGENTE
    // ==========================================

    // Base de datos de sugerencias y palabras clave
    const searchSuggestions = [
        { text: 'laptop', type: 'producto', icon: 'fas fa-laptop' },
        { text: 'notebook', type: 'producto', icon: 'fas fa-laptop' },
        { text: 'computadora', type: 'producto', icon: 'fas fa-desktop' },
        { text: 'gaming', type: 'categoría', icon: 'fas fa-gamepad' },
        { text: 'asus', type: 'marca', icon: 'fas fa-tag' },
        { text: 'xbox', type: 'producto', icon: 'fab fa-xbox' },
        { text: 'consola', type: 'producto', icon: 'fas fa-gamepad' },
        { text: 'procesador', type: 'componente', icon: 'fas fa-microchip' },
        { text: 'memoria', type: 'componente', icon: 'fas fa-memory' },
        { text: 'ram', type: 'componente', icon: 'fas fa-memory' },
        { text: 'ssd', type: 'componente', icon: 'fas fa-hdd' },
        { text: 'disco', type: 'componente', icon: 'fas fa-hdd' },
        { text: 'gráfica', type: 'componente', icon: 'fas fa-tv' },
        { text: 'monitor', type: 'producto', icon: 'fas fa-desktop' },
        { text: 'teclado', type: 'accesorio', icon: 'fas fa-keyboard' },
        { text: 'mouse', type: 'accesorio', icon: 'fas fa-mouse' },
        { text: 'auriculares', type: 'accesorio', icon: 'fas fa-headphones' }
    ];

    // Variables para el sistema de búsqueda inteligente
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    let currentSuggestionIndex = -1;
    let filteredSuggestions = [];
    let searchTimeout;

    // Elementos del DOM para búsqueda inteligente (reutilizando searchInput ya definido)
    const suggestionsDropdown = document.getElementById('search-suggestions-dropdown');
    const suggestionsList = document.getElementById('suggestions-list');
    const historyList = document.getElementById('history-list');

    // Función para guardar historial en localStorage
    function saveSearchHistory() {
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }

    // Función para agregar término al historial
    function addToHistory(term) {
        // Remover si ya existe
        searchHistory = searchHistory.filter(item => item !== term);
        // Agregar al inicio
        searchHistory.unshift(term);
        // Mantener solo los últimos 10
        searchHistory = searchHistory.slice(0, 10);
        saveSearchHistory();
    }

    // Función para remover término del historial
    function removeFromHistory(term) {
        searchHistory = searchHistory.filter(item => item !== term);
        saveSearchHistory();
        updateHistoryDisplay();
    }

    // Función para limpiar todo el historial
    function clearAllHistory() {
        // Agregar animación de feedback al botón
        const clearBtn = document.getElementById('clear-all-history');
        if (clearBtn) {
            clearBtn.style.transform = 'scale(0.95)';
            clearBtn.style.opacity = '0.7';
            
            setTimeout(() => {
                clearBtn.style.transform = '';
                clearBtn.style.opacity = '';
            }, 150);
        }
        
        // Limpiar historial
        searchHistory = [];
        saveSearchHistory();
        updateHistoryDisplay();
        
        // Ocultar dropdown si no hay historial
        if (suggestionsDropdown.classList.contains('active')) {
            const query = searchInput.value.trim();
            if (!query || filterSuggestions(query).length === 0) {
                suggestionsDropdown.classList.remove('active');
            }
        }
    }

    // Función para filtrar sugerencias
    function filterSuggestions(query) {
        if (!query || query.length < 1) return [];
        
        const lowerQuery = query.toLowerCase();
        return searchSuggestions.filter(suggestion => 
            suggestion.text.toLowerCase().includes(lowerQuery)
        ).slice(0, 6); // Máximo 6 sugerencias
    }

    // Función para crear elemento de sugerencia
    function createSuggestionElement(suggestion, isHistory = false) {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        
        if (isHistory) {
            item.innerHTML = `
                <i class="suggestion-icon fas fa-history"></i>
                <span class="suggestion-text">${suggestion}</span>
                <i class="history-remove fas fa-times" data-term="${suggestion}"></i>
            `;
        } else {
            item.innerHTML = `
                <i class="suggestion-icon ${suggestion.icon}"></i>
                <span class="suggestion-text">${suggestion.text}</span>
                <span class="suggestion-type">${suggestion.type}</span>
            `;
        }
        
        return item;
    }

    // Función para actualizar display de sugerencias
    function updateSuggestionsDisplay(query) {
        suggestionsList.innerHTML = '';
        
        if (!query || query.length < 1) {
            return;
        }

        filteredSuggestions = filterSuggestions(query);
        
        filteredSuggestions.forEach((suggestion, index) => {
            const item = createSuggestionElement(suggestion);
            item.addEventListener('click', () => {
                selectSuggestion(suggestion.text);
            });
            suggestionsList.appendChild(item);
        });
    }

    // Función para actualizar display de historial
    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        
        searchHistory.slice(0, 5).forEach(term => {
            const item = createSuggestionElement(term, true);
            
            // Click en el término
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('history-remove')) {
                    selectSuggestion(term);
                }
            });
            
            // Click en el botón de remover
            const removeBtn = item.querySelector('.history-remove');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromHistory(term);
            });
            
            historyList.appendChild(item);
        });
    }

    // Función para seleccionar una sugerencia
    function selectSuggestion(text) {
        searchInput.value = text;
        hideSuggestions();
        // Disparar búsqueda automáticamente
        searchForm.dispatchEvent(new Event('submit'));
    }

    // Función para mostrar sugerencias
    function showSuggestions() {
        updateHistoryDisplay();
        suggestionsDropdown.classList.add('active');
    }

    // Función para ocultar sugerencias
    function hideSuggestions() {
        suggestionsDropdown.classList.remove('active');
        currentSuggestionIndex = -1;
        clearHighlight();
    }

    // Función para limpiar resaltado
    function clearHighlight() {
        const highlighted = suggestionsDropdown.querySelectorAll('.suggestion-item.highlighted');
        highlighted.forEach(item => item.classList.remove('highlighted'));
    }

    // Función para resaltar sugerencia
    function highlightSuggestion(index) {
        clearHighlight();
        const allItems = suggestionsDropdown.querySelectorAll('.suggestion-item');
        if (allItems[index]) {
            allItems[index].classList.add('highlighted');
            allItems[index].scrollIntoView({ block: 'nearest' });
        }
    }

    // Función para navegar con teclado
    function navigateWithKeyboard(direction) {
        const allItems = suggestionsDropdown.querySelectorAll('.suggestion-item');
        const totalItems = allItems.length;
        
        if (totalItems === 0) return;
        
        if (direction === 'down') {
            currentSuggestionIndex = (currentSuggestionIndex + 1) % totalItems;
        } else if (direction === 'up') {
            currentSuggestionIndex = currentSuggestionIndex <= 0 ? totalItems - 1 : currentSuggestionIndex - 1;
        }
        
        highlightSuggestion(currentSuggestionIndex);
    }

    // Función para seleccionar sugerencia resaltada
    function selectHighlightedSuggestion() {
        const highlighted = suggestionsDropdown.querySelector('.suggestion-item.highlighted');
        if (highlighted) {
            const text = highlighted.querySelector('.suggestion-text').textContent;
            selectSuggestion(text);
        }
    }

    // Event listeners para el input de búsqueda
    searchInput.addEventListener('focus', () => {
        showSuggestions();
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Debounce para evitar demasiadas actualizaciones
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            updateSuggestionsDisplay(query);
            if (query.length > 0) {
                showSuggestions();
            }
        }, 150);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (!suggestionsDropdown.classList.contains('active')) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                navigateWithKeyboard('down');
                break;
            case 'ArrowUp':
                e.preventDefault();
                navigateWithKeyboard('up');
                break;
            case 'Enter':
                if (currentSuggestionIndex >= 0) {
                    e.preventDefault();
                    selectHighlightedSuggestion();
                }
                break;
            case 'Escape':
                hideSuggestions();
                searchInput.blur();
                break;
        }
    });

    // Event listener para el botón de limpiar todo el historial
    const clearAllHistoryBtn = document.getElementById('clear-all-history');
    if (clearAllHistoryBtn) {
        clearAllHistoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Limpiar historial directamente
            clearAllHistory();
        });
    }

    // Ocultar sugerencias al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            hideSuggestions();
        }
    });

    // Modificar el event listener del formulario existente para agregar al historial
    const originalSubmitHandler = searchForm.onsubmit;
    searchForm.addEventListener('submit', function(e) {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            addToHistory(searchTerm);
            hideSuggestions();
        }
    });

    // Inicializar display de historial
    updateHistoryDisplay();
});