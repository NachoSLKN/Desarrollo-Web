import json
from pymongo import MongoClient

client = MongoClient("mongodb://db:27017")
db = client.proyecto_musica
collection = db.albums

# Borra todo
collection.delete_many({})

# Ruta correcta dentro del contenedor
with open("app/albums_full.json", "r", encoding="utf-8") as file:
    albums = json.load(file)

collection.insert_many(albums)

print("Álbumes importados correctamente")
