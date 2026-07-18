---
framework_version: 1.2.0
---

# Job Evaluation Framework

<!-- Personalized during /setup from 01-candidate-profile.md -->

## Scoring Dimensions

Evaluate each job posting against these five dimensions:

### 1. Technical Skills Match (0-100)
How well do the required/preferred skills align with the candidate's capabilities?

| Score | Meaning |
|-------|---------|
| 80-100 | Core requirements are primary skills |
| 60-79 | Most requirements match, 1-2 gaps that are learnable |
| 40-59 | Partial match, significant upskilling needed |
| 0-39 | Fundamental mismatch |

**Strong match areas:** Python, TypeScript/JavaScript, FastAPI, Next.js/React, PostgreSQL, Docker, Git/Linux, full-stack web
**Moderate match areas:** Go, Swift/SwiftUI, Redis/Celery, MySQL, Flask/Node, security scanners (Nmap, OpenVAS, ZAP, Nuclei, Semgrep, Trivy)
**Weak match areas:** Deep Java/Spring enterprise, Kubernetes SRE at scale, native Android, heavy data science/ML research, fluent client-facing English sales

### 2. Experience Match (0-100)
Does work history align with what they're looking for?

| Score | Meaning |
|-------|---------|
| 80-100 | Direct experience in the same domain and role type |
| 60-79 | Related experience, transferable skills clear |
| 40-59 | Adjacent experience, would need to make the case |
| 0-39 | Unrelated experience |

**Strong:** Full-stack / backend web apps, institutional data reporting (Python), multi-tenant SaaS-style platforms, local-first macOS/iOS utilities
**Moderate:** Security tooling integration, devops-lite (Docker), academic/research-adjacent reporting
**Entry-level:** Roles requiring 3+ years production ownership, team lead, or regulated industry compliance ownership

### 3. Behavioral/Culture Fit (0-100)
Does the role and company culture match the behavioral profile?

| Score | Meaning |
|-------|---------|
| 80-100 | Culture strongly matches behavioral preferences |
| 60-79 | Mixed signals but mostly compatible |
| 40-59 | Some friction areas |
| 0-39 | Significant culture mismatch |

**Red flags to research:** Pure ticket farms, chaotic ownership, no code review, bait-and-switch “junior” titles that are unpaid overtime culture. Check Kariyer/LinkedIn reviews, recent layoff news, and Glassdoor-style sources carefully.

### 4. Location & Logistics (Pass/Fail + Notes)
- Istanbul metro / hybrid Istanbul: PASS
- Remote (Turkey or async-friendly): PASS
- Requires relocation outside Istanbul metro without remote option: FAIL (deal-breaker unless user overrides)
- Frequent international travel: FLAG (discuss with user)

### 5. Career Alignment & Motivation (0-100)
Does this role advance career goals and contain tasks that energize?

| Score | Meaning |
|-------|---------|
| 80-100 | Strongly aligned with career direction, clear growth path |
| 60-79 | Good role but only partially aligned with long-term goals |
| 40-59 | Decent job but doesn't build toward career goals |
| 0-39 | Dead end or backwards step |

**Career goals:**
- Land a full-time junior software / full-stack / backend role in Istanbul (or remote)
- Grow toward security-minded product engineering (vuln platforms, secure defaults) without skipping fundamentals
- Ship user-facing software with code review and mentorship

**Motivation filter:** Evaluate not just whether you *can* do the tasks, but whether the tasks will *energize* you. Consider:
- Tasks that energize: building APIs/UIs, product features, security tooling integration, clean architecture
- Tasks that drain: endless L1 support, copy-paste CMS-only work, undefined “do everything” with no backlog
- Non-task factors: leadership style, department culture, company values, degree of autonomy

**Life situation alignment:** Consider personal constraints:
- **Security:** Seeking stable full-time employment with clear compensation; junior market rates OK if growth path is real
- **Flexibility:** Istanbul metro preferred; remote OK; avoid forced relocation
- **Professional development:** Mentorship, modern stack, chance to own features

### 6. Salary Benchmark (Optional)

If `salary_data.json` exists in the repo root, look up the company:
```
python salary_lookup.py "<Company Name>" --json
```

If a city is known from the posting, add `--city "<City>"` to narrow results.

To bootstrap from the Turkey sample: `cp salary_data.sample.json salary_data.json` then edit.

Present findings as:
```
### Salary Benchmark
| Metric | Value |
|--------|-------|
| [Category] index | XX.X (+/-X.X% vs baseline) |
| Overall index | XX.X (+/-X.X% vs baseline) |
```

Interpret results relative to the baseline in the data file's metadata (TRY / Turkey sample). Higher typically means above-market compensation for that dataset.

**If `salary_data.json` is missing:** skip this section with a one-line note — do not fail `/apply` or invent salary numbers.

## Output Format

Present the evaluation as:

```
## Job Fit Evaluation: [Role] at [Company]

| Dimension | Score | Notes |
|-----------|-------|-------|
| Technical Skills | XX/100 | [brief note] |
| Experience Match | XX/100 | [brief note] |
| Behavioral Fit | XX/100 | [brief note] |
| Location | PASS/FAIL | [brief note] |
| Career Alignment | XX/100 | [brief note] |

**Overall Score: XX/100** (weighted average of scored dimensions)

### Verdict: [Strong Fit / Good Fit / Moderate Fit / Weak Fit / Poor Fit]

### Key Strengths for This Role
- [bullet points]

### Gaps to Address
- [bullet points]

### Recommendation
[1-2 sentences: apply/skip/apply with caveats]

### Company Research Checklist
- [ ] Checked company website (mission, values, recent news)
- [ ] Checked review sites (Glassdoor, Kariyer.net, etc.)
- [ ] Checked LinkedIn for team size, recent hires, connections
- [ ] Checked media for restructuring, growth, or workplace issues
- [ ] Identified network contacts who may know the team/manager
```

## Weighting
- Technical Skills: 30%
- Experience Match: 25%
- Behavioral Fit: 15%
- Career Alignment: 30%

(Location is pass/fail, not weighted)

## Thresholds
- **Strong Fit** (75+): Definitely apply, tailor everything
- **Good Fit** (60-74): Apply, address gaps in cover letter
- **Moderate Fit** (45-59): Consider carefully, discuss with user
- **Weak Fit** (30-44): Probably skip unless strategic reasons
- **Poor Fit** (<30): Skip

## Pre-Application: Call the Employer (Best Practice)

Before writing the application, consider whether the candidate should call the contact person listed in the posting. **Only call if there are substantive questions** - never call just to "be remembered."

### When to Suggest Calling
- The posting has unclear or ambiguous requirements
- It's unclear which competencies are essential vs. nice-to-have
- The role description is vague about day-to-day tasks
- There's a named contact person who invites questions

### Good Questions to Ask
- "What are the primary challenges in this role?"
- "How is time typically divided across the listed responsibilities?"
- "Which competencies are most critical for success in this position?"
- "What does success look like in the first 6-12 months?"

### Rules for the Call
- Prepare a 30-second "elevator pitch" about your background in case they ask
- The call's purpose is **gathering information**, not delivering a pitch
- Take notes - use what you learn to tailor the application
- Reference the conversation naturally in the cover letter ("After speaking with [name], I was especially drawn to...")
