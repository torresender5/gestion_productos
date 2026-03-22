# Gestión de Productos

Sistema de gestión empresarial (facturación e inventario) para pequeñas empresas. Desarrollado con React 19, TypeScript y Vite.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Bundler**: Vite 7
- **Estilos**: Tailwind CSS 4
- **Estado**: Zustand 5
- **Rutas**: React Router 7
- **Validación**: Zod + React Hook Form
- **HTTP**: Axios
- **Gráficos**: Recharts
- **Iconos**: Lucide React

## Requisitos Previos

- Node.js 18+
- Backend API en `http://localhost:3000` (configurable via `VITE_API_URL`)

## Instalación

```bash
npm install
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en http://localhost:5173 |
| `npm run build` | Compila el proyecto para producción (type-check + build) |
| `npm run preview` | Previsualiza el build de producción |

## Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/
```

## Estructura del Proyecto

```
src/
├── components/     # Componentes compartidos (Layout, Sidebar, Modal, etc.)
├── pages/          # Páginas de rutas
├── stores/         # Stores de Zustand
├── services/       # Servicios de API
├── types/          # Interfaces y tipos TypeScript
├── lib/            # Utilidades (axios, formatters)
└── App.tsx         # Componente raíz con rutas
```

## Rutas

### Públicas
- `/login` - Inicio de sesión
- `/register` - Registro de usuarios

### Protegidas (requieren autenticación)
- `/` - Dashboard
- `/products` - Gestión de productos
- `/clients` - Gestión de clientes
- `/suppliers` - Gestión de proveedores
- `/purchases` - Compras
- `/sales` - Ventas
- `/invoices` - Facturas
- `/accounts-payable` - Cuentas por pagar
- `/accounts-receivable` - Cuentas por cobrar
- `/users` - Gestión de usuarios

## Autenticación

El token de autenticación se almacena en `localStorage` como `auth-token`. Las respuestas 401 automáticamente redirigen al login.

## Moneda

El sistema utiliza pesos colombianos (COP) con formato local `es-CO`.

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Previsualizar producción
npm run preview
```
