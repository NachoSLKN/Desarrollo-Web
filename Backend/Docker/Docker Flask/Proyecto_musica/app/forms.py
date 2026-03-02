from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, DecimalField, SelectField, SubmitField
from wtforms.validators import DataRequired, NumberRange, Length


class AlbumForm(FlaskForm):

    grupo = StringField(
        "Grupo",
        validators=[
            DataRequired(),
            Length(min=2, max=100)
        ]
    )

    album = StringField(
        "Álbum",
        validators=[
            DataRequired(),
            Length(min=1, max=150)
        ]
    )

    anio = IntegerField(
        "Año de lanzamiento",
        validators=[
            DataRequired(),
            NumberRange(min=1900, max=2100)
        ]
    )

    precio = DecimalField(
        "Precio (€)",
        validators=[
            DataRequired(),
            NumberRange(min=0)
        ]
    )

    stock = IntegerField(
        "Stock",
        validators=[
            DataRequired(),
            NumberRange(min=0)
        ]
    )

    formato = SelectField(
        "Formato",
        choices=[
            ("CD", "CD"),
            ("Vinilo", "Vinilo"),
            ("Digital", "Digital")
        ],
        validators=[DataRequired()]
    )

    submit = SubmitField("Guardar")
