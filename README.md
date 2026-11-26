# MiliBrows Studio — App Móvil de Clientes

Aplicación móvil multiplataforma (Android, iOS y vista web) para clientes de **MiliBrows Studio**, desarrollada con **Expo SDK 58**, **React Native**, **Expo Router**, **TypeScript** y **NativeWind**.

Se conecta directamente a la API REST v2 de Laravel (`backend-milibrows`) compartiendo cuentas, reservas, historial, pagos y programa de puntos del portal web.

---

## Funcionalidades

- **Inicio**: portada editorial de MiliBrows Studio, accesos rápidos a citas y puntos, próxima visita confirmada y servicios destacados.
- **Catálogo de servicios**: búsqueda en tiempo real, filtros rápidos (`Todos`, `Express (≤ 30 min)`, `Menor precio`), duración, tarifa y detalle del tratamiento.
- **Autenticación y perfil**: registro por DNI con nombres y apellidos separados, inicio de sesión con token móvil seguro, edición de datos de contacto/preferencias, selector de tema claro/oscuro persistente, recuperación y restablecimiento de contraseña, y cierre de sesión revocando el token del dispositivo.
- **Reservas y gestión de citas**:
  - Reserva de uno o varios servicios con encadenamiento automático de horarios continuos, calendario y selección de estilista disponible.
  - Listado de citas próximas y anteriores con estado, saldo pendiente y detalle completo por servicio (estilista, hora, descuentos y cobros).
  - Reprogramación y cancelación de citas confirmadas futuras.
- **MiliBrows Club**: puntos acumulados, nivel actual (`Glow`, `Golden`, `VIP`), descuento automático vigente, barra de progreso hacia el siguiente nivel y movimientos de puntos.
- **Historial y pagos**: registro de servicios realizados y listado de cobros confirmados (`Yape`, `Plin`, `Efectivo`, `Tarjeta`, etc.) vinculados a cada cita.

---

## Stack tecnológico

- **Expo** ~58 + **Expo Router** (navegación basada en archivos)
- **React** 19 + **React Native** 0.88 + **TypeScript**
- **NativeWind** 4.2 + **Tailwind CSS** 3.4
- **Expo SecureStore** (almacenamiento seguro de tokens en Android/iOS)
- **Fuentes empaquetadas**: `Inter` y `Poppins` (sin dependencia de descarga remota al iniciar)

---

## Requisitos previos

- **Node.js** 22.18+ (verificado con Node 24) y **npm**
- **Backend MiliBrows** ejecutándose con sus migraciones aplicadas (por defecto en el puerto `8000`)
- Para pruebas en dispositivo físico: **Expo Go** compatible con SDK 58 en la misma red Wi-Fi que el backend
- Para pruebas en emulador: Android Studio (Android Emulator) o Xcode (iOS Simulator)

---

## Instalación y ejecución en desarrollo

1. **Instalar dependencias:**

```bash
npm install
```

2. **Configurar variables de entorno (opcional):**

Crea `.env.local` tomando como base `.env.example`:

```bash
cp .env.example .env.local
```

Variables disponibles:

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | URL base de la API para Android/iOS | `http://192.168.1.100:8000/api/v1` |
| `API_PROXY_TARGET` | Destino del proxy local de Metro para `npm run web` | `http://localhost:8000` |
| `EXPO_PUBLIC_WEB_API_URL` | URL directa de la API para vista web en producción | `https://api.tudominio.com/api/v1` |

> Si no defines `EXPO_PUBLIC_API_URL` en desarrollo:
> - En **Android Emulator** usa automáticamente `http://10.0.2.2:8000/api/v1`.
> - En **teléfono físico** toma la IP LAN del servidor de Expo en el puerto `8000`.

3. **Levantar el backend en tu red local (desde el repositorio del backend):**

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

4. **Iniciar la aplicación:**

```bash
npm run start:clear
```

También puedes abrir directamente un destino específico:

```bash
npm run android
npm run ios
npm run web
```

---

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run start` | Inicia el servidor de desarrollo de Expo |
| `npm run start:clear` | Inicia Expo limpiando la caché de Metro |
| `npm run android` | Abre la app en Android Emulator / dispositivo |
| `npm run ios` | Abre la app en iOS Simulator |
| `npm run web` | Inicia la vista previa web con proxy local `/api/v1` |
| `npm run typecheck` | Verifica tipos con `tsc --noEmit` |
| `npm run lint` | Ejecuta ESLint (`expo lint`) |
| `npm test` | Ejecuta las pruebas unitarias (`node --test tests/*.test.cjs`) |
| `npm run brand` | Regenera los activos de marca desde `scripts/generate-brand.cjs` |

---

## Estructura del proyecto

```text
├── assets/brand/        # Logotipo, portada e íconos de la aplicación
├── scripts/             # Utilidades de desarrollo (generación de marca)
├── src/
│   ├── app/             # Rutas de Expo Router
│   │   ├── (tabs)/      # Pestañas: Inicio, Servicios, Mis citas, Mi club, Perfil
│   │   ├── cita/[id].tsx
│   │   ├── perfil/editar.tsx
│   │   ├── reprogramar/[id].tsx
│   │   ├── servicio/[id].tsx
│   │   ├── acceso.tsx, registro.tsx, reservar.tsx, historial.tsx, pagos.tsx
│   ├── features/        # Flujos de reserva y reprogramación
│   ├── lib/             # Cliente HTTP, autenticación, tema, fechas, tipos y validaciones
│   └── ui/              # Tema, componentes reutilizables, tarjetas y calendario
└── tests/               # Pruebas unitarias (fechas, disponibilidad y proxy)
```

---

## Compilación con EAS

El archivo `eas.json` incluye perfiles `preview` (APK interno Android) y `production` (AAB). Antes de compilar, define `EXPO_PUBLIC_API_URL` apuntando a una API HTTPS accesible públicamente:

```bash
npx eas-cli@latest build --platform android --profile preview
```

---

## Verificación rápida

```bash
npm run typecheck
npm run lint
npm test
```
