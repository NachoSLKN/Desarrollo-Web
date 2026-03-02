from flask import Flask, render_template, redirect, url_for, request, session
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from forms import AlbumForm

app = Flask(__name__)
app.config["SECRET_KEY"] = "supersecret"

# ======================
# CONEXIÓN MONGO
# ======================

client = MongoClient("mongodb://db:27017")
db = client.proyecto_musica
collection = db.albums
users = db.users


# ======================
# HOME
# ======================

@app.route("/")
def inicio():
    total = collection.count_documents({})
    return render_template("inicio.html", total=total)


# ======================
# READ
# ======================

@app.route("/read")
def read():
    albums = collection.find()
    return render_template("read.html", albums=albums)


# ======================
# REGISTER
# ======================

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        existing_user = users.find_one({"username": username})
        if existing_user:
            return "Usuario ya existe"

        hashed_password = generate_password_hash(password)

        users.insert_one({
            "username": username,
            "password": hashed_password
        })

        return redirect(url_for("login"))

    return render_template("register.html")


# ======================
# LOGIN
# ======================

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = users.find_one({"username": username})

        if user and check_password_hash(user["password"], password):
            session["user"] = username
            return redirect(url_for("read"))

        return "Credenciales incorrectas"

    return render_template("login.html")


# ======================
# LOGOUT
# ======================

@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("inicio"))


# ======================
# CREATE
# ======================

@app.route("/add", methods=["GET", "POST"])
def add():
    if "user" not in session:
        return redirect(url_for("login"))

    form = AlbumForm()

    if form.validate_on_submit():
        album = {
            "grupo": form.grupo.data,
            "album": form.album.data,
            "anio": form.anio.data,
            "precio": float(form.precio.data),
            "stock": form.stock.data,
            "formato": form.formato.data,
            "portada": "",
            "canciones": []
        }

        collection.insert_one(album)
        return redirect(url_for("read"))

    return render_template("add.html", form=form)


# ======================
# UPDATE
# ======================

@app.route("/update/<id>", methods=["GET", "POST"])
def update(id):
    if "user" not in session:
        return redirect(url_for("login"))

    album = collection.find_one({"_id": ObjectId(id)})

    if not album:
        return redirect(url_for("read"))

    form = AlbumForm(data=album)

    if form.validate_on_submit():
        updated_album = {
            "grupo": form.grupo.data,
            "album": form.album.data,
            "anio": form.anio.data,
            "precio": float(form.precio.data),
            "stock": form.stock.data,
            "formato": form.formato.data,
            "portada": album.get("portada", ""),
            "canciones": album.get("canciones", [])
        }

        collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": updated_album}
        )

        return redirect(url_for("read"))

    return render_template("update.html", form=form)


# ======================
# DELETE
# ======================

@app.route("/delete/<id>")
def delete(id):
    if "user" not in session:
        return redirect(url_for("login"))

    collection.delete_one({"_id": ObjectId(id)})
    return redirect(url_for("read"))


# ======================
# RUN
# ======================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
