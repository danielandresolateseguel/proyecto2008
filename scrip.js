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
            
            // Obtener la imagen del producto
            const productCard = this.closest('.product-card');
            const productImage = productCard.querySelector('.product-image img');
            const imageSrc = productImage ? productImage.src : '';
            
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
            mensaje += `${index + 1}. ${item.name}\n`;
            mensaje += `   Cantidad: ${item.quantity}\n`;
            mensaje += `   Precio unitario: ${precioFormateado}\n`;
            mensaje += `   Subtotal: $${parseInt(item.price * item.quantity).toLocaleString('es-AR')} ARS\n\n`;
        });
        
        // Agregar el total
        const totalText = cartTotalPrice.textContent;
        mensaje += `💰 TOTAL: ${totalText}\n\n`;
        mensaje += '¿Podrías confirmarme la disponibilidad y el método de entrega?\n\n';
        mensaje += '¡Muchas gracias! 😊';
        
        // Codificar el mensaje para URL
        const mensajeCodificado = encodeURIComponent(mensaje);
        
        // Crear el enlace de WhatsApp (puedes cambiar el número por el tuyo)
        const numeroWhatsApp = '+5492615863590'; // Cambia este número por tu número de WhatsApp
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
        
        // Verificar si el término de búsqueda está vacío
        if (searchTerm === '') {
            // Mostrar mensaje de que no hay resultados
            resultsContainer.innerHTML = '<p class="no-results">Por favor, ingresa un término de búsqueda.</p>';
            return;
        }
        
        // Realizar la búsqueda
        const results = performSearch(searchTerm, searchableItems);
        
        // Mostrar los resultados
        displayResults(results, searchTerm, resultsContainer);
    });
    
    // Cargar carrito al iniciar
    loadCart();
    updateCartDisplay();
});