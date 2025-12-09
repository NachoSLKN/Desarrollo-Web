from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Servimos los archivos estáticos (como imágenes)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/my-first-api", response_class=HTMLResponse)
def page_with_logo():
    return """
    <html>
        <head>
            <title>Mi API</title>
            <style>
                body {
                    font-family: Arial;
                    background-color: #222;
                    color: white;
                    text-align: center;
                    padding-top: 50px;
                }
                img {
                    margin-top: 20px;
                    width: 150px;
                }
            </style>
        </head>
        <body>
            <h3>FastAPI</h3>
            <h1>Ignacio Liñán Vicente<h1>
            <img src="/static/logo.png" alt="Logo">
        </body>
    </html>
    """
