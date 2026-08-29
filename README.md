# Linkevolution Dashboard

Inbox de agentes para [Linkevolution](https://linkevolution.eu): WhatsApp, webchat, email y CRM.

SPA en React 19 + Vite 8. Habla con el API gateway (`VITE_API_URL`, por defecto Railway). Deploy previsto en Vercel (`vercel.json` reescribe todas las rutas a `index.html`).

## Desarrollo

```bash
cp .env.example .env
npm install
npm run dev
```

El CORS del gateway solo permite orígenes concretos (`localhost:5173`, `localhost:3000` y `https://linkevolution-dashboard-gbq2.vercel.app`). Si despliegas otra URL, hay que añadirla en `gateway/main.py` del repo privado `linkevolution`.

No subas `.env` al git. Usa `.env.example` como plantilla.

## Contrato del API

El dashboard está alineado con el gateway real (no con un CRM genérico):

| Recurso | Contrato |
|---|---|
| Login | `POST /auth/login` → `access_token`, `role`, `tenant_id`, `user_id` |
| Conversación | `contact_id`, `channel`, `status`, `ai_active`, `message_count`, `last_message_at`, `sla_breached` (sin contacto anidado ni último mensaje) |
| Mensaje | `body`, `direction`, `sender_type`, `created_at` |
| Enviar | `POST /conversations/{id}/messages` con `{ body }` |
| Resolver | `POST /conversations/{id}/resolve` |
| Contacto | `display_name`, `phone`, `email`, `lead_score`, `language`, `is_blocked` |
| Analytics | `GET /analytics/summary` → totales, abiertas, resueltas, contactos, mensajes hoy, IA |

El inbox une contactos en el cliente para mostrar el nombre. En escritorio la lista y el hilo van en split view (`/inbox` y `/inbox/:id`).

## Build

```bash
npm run build
npm run preview
```
