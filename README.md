# Linkevolution Dashboard

Inbox de agentes para [Linkevolution](https://linkevolution.eu): WhatsApp, webchat, email y CRM.

**Producción:** [https://dashboard.linkevolution.eu](https://dashboard.linkevolution.eu)

SPA en React 19 + Vite 8. Habla con el API gateway (`VITE_API_URL`, por defecto Railway). Deploy en Vercel (`vercel.json` reescribe todas las rutas a `index.html`).

## Desarrollo

```bash
cp .env.example .env
npm install
npm run dev
```

No subas `.env` al git. Usa `.env.example` como plantilla.

## Vercel (producción)

Proyecto: [linkevolution-dashboard-gbq2](https://vercel.com/cristian-ursans-projects/linkevolution-dashboard-gbq2). Los otros dos proyectos del mismo repo se pueden ignorar o desconectar.

- Production Branch = `master`
- `VITE_API_URL` = `https://linkevolution-production.up.railway.app` (Production + Preview)
- Dominio: `dashboard.linkevolution.eu` → CNAME `cname.vercel-dns.com.`
- Deployment Protection: Vercel Authentication **off** en Production

Tras un push a `master`, si el custom domain sigue en un build viejo: **Deployments → Promote to Production**.

## DNS

En Namecheap, Advanced DNS (el sitio `@` va a GitHub Pages; esto es solo el inbox):

| Type | Host | Value |
|---|---|---|
| CNAME | `dashboard` | `cname.vercel-dns.com.` |

No cambies `app` (`app.linkevolution.eu` ya apunta a Railway).

## CORS

El gateway (repo privado `linkevolution`) permite:

- `http://localhost:5173`
- `http://localhost:3000`
- `https://linkevolution-dashboard-gbq2.vercel.app`
- `https://dashboard.linkevolution.eu`

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
