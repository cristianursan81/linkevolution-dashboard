# Linkevolution Dashboard

Inbox de agentes para [Linkevolution](https://linkevolution.eu): WhatsApp, webchat, email y CRM.

SPA en React 19 + Vite 8. Habla con el API gateway (`VITE_API_URL`, por defecto Railway). Deploy en Vercel (`vercel.json` reescribe todas las rutas a `index.html`).

## Desarrollo

```bash
cp .env.example .env
npm install
npm run dev
```

No subas `.env` al git. Usa `.env.example` como plantilla.

## Vercel (producción)

Usa **un** proyecto: [linkevolution-dashboard-gbq2](https://vercel.com/cristian-ursans-projects/linkevolution-dashboard-gbq2). Los otros dos proyectos del mismo repo se pueden ignorar o desconectar.

1. **Settings → Git** → Production Branch = `master`.
2. **Settings → Environment Variables** (Production + Preview):
   - `VITE_API_URL` = `https://linkevolution-production.up.railway.app`
3. **Deployments** → el último *Ready* de `master` → **Promote to Production**.
   (Hoy [linkevolution-dashboard-gbq2.vercel.app](https://linkevolution-dashboard-gbq2.vercel.app) sigue sirviendo el build de abril.)
4. **Settings → Deployment Protection** → desactivar Vercel Authentication en Production si los agentes deben entrar sin login de Vercel.
5. **Settings → Domains** → Add `dashboard.linkevolution.eu`.

## DNS para el dashboard

En Namecheap, Advanced DNS (el sitio `@` va a GitHub Pages; esto es solo el inbox):

| Type | Host | Value |
|---|---|---|
| CNAME | `dashboard` | `cname.vercel-dns.com.` |

No cambies `app` (`app.linkevolution.eu` ya apunta a Railway).

## CORS

El gateway solo permite orígenes concretos (`localhost:5173`, `localhost:3000` y `https://linkevolution-dashboard-gbq2.vercel.app`).

Cuando el custom domain esté vivo, añade en `gateway/main.py` del repo privado `linkevolution`:

```
https://dashboard.linkevolution.eu
```

Sin eso el login falla en el navegador aunque Vercel esté bien.

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
