# Feature Documentation — Privacy & Cookie Consent (CMP)

## Purpose
Provides GDPR-compliant consent management for XINVORA, enabling visitors to accept, reject, or customize tracking permissions.

---

## Core Components
1. `CookieProvider.tsx`: React Context manager tracking `consentState` and emitting `XINVORA_CONSENT_UPDATED` browser events.
2. `CookieScriptLoader.tsx`: Dynamic script loader executing GA4, Meta Pixel, Clarity, TikTok scripts according to priority and consent permissions.
3. `CookieBanner.tsx`: Luxury floating banner.
4. `CookieModal.tsx`: Preference center modal.
5. `PrivacySettingsClient.tsx`: Admin CMS at `/admin/settings/privacy`.

---

## Data Flow & Signed Cookies
```text
Visitor Action (Accept / Customize) 
  ➔ Server Action (saveConsentAction) 
  ➔ CookieConsentService.saveConsent() 
  ➔ Writes cookieConsents + cookieConsentAuditLogs in DB
  ➔ Sets signed HMAC cookie (xinvora-consent) in browser
```

---

## API Endpoints
- `GET /api/cookies/consent`: Returns validated current consent & version status.
- `POST /api/cookies/consent`: Saves consent & sets signed cookie.
- `DELETE /api/cookies/consent`: Non-destructively withdraws consent and deletes cookie.

---

**Last Updated**: July 20, 2026
