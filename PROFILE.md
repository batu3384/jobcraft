# Jobcraft — Candidate Profile

> Template file. Run `/setup` to personalize. Keep real contact data in `profile.local.md` (gitignored).

## What Jobcraft does with this file

Your AI agent reads this profile to evaluate jobs, tailor CVs, write cover letters, and prepare interviews. All facts used in applications must come from this file, `profile.local.md`, or `documents/`.

## Candidate Profile

### Identity
- **Name:** [Your Full Name]
- **Location:** [City, Country] (commute / remote preferences)
- **Languages:** [e.g. Turkish (Native), English (B1)]
- **Status:** [e.g. Junior software developer seeking full-time roles]
- **LinkedIn headline:** [Your headline]
- **Contact:** [+XX …] · [your.email@example.com] · linkedin.com/in/[handle] · github.com/[handle]

### Education
- **[Degree]** ([years]) - [University], [City]

### Professional Experience
- **[Role]** ([dates]) - **[Employer]**, [location]
  - [Bullet: measurable outcome]
  - [Bullet: tech / impact]

### Technical Skills
- **Primary:** [e.g. Python, TypeScript, React, PostgreSQL]
- **Secondary:** [e.g. Go, Docker, security tooling]
- **Domain:** [e.g. full-stack web, data analysis]

### Projects (highlights)
- **[Project]** — [one-line description + stack]

### Certifications
- [Cert name] ([issuer], [date])

### Target Preferences
- **Roles:** [e.g. Junior Software Developer, Backend Developer]
- **Markets:** Turkey (Istanbul); remote
- **Portals:** Kariyer.net, Yenibiriş, Eleman.net, LinkedIn — Yenibiriş cookie: `./scripts/setup-portal-auth.sh`

## Verification checklist

Before presenting application materials:

- [ ] All facts exist in this profile or `documents/`
- [ ] No invented employers, degrees, or skills
- [ ] Language matches the posting (TR/EN)
- [ ] LaTeX compiles when `/apply` is used
