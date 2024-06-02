# Manual de Usuario de la Aplicación de Inmobiliaria

## Índice
1. [Introducción](#introducción)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Instalación](#instalación)
4. [Inicio de Sesión y Registro](#inicio-de-sesión-y-registro)
5. [Registro de Propiedades](#registro-de-propiedades)
6. [Registro de Famosos](#registro-de-famosos)
7. [Visualización de Propiedades](#visualización-de-propiedades)
8. [Compra de Propiedades](#compra-de-propiedades)
9. [Gestión de Subastas](#gestión-de-subastas)
10. [Generación de Informes](#generación-de-informes)
11. [Dashboard](#dashboard)
12. [Contacto](#contacto)

## Introducción
La aplicación de Inmobiliaria de Famosos está diseñada para ayudar a los famosos a gestionar sus propiedades alrededor del mundo. Los usuarios pueden registrar propiedades, realizar transacciones de compra y venta, participar en subastas y generar informes detallados sobre las actividades inmobiliarias.

## Requisitos del Sistema
- Node.js
- MongoDB
- Navegador web moderno

## Instalación
1. Clonar el repositorio del proyecto:
    ```bash
    git clone https://github.com/tuusuario/inmobiliaria-de-famosos.git
    cd inmobiliaria-de-famosos
    ```

2. Instalar las dependencias:
    ```bash
    npm install
    ```

3. Iniciar el servidor:
    ```bash
    npm start
    ```

4. Acceder a la aplicación en el navegador:
    ```
    http://localhost:3000
    ```

## Inicio de Sesión y Registro
### Registro de Usuario
1. Navegar a la página de registro a través del enlace "Registrar Usuario" en la barra de navegación.
2. Completar el formulario de registro con los datos requeridos (nombre de usuario y contraseña).
3. Hacer clic en "Registrar" para crear una nueva cuenta de usuario.

### Inicio de Sesión
1. Navegar a la página principal.
2. Introducir el nombre de usuario y la contraseña.
3. Hacer clic en "Iniciar Sesión".

## Registro de Propiedades
1. Navegar a la página "Registrar Propiedad" a través del enlace en la barra de navegación.
2. Completar el formulario con los detalles de la propiedad:
    - Tipo
    - Dirección
    - Ciudad
    - País
    - Descripción
    - Precio Estimado
    - Propietario (Seleccionar entre los usuarios o famosos registrados)
3. Hacer clic en "Registrar Propiedad".

## Registro de Famosos
1. Navegar a la página "Registrar Famoso" a través del enlace en la barra de navegación.
2. Completar el formulario con los datos del famoso:
    - Nombre
    - Nacionalidad
    - Fecha de Nacimiento
3. Hacer clic en "Registrar Famoso".

## Visualización de Propiedades
1. Navegar a la página "Propiedades" a través del enlace en la barra de navegación.
2. Visualizar la lista de propiedades registradas con sus detalles.

## Compra de Propiedades
1. En la página "Propiedades", localizar la propiedad deseada.
2. Si la propiedad está a la venta, completar el formulario de compra:
    - Seleccionar el comprador (Usuario o Famoso)
    - Introducir el precio de venta
    - Seleccionar la moneda
    - Indicar si hay multas por incumplimiento
3. Hacer clic en "Comprar".

## Gestión de Subastas
### Visualización de Subastas
1. Navegar a la página "Subastas" a través del enlace en la barra de navegación.
2. Visualizar la lista de subastas activas con sus detalles.

### Participación en Subastas
1. En la página "Subastas", localizar la subasta deseada.
2. Completar el formulario de oferta:
    - Seleccionar el postor (Usuario o Famoso)
    - Introducir el monto de la oferta
3. Hacer clic en "Ofertar".

## Generación de Informes
1. Navegar a la página "Informes" a través del enlace en la barra de navegación.
2. Seleccionar el tipo de informe deseado:
    - Ventas entre fechas o por famoso
    - Compra ventas entre fechas o por famoso
    - Valor recaudado por comisiones
    - Valor recaudado por multas o incumplimientos
    - Valor pagado en impuestos por país
3. Completar el formulario con los criterios de búsqueda.
4. Hacer clic en "Generar Informe".

## Dashboard
1. Navegar a la página "Dashboard" a través del enlace en la barra de navegación.
2. Visualizar un resumen de las propiedades, transacciones y famosos registrados.

## Contacto
Para más información o asistencia, por favor contactar a través de:
- Email: info@inmobiliariafamosos.com
- Teléfono: +123 456 7890
- Dirección: Calle Famosa 123, Ciudad de las Estrellas

