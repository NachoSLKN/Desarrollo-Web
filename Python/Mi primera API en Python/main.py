from fastapi import FastAPI #Importamos la clase FASTAPI del módulo fastapi que usaremos para crear nuestra app web (La API) 
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles #Sirve para decirle a FastAPI que sirva archivos estáticos (imágenes, CSS,...)
import csv #Importamos el módulo estandar csv de Python


iesazarquiel = FastAPI(
    title="API IES Azarquiel",
    version = "1.0.0"
)

iesazarquiel.mount("/static", StaticFiles(directory="static"), name="static")

#Leerá y devolverá una lista con los datos de los alumnos. 
def cargar_alumnos():
    alumnos=[] #Lista vacía de alumnos. Metemos cada fila del CSV convertida en un DICCIONARIO.
    #Open "datos_alumnos.csv" abre el archivo. Newline evita problema de duplicados y el Encoding permite leer acentos.
    with open("datos_alumnos.csv", newline="", encoding="latin-1") as f: #Guardamos el archivo abierto en la variable F; El archivo se abre y al salir se cierra automáticamente.

        lector = csv.DictReader(f, delimiter=";")
        #Convierte cada linea de CSV en un diccionario:
        #DictReader lee la primera fila del diccionario del csv para usarla como claves del diccionario.
        #Delimitter = "," indica que las columnas están separadas por comas (,) si nuestro CSV usara ; habría que poner ;
        #Fila del CSV
        #Apellidos,Nombre,ID,Asistencia,Parcial1
        #Anido Bonet,David,1001,90%,5.5
        #Conversión a diccionario:
        #{
            #"Apellidos": "Anido Bonet",
            #"Nombre": "David",
            #"ID": "1001",
            #"Asistencia": "90%",
            #"Parcial1": "5.5"
        #}

        for fila in lector:#Recorre cada linea del archivo ya convertida en un diccionario 
            #Ejemplo
            #Primera fila = datos de Nacho
            #Segunda fila = datos de Lucía
            
            alumnos.append(fila) #Agrega cada diccionario (cada alumno) a la lista de alumnos
    return alumnos #Devuelve la lista completa con todos los alumnos del CSV. Esta función se puede utilizar en cualquier endpoint para acceder fácilmente a los datos


@iesazarquiel.get("/info-alumnos") #Decorador: indica a FastAPI que esta función será un endpoint de tipo GET.
#Responderá cuando alguien haga una petición a la ruta /info-alumnos.
#Devuelve un JSON de la forma {"ids": ["1001", "1002",...]}
def info_alumnos(): #Función que se ejecutará cuando entren a /info-alumnos
    alumnos=cargar_alumnos() #Llamada a la función que lee el CSV
    #Alumnos es una lista de diccionarios con todos los alumnos
    ids=[alumno["ID"] for alumno in alumnos] #Lista por comprensión: recorre cada alumno de la lista alumnos y recoge el valor de la clave "ID"
    return {"ids": ids} #Devolvemos un diccionario como respuesta. FastAPI lo convierte automáticamente a JSON


@iesazarquiel.get("/asistencia") #Declaración de un endpoint de tipo GET en la ruta /asistencia
def asistencia(id: str | None = None): #Definición de la función asistencia: id es de tipo str o puede ser none
#Si no se pasa en la URL, el valor por defecto será None. Esto hace que el parámetro sea opcional.
    alumnos=cargar_alumnos() #Cargamos todos los alumnos desde el CSV

    if id is None: #Comprobamos si se ha llamado a /asistencia sin parámetros
        ids = [alumno["ID"] for alumno in alumnos] #Hacemos una lista con todos los IDs para ayudar al usuario
        return{
            "mensaje": "Debes indicar un parámetro opcional",
            "ejemplo": "/asistencia?id=1001",
            "ids_disponibles": ids
        }

    alumno = next((a for a in alumnos if a["ID"] == id), None) #Buscamos en la lista alumnos aquel ID que coincida con el id recibido
    #Usamos next con una expresión generadora
    
    if alumno is None: #Si no se encontró ningún alumno con ese ID, devolvemos un mensaje de error.
        return {"error": "El ID especificado no existe"}

    return { #Si encontramos el alumno, devolvemos: Sus apellidos, su nombre y su asistencia.
        #Esto saldrá del diccionario alumno que viene del CSV
        "Nombre": alumno["Nombre"],
        "Apellidos": alumno["Apellidos"],
        "Asistencia": alumno["Asistencia"]
    }



@iesazarquiel.get("/notas")
def notas(id: str | None = None, nota: str | None = None): #ID y Nota son parámetros opcionales, si el usuario no los escribe valdrán None
    alumnos = cargar_alumnos() #Llama a la  función que lee datos_alumnos.csv
    #Por cada alumno crearemos un diccionario.
    # Lista de columnas que son notas según tu CSV
    columnas_notas = ["Parcial1", "Parcial2", "Ordinario1", "Practicas", "OrdinarioPracticas"] #Lista con los nombres exactos de las columnas del CSV

    if id is None and nota is None: #Caso sin parámetros
        ids = [alumno["ID"] for alumno in alumnos]
        return {
            "mensaje": "Debes indicar parámetros opcionales: id y nota",
            "ejemplos": [
                "/notas?id=1001",
                "/notas?id=1001&nota=Parcial1"
            ],
            "ids_disponibles": ids, #Devuelve todos los ids disponibles
            "notas_disponibles": columnas_notas #Devuelve los nombres de las notas disponibles
        }

    if id is None and nota is not None: #Caso con nota sin id
        return {
            "error": "Si especificas 'nota', también debes especificar 'id'.",
            "ejemplo": "/notas?id=1001&nota=Parcial1"
        }

    alumno = next((a for a in alumnos if a["ID"] == id), None) #Búsqueda del alumno por ID
    if alumno is None:
        return {"error": "El ID especificado no existe"}

    if nota is None: #Cuando solo se pasa el id
        notas_alumno = {col: alumno[col] for col in columnas_notas} #Extrae todas las notas y crea un diccionario por comprensión
        return {
            "Nombre": alumno["Nombre"],
            "Apellidos": alumno["Apellidos"],
            "Notas": notas_alumno
        }

    if nota not in columnas_notas: #Comprobar que la nota existe
        return {
            "error": "La nota especificada no existe",
            "notas_disponibles": columnas_notas
        }

    return { #Con ID y nota: devuelve nota concreta
        "Nombre": alumno["Nombre"],
        "Apellidos": alumno["Apellidos"],
        "Nota pedida": {nota: alumno[nota]}
    }
