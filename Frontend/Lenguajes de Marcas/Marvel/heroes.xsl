<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE xsl:stylesheet [
  <!ENTITY copy "&#169;">
]>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes" />

  <xsl:template match="/">  <!-- XSL ES UNA PLANTILLA PARA APLICAR TRANSFORMACIONES... -->
    <html lang="es"> <!-- ...A UN ARCHIVO HTML -->
      <!-- XML SON LOS DATOS. HTML ES EL ARCHIVO QUE SE EJECUTA POR EL NAVEGADOR -->

      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>heroes Marvel IGNACIO LIÑAN </title>
        <link rel="stylesheet" href="css/style.css" />
      </head>
      <body>
        <main>

          <header>

            <img class="imglogo" src="img/logo.png" alt="" />
            <img class="imgheader" src="img/header.jpg" alt="" />


          </header>


          <div class="descripcion">

            <p>
              <xsl:value-of select="/heroes/description" />
            </p>

          </div>


          <div class="grid">


            <xsl:for-each select="/heroes/hero">

              <div class="tarjeta">

                <div class="imagen">
                  <img>
                    <xsl:attribute name="src">
                      <xsl:value-of select="image"/>
                    </xsl:attribute>
                  </img>

                </div>

                <div class="titulo">

                  <h2>
                    <xsl:value-of select="name" />
                  </h2>

                </div>


                <div class="informacion">

                  <p>
                    <xsl:value-of select="description" />
                  </p>

                </div>


              </div>

            </xsl:for-each>


          </div>


          <footer>

            <h3> &copy; S1DAW, IES AZARQUIEL</h3>

          </footer>

        </main>

      </body>


    </html>
  </xsl:template>

</xsl:stylesheet>