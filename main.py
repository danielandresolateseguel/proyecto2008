import http.server
import socketserver
import os

# Cambiar al directorio del proyecto correcto (carpeta que contiene los HTML/CSS)
os.chdir(r'C:\Daniel Olate\Proyecto 20.08\Proyecto 20.08')

# Configurar el servidor
PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Servidor ejecutándose en http://localhost:{PORT}/")
    print("Presiona Ctrl+C para detener el servidor")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido")
        httpd.shutdown()