# Marketing Automation Platform - File List

## Required Files for GitHub Upload

### Root Files
- package.json
- .env.example (rename from .env and remove sensitive data)
- .gitignore
- README.md
- CONFIGURATION.md
- API.md
- vite.config.ts
- tsconfig.json
- tailwind.config.js
- index.html

### Source Files
```
src/
├── components/
│   ├── ui/ (all shadcn/ui components)
│   ├── ProtectedRoute.tsx
│   ├── LeadScoring.tsx
│   ├── DuplicateDetection.tsx
│   ├── PersonalizationEngine.tsx
│   └── SequenceBuilder.tsx
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
├── lib/
│   ├── utils.ts
│   ├── api-client.ts
│   ├── auth-service.ts
│   ├── data-service.ts
│   ├── email-service.ts
│   └── web-service.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── LeadsPage.tsx
│   ├── LeadSourcingPage.tsx
│   ├── CampaignsPage.tsx
│   └── NotFoundPage.tsx
├── store/
│   ├── auth-store.ts
│   ├── leads-store.ts
│   └── campaigns-store.ts
├── App.tsx
├── main.tsx
└── index.css
```

### Documentation
- .devv/STRUCTURE.md
- README.md
- CONFIGURATION.md
- API.md

## GitHub Upload Steps

1. Create new repository on GitHub
2. Upload/commit all files above
3. Configure your backend API URL in .env
4. Set up your backend server (see API.md for endpoints)
5. Deploy frontend to Vercel/Netlify