# 🏨 Descanso Total

Sistema web frontend para la gestión de reservas del **Hotel Descanso Total**, desarrollado como proyecto académico para la asignatura **Desarrollo Fullstack II**.

El proyecto busca modernizar la experiencia de huéspedes y personal administrativo del hotel mediante una interfaz web simple, clara y responsiva.

> 🚧 **Proyecto actualmente en desarrollo.**
>
> Esta primera versión corresponde al frontend de la aplicación. Algunas funcionalidades utilizan datos simulados mediante JavaScript y serán ampliadas en futuras etapas.
---
# 👥 Integrantes del equipo

El proyecto **Descanso Total** es desarrollado colaborativamente por tres integrantes.

| Integrante | Rama de trabajo |
|---|---|
| **Camila Castillo** | `camila` |
| **Rubén Espejo** | `ruben` |
| **Benjamín** | `benja` |

Cada integrante trabaja principalmente en su propia rama, realizando commits con mensajes descriptivos y posteriormente integrando sus cambios a la rama `main` mediante Pull Requests.
---
# 📌 Descripción del proyecto

**Descanso Total** es un hotel ubicado en Viña del Mar que requiere digitalizar distintos procesos relacionados con la gestión de habitaciones y reservas.

Actualmente, muchos de estos procesos se realizan mediante sistemas básicos, planillas y procedimientos manuales.

La propuesta consiste en desarrollar una aplicación web que permita separar las funcionalidades en dos grandes áreas:

### 👤 Área huésped

Permite al visitante interactuar con las principales funcionalidades del hotel, como consultar habitaciones, realizar reservas y revisar su estado.

### 🔐 Área administrativa

Permite gestionar procesos internos del hotel como reservas, check-in, limpieza de habitaciones, check-out y reportes.

En esta primera entrega el sistema se desarrolla exclusivamente utilizando tecnologías frontend.

---

# 🎯 Objetivo

Desarrollar una interfaz web que permita centralizar y simplificar las principales operaciones del Hotel Descanso Total.

El sistema busca:

- Facilitar la búsqueda de habitaciones disponibles.
- Permitir la realización de reservas.
- Entregar información sobre el estado de una reserva.
- Permitir solicitar servicios adicionales.
- Facilitar la cancelación de reservas.
- Apoyar la gestión administrativa del hotel.
- Mejorar el proceso de check-in y check-out.
- Llevar control del estado de limpieza de habitaciones.
- Entregar información mediante reportes administrativos.
- Ofrecer una navegación clara entre las distintas funcionalidades.

---

# 🧩 Requisitos funcionales

El proyecto contempla **10 requisitos funcionales**, divididos entre funcionalidades para huéspedes y funcionalidades administrativas.

## 👤 Requisitos funcionales del huésped

| ID | Requisito | Descripción |
|---|---|---|
| **RF01** | Consultar disponibilidad | Permite consultar las habitaciones disponibles del hotel. |
| **RF02** | Registrar reserva | Permite al huésped ingresar los datos necesarios para registrar una reserva. |
| **RF03** | Consultar estado de reserva | Permite consultar el estado actual de una reserva. |
| **RF04** | Solicitar servicios adicionales | Permite seleccionar o solicitar servicios adicionales asociados a la estadía. |
| **RF05** | Cancelar reserva | Permite solicitar la cancelación de una reserva existente. |

## 🔐 Requisitos funcionales administrativos

| ID | Requisito | Descripción |
|---|---|---|
| **RF06** | Gestionar reservas | Permite visualizar y administrar las reservas existentes. |
| **RF07** | Gestionar check-in | Permite registrar el ingreso de huéspedes al hotel. |
| **RF08** | Gestionar limpieza | Permite administrar el estado de limpieza de las habitaciones. |
| **RF09** | Gestionar check-out y cobro | Permite realizar el proceso de salida del huésped y gestionar el cobro correspondiente. |
| **RF10** | Generar reportes | Permite visualizar información relevante para la administración del hotel. |

---

# 🧭 Navegación del sistema

## Sitio público

La página principal está orientada principalmente a los huéspedes.

La navegación contempla secciones como:

`Inicio` → `Habitaciones` → `Reservar` → `Mi reserva` → `Servicios` → `Nosotros` → `Contacto`

También existe un acceso denominado **Portal privado**, destinado al área administrativa.

## Portal privado

Al ingresar al área administrativa, el sistema permite navegar directamente entre las funcionalidades internas:

`Reservas` → `Check-in` → `Limpieza` → `Check-out` → `Reportes`

Actualmente el acceso administrativo corresponde a una simulación frontend y no utiliza autenticación mediante servidor o base de datos.

---

# 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura y contenido de las páginas. |
| **CSS3** | Estilos personalizados del proyecto. |
| **Bootstrap 5** | Componentes visuales y apoyo para diseño responsivo. |
| **JavaScript** | Validaciones, interacción y lógica frontend. |
| **Git** | Control de versiones. |
| **GitHub** | Repositorio remoto y trabajo colaborativo. |
| **Visual Studio Code** | Entorno principal de desarrollo. |

---

# 📂 Estructura del proyecto

La estructura puede variar durante el desarrollo, pero actualmente sigue una organización similar a:

```text
Descanso-Total/
│
├── LandingPage/
│   ├── index.html
│   ├── estilos.css
│   └── images/
│
├── RF01-Disponibilidad/
│   └── index.html
│
├── RF02-Registrar reserva/
│   └── index.html
│
├── RF03-Estado de reserva/
│   └── index.html
│
├── RF04-Servicios adicionales/
│   └── index.html
│
├── RF05-Cancelar reserva/
│   └── index.html
│
├── RF06-Gestionar reservas/
│   └── index.html
│
├── RF07-Check-in/
│   ├── index.html
│   └── script.js
│
├── RF08-Gestionar limpieza/
│   ├── index.html
│   └── script.js
│
├── RF09-Check-out y cobro/
│   ├── index.html
│   └── script.js
│
├── RF10-Reportes/
│   └── index.html
│
├── Nosotros/
│   └── index.html
│
├── Contacto/
│   └── index.html
│
└── README.md
