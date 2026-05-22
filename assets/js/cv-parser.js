/**
 * cv-parser.js — Rule-based CV parser, no LLM.
 * Exposes window.CVParser for use in any page.
 *
 * API:
 *   CVParser.parse(rawText)         → full parsed object
 *   CVParser.score(parsed)          → ATS score breakdown
 *   CVParser.matchJD(jdText, cvText)→ JD keyword match result
 *   CVParser.recommend(parsed)      → recommendation array
 */
(function (global) {
  'use strict';

  /* ═══════════════════════════════════════════
     § 1  DATA TABLES
  ═══════════════════════════════════════════ */

  const SKILLS_DB = {
    'Backend & .NET': [
      'C#','VB.NET','.NET','.NET Core','.NET Framework','ASP.NET','ASP.NET Core',
      'ASP.NET MVC','Entity Framework','EF Core','LINQ','WPF','WCF','Windows Forms',
      'Blazor','SignalR','NuGet','Web API','gRPC',
    ],
    'Database': [
      'SQL','SQL Server','T-SQL','MySQL','PostgreSQL','Oracle','SQLite',
      'MongoDB','Redis','NoSQL','SSRS','SSIS','SSAS','CosmosDB',
    ],
    'Cloud & DevOps': [
      'Azure','AWS','GCP','Docker','Kubernetes','CI/CD','Jenkins',
      'GitHub Actions','Azure DevOps','Terraform','Ansible','IIS','Linux','Windows Server',
    ],
    'Frontend': [
      'JavaScript','TypeScript','HTML','HTML5','CSS','CSS3',
      'React','Angular','Vue','Vue.js','jQuery','Bootstrap','Tailwind',
    ],
    'Tools & VCS': [
      'Git','GitHub','GitLab','Bitbucket','SVN',
      'Visual Studio','VS Code','Postman','Swagger','JIRA','Confluence',
    ],
    'Metodologi': [
      'Agile','Scrum','Kanban','TDD','BDD','SOLID','OOP',
      'Design Patterns','MVC','MVVM','Clean Architecture','DDD','Microservices',
    ],
    'Security & Integrasi': [
      'OAuth','JWT','OpenID','SSO','SOAP','REST','RESTful',
      'API Gateway','RabbitMQ','Kafka','Service Bus','Identity Server',
    ],
    'Bahasa Lain': ['Python','Java','Golang','PHP','Kotlin','Ruby','Swift','F#'],
  };

  const ACTION_VERBS = [
    'developed','designed','implemented','built','created','led','managed','maintained',
    'improved','optimized','reduced','increased','delivered','collaborated','mentored',
    'architected','refactored','migrated','integrated','automated','deployed','analyzed',
    'established','launched','streamlined','coordinated','executed','enhanced',
    'spearheaded','engineered','oversaw',
    'dikembangkan','diimplementasikan','dibangun','dirancang','dipimpin','mengelola',
    'meningkatkan','mengoptimalkan','berkolaborasi','mengembangkan','membangun',
    'merancang','memimpin','mengotomatisasi','menyebarkan','menganalisis','meluncurkan',
  ];

  /* job title rules — ordered most-specific → most-generic */
  const TITLE_RULES = [
    { needs: [['kubernetes','docker'],['terraform','ansible']],          title: 'DevOps Engineer'              },
    { needs: [['kubernetes','docker'],['ci/cd','jenkins','github actions']], title: 'DevOps Engineer'           },
    { needs: [['tensorflow','pytorch'],['python']],                      title: 'Machine Learning Engineer'    },
    { needs: [['python','pandas'],['sql','sql server','postgresql']],    title: 'Data Analyst'                 },
    { needs: [['kotlin'],['android']],                                   title: 'Android Developer'            },
    { needs: [['swift'],['ios']],                                        title: 'iOS Developer'                },
    { needs: [['flutter']],                                              title: 'Mobile Developer'             },
    { needs: [['react native']],                                         title: 'Mobile Developer'             },
    { needs: [['c#','.net core','asp.net core'],['azure']],              title: '.NET Developer'               },
    { needs: [['c#','asp.net','entity framework'],['sql server']],       title: '.NET Developer'               },
    { needs: [['c#','.net','asp.net']],                                  title: '.NET Developer'               },
    { needs: [['java','spring boot'],['microservices']],                 title: 'Java Backend Engineer'        },
    { needs: [['java','spring']],                                        title: 'Java Developer'               },
    { needs: [['react','typescript'],['node','nodejs']],                 title: 'Fullstack Developer'          },
    { needs: [['react']],                                                title: 'Frontend Developer'           },
    { needs: [['angular']],                                              title: 'Frontend Developer'           },
    { needs: [['vue','vue.js']],                                         title: 'Frontend Developer'           },
    { needs: [['javascript','typescript','html','css']],                 title: 'Frontend Developer'           },
    { needs: [['golang']],                                               title: 'Backend Engineer'             },
    { needs: [['python'],['django','flask','fastapi']],                  title: 'Python Developer'             },
    { needs: [['python']],                                               title: 'Backend Developer'            },
    { needs: [['php'],['laravel']],                                      title: 'PHP Developer'                },
    { needs: [['php']],                                                  title: 'Web Developer'                },
  ];

  const STOP_WORDS = new Set([
    'the','a','an','and','or','but','not','for','with','to','of','in','on','at',
    'is','are','be','been','have','has','had','do','does','did','will','would',
    'could','should','may','might','must','can','was','were','this','that','these',
    'those','we','our','us','you','your','they','their','it','its','who','which',
    'what','when','where','how','as','by','from','into','through','before','after',
    'between','than','so','if','then','each','both','all','any','also','very','too',
    'more','most','other','some','such','about','only','up','out','since','while',
    'job','role','position','candidate','experience','year','years','knowledge',
    'understanding','familiar','proficient','strong','good','excellent','ability',
    'able','skill','skills','minimum','required','requirement','qualification',
    'preferred','nice','great','work','working','team','join','company','help',
    'ensure','support','build','create','provide','manage','define','review','using',
    'proven','high','fast','startup','client','customer','business','responsibilities',
    'dan','atau','untuk','dengan','yang','dari','di','ke','pada','adalah','ini',
    'itu','kami','kita','anda','mereka','dalam','akan','dapat','harus','bisa',
    'juga','lebih','lain','setiap','semua','sangat','baik','mampu','memiliki',
    'minimal','tahun','tim','bergabung','mencari','bertanggung','jawab',
    'diutamakan','diperlukan','diharapkan','berpengalaman','memahami','menguasai',
  ]);

  /* Each key maps to a Set of lowercase normalised strings.
     To add a variant: just push a new string into the right Set. */
  const SECTION_VOCAB = {
    experience: new Set([
      // EN – singular + plural + common variants
      'experience','experiences',
      'work experience','work experiences',
      'professional experience','professional experiences',
      'employment','employment history',
      'career','career history','career summary',
      'work history','work background',
      'relevant experience','relevant experiences',
      'job experience','job history',
      'positions held','positions',
      // ID
      'riwayat kerja','riwayat pekerjaan',
      'pengalaman kerja','pengalaman profesional',
      'pengalaman bekerja','pengalaman',
      'karir','riwayat karir',
    ]),
    education: new Set([
      // EN
      'education','educations',
      'educational background','education background',
      'academic background','academic history',
      'academic','academics',
      'qualification','qualifications',
      'degree','degrees','schooling','formal education',
      // ID
      'pendidikan','pendidikan terakhir','pendidikan formal',
      'riwayat pendidikan','latar belakang pendidikan',
      'akademik','riwayat akademik',
    ]),
    skills: new Set([
      // EN
      'skill','skills',
      'technical skill','technical skills',
      'skills & tools','skills and tools',
      'technology','technologies',
      'tech stack','tech skills',
      'tools','tools & technologies','tools and technologies',
      'competency','competencies',
      'expertise',
      'proficiency','proficiencies',
      'core competencies','core skills',
      'key skills','key competencies',
      // ID
      'keahlian','keahlian teknis',
      'kemampuan','kemampuan teknis',
      'kompetensi','kompetensi teknis','kompetensi inti',
      'teknologi','alat dan teknologi',
      'keterampilan','keterampilan teknis',
    ]),
    summary: new Set([
      // EN
      'summary','professional summary','career summary','executive summary',
      'profile','professional profile','career profile',
      'objective','career objective','professional objective',
      'about','about me',
      'overview','professional overview',
      'introduction','personal statement',
      'bio','biography',
      // ID
      'ringkasan','ringkasan profesional','ringkasan karir',
      'profil','profil profesional',
      'tentang saya','tentang diri saya',
      'pernyataan pribadi','ikhtisar',
    ]),
    certif: new Set([
      // EN
      'certification','certifications',
      'certificate','certificates',
      'license','licenses',
      'award','awards',
      'honor','honors',
      'achievement','achievements',
      'certifications & awards','certifications and awards',
      // ID
      'sertifikasi','sertifikat',
      'lisensi','penghargaan','prestasi',
      'sertifikat dan penghargaan',
    ]),
    projects: new Set([
      // EN
      'project','projects',
      'personal project','personal projects',
      'side project','side projects',
      'notable projects','key projects','selected projects',
      'portfolio',
      // ID
      'proyek','proyek pilihan','proyek terkini','proyek pribadi',
      'portofolio','karya',
    ]),
    languages: new Set([
      // EN
      'language','languages',
      'language proficiency','language skills',
      'spoken languages',
      // ID
      'bahasa','kemampuan bahasa','penguasaan bahasa',
      'bahasa yang dikuasai',
    ]),
  };

  /* Human-readable labels for each section key (used by UI) */
  const SECTION_LABELS = {
    summary:    'Ringkasan / Profil',
    experience: 'Pengalaman Kerja',
    education:  'Pendidikan',
    skills:     'Kemampuan Teknis',
    certif:     'Sertifikasi / Penghargaan',
    projects:   'Proyek / Portofolio',
    languages:  'Kemampuan Bahasa',
  };

  const JOB_TITLE_WORD = /\b(developer|engineer|analyst|manager|lead|architect|consultant|programmer|designer|specialist|administrator|staff|officer|intern|magang|direktur|supervisor|head|koordinator|principal|vp|vice president)\b/i;
  const YEAR_RE        = /\b((?:19|20)\d{2})\b/;
  const DATE_RANGE_RE  = /((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|present|sekarang|now|current)/i;

  /* ═══════════════════════════════════════════
     § 2  LOW-LEVEL UTILS
  ═══════════════════════════════════════════ */

  function stripHtml(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent || d.innerText || '';
  }

  function prepare(raw) {
    const text  = (raw.includes('<') && raw.includes('>')) ? stripHtml(raw) : raw;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const lower = text.toLowerCase();
    return { text, lines, lower };
  }

  /* Match a skill keyword against text.
     Short pure-alpha tokens (≤3 chars) use word boundary to avoid false matches.
     Everything else uses substring. */
  function matchKeyword(text, kw) {
    const kl = kw.toLowerCase();
    if (/^[a-z]{1,3}$/.test(kl)) return new RegExp('\\b' + kl + '\\b', 'i').test(text);
    return text.toLowerCase().includes(kl);
  }

  /* ═══════════════════════════════════════════
     § 3  SECTION DETECTOR
  ═══════════════════════════════════════════ */

  /* Strip leading/trailing decorators so "── EXPERIENCE ──" → "experience" */
  function normalizeSectionLine(line) {
    return line
      .replace(/^[\s\-─=•▪►*#◆■□▸→]+/, '')
      .replace(/[\s\-─=:•▪►*#◆■□▸→]+$/, '')
      .toLowerCase()
      .trim();
  }

  function detectSections(lines) {
    const found = {};
    lines.forEach((line, idx) => {
      if (line.length > 70) return; /* headings are short */
      const norm = normalizeSectionLine(line);
      if (!norm || norm.length < 3) return;
      for (const [name, vocab] of Object.entries(SECTION_VOCAB)) {
        if (!found[name] && vocab.has(norm)) {
          found[name] = { start: idx, end: lines.length };
          break; /* one line = one section */
        }
      }
    });
    /* Trim each section to end at the next section's start */
    const starts = Object.values(found).map(s => s.start).sort((a, b) => a - b);
    for (const sec of Object.values(found)) {
      const next = starts.find(s => s > sec.start);
      if (next !== undefined) sec.end = next;
    }
    return found;
  }

  /* ═══════════════════════════════════════════
     § 4  FIELD EXTRACTORS
  ═══════════════════════════════════════════ */

  function extractEmail(text) {
    return text.match(/[\w.+\-]+@[\w\-]+\.[a-z]{2,}/i)?.[0] ?? null;
  }

  function extractPhone(text) {
    const m = text.match(/(?:\+62|62|08)[\d\s\-()+]{7,15}/);
    return m ? m[0].replace(/\s/g, '') : null;
  }

  function extractName(lines) {
    const SKIP = [
      /[@]/,
      /https?:\/\//,
      /linkedin\.com/i,
      /\b(?:\+62|08)\d/,
      DATE_RANGE_RE,
    ];
    const SECTION_WORDS = new Set([
      'summary','profile','objective','about','experience','education','skills',
      'contact','curriculum','vitae','resume','cv','ringkasan','profil',
      'pengalaman','pendidikan','keahlian','kontak',
    ]);
    for (const line of lines.slice(0, 12)) {
      if (!line || line.length > 60) continue;
      if (SKIP.some(p => p.test(line))) continue;
      const words = line.trim().split(/\s+/);
      if (words.length < 2 || words.length > 6) continue;
      if (SECTION_WORDS.has(line.toLowerCase().trim())) continue;
      /* Must contain only name-like characters */
      if (/^[A-Za-zÀ-ɏ\s.,'\-]+$/.test(line)) return line.trim();
    }
    return null;
  }

  /* Parse a single "YYYY–YYYY" or "YYYY–Present" string */
  function parseDateRange(str) {
    const m = DATE_RANGE_RE.exec(str);
    if (!m) return null;
    const startYear = parseInt(m[1], 10);
    const endRaw    = m[2].toLowerCase();
    const isCurrent = /present|sekarang|now|current/.test(endRaw);
    const endYear   = isCurrent ? new Date().getFullYear() : parseInt(m[2], 10);
    if (startYear < 1980 || startYear > new Date().getFullYear()) return null;
    if (endYear < startYear) return null;
    return { startYear, endYear, isCurrent, durationMonths: (endYear - startYear) * 12 };
  }

  function extractCompanyFromLines(candidates) {
    const CORP_RE   = /\b(PT\.?\s+|CV\.?\s+)[\w\s.,]+/i;
    const SUFFIX_RE = /[\w\s.]+\s+(?:Inc\.?|Ltd\.?|Corp\.?|Tbk|Group|Co\.?)\b/i;
    const AT_RE     = /\bat\s+([\w\s.,]+)/i;
    const PIPE_RE   = /\|\s*([\w\s.,]+?)(?:\s*\||\s*(?:19|20)\d{2})/;
    for (const line of candidates) {
      if (!line) continue;
      const m = CORP_RE.exec(line) || SUFFIX_RE.exec(line);
      if (m) return m[0].trim();
      const at = AT_RE.exec(line);
      if (at) return at[1].trim();
      const pipe = PIPE_RE.exec(line);
      if (pipe) return pipe[1].trim();
    }
    return '';
  }

  function cleanTitleLine(line) {
    return line
      .replace(DATE_RANGE_RE, '')
      .replace(/\b(PT\.?|CV\.?|Inc\.?|Ltd\.?|Corp\.?|Tbk)\b/gi, '')
      .replace(/[|,;()\[\]]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function extractExperiences(lines, sections) {
    const expSec   = sections.experience;
    const workLines = expSec
      ? lines.slice(expSec.start + 1, expSec.end)
      : lines;

    const seen    = new Set(); /* dedupe by startYear+endYear */
    const entries = [];

    for (let i = 0; i < workLines.length; i++) {
      const line  = workLines[i];
      const prev  = workLines[i - 1] || '';
      const next1 = workLines[i + 1] || '';
      const next2 = workLines[i + 2] || '';

      /* Find a date range anywhere in this ±1 line window */
      const dateStr =
        DATE_RANGE_RE.exec(line)?.[0]  ||
        DATE_RANGE_RE.exec(next1)?.[0] ||
        DATE_RANGE_RE.exec(prev)?.[0];
      if (!dateStr) continue;

      /* The line must itself (or a neighbour) contain a job-title word */
      const titleSource =
        JOB_TITLE_WORD.test(line) ? line :
        JOB_TITLE_WORD.test(prev) ? prev : null;
      if (!titleSource) continue;

      const dateInfo = parseDateRange(dateStr);
      if (!dateInfo) continue;

      const key = `${dateInfo.startYear}-${dateInfo.endYear}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const title   = cleanTitleLine(titleSource);
      const company = extractCompanyFromLines([line, prev, next1, next2]);
      const dateLabel = dateInfo.isCurrent
        ? `${dateInfo.startYear}–Present`
        : `${dateInfo.startYear}–${dateInfo.endYear}`;

      entries.push({
        title,
        company,
        startYear:      dateInfo.startYear,
        endYear:        dateInfo.endYear,
        isCurrent:      dateInfo.isCurrent,
        durationMonths: dateInfo.durationMonths,
        summary: [title, company ? `— ${company}` : null, `(${dateLabel})`]
          .filter(Boolean).join(' '),
      });
    }

    return entries
      .sort((a, b) => b.startYear - a.startYear)
      .slice(0, 10);
  }

  function extractEducation(lines, sections) {
    const eduSec   = sections.education;
    const eduLines = eduSec
      ? lines.slice(eduSec.start + 1, eduSec.end)
      : lines;

    const DEGREE_RE = /\b(S1|S2|S3|D3|D4|Bachelor|Master|Doctor|PhD|Sarjana|Magister|Diploma|SMA|SMK)\b/i;
    const INST_RE   = /\b(Universitas|Institut|Politeknik|University|College|Institute|School)\b/i;

    const ORDER = ['S3','PhD','Doctor','Magister','Master','S2','S1','Bachelor',
                   'Sarjana','D4','D3','Diploma','SMK','SMA'];
    let best = null, bestRank = Infinity;

    for (let i = 0; i < eduLines.length; i++) {
      const line = eduLines[i];
      const dm   = DEGREE_RE.exec(line);
      if (!dm) continue;
      const rank = ORDER.findIndex(d => d.toLowerCase() === dm[0].toLowerCase());
      if (rank >= bestRank) continue;
      bestRank = rank;

      const instLine = INST_RE.exec(line)?.[0]
        || INST_RE.exec(eduLines[i - 1] || '')?.[0]
        || INST_RE.exec(eduLines[i + 1] || '')?.[0]
        || '';
      const yearLine = YEAR_RE.exec(line)?.[0]
        || YEAR_RE.exec(eduLines[i + 1] || '')?.[0]
        || '';
      best = [dm[0], instLine, yearLine].filter(Boolean).join(' — ');
    }
    return best;
  }

  function extractSkillsGrouped(text) {
    const result = {};
    for (const [cat, list] of Object.entries(SKILLS_DB)) {
      const found = list.filter(s => matchKeyword(text, s));
      if (found.length) result[cat] = found;
    }
    return result;
  }

  /* ═══════════════════════════════════════════
     § 5  ANALYSIS
  ═══════════════════════════════════════════ */

  function detectJobHopping(experiences) {
    if (!experiences || experiences.length < 2) {
      return { flag: false, label: 'Data tidak cukup', totalPositions: experiences.length, avgTenureMonths: 0, shortStaysCount: 0, shortStays: [] };
    }

    const now          = new Date().getFullYear();
    const totalMonths  = experiences.reduce((s, e) => s + e.durationMonths, 0);
    const avgMonths    = Math.round(totalMonths / experiences.length);
    const shortStays   = experiences.filter(e => e.durationMonths > 0 && e.durationMonths < 12);

    /* Recent = started within last 5 years */
    const recentShort  = experiences.filter(e => e.startYear >= now - 5 && e.durationMonths < 12);

    const flag = recentShort.length >= 2 ||
      (experiences.length >= 4 && shortStays.length >= Math.ceil(experiences.length * 0.5));

    const label = flag              ? 'Sering Berganti Perusahaan'
      : avgMonths >= 36             ? 'Sangat Stabil'
      : avgMonths >= 24             ? 'Stabil'
      : avgMonths >= 12             ? 'Normal'
      :                               'Perlu Diperhatikan';

    return {
      flag,
      label,
      totalPositions:  experiences.length,
      avgTenureMonths: avgMonths,
      shortStaysCount: shortStays.length,
      shortStays:      shortStays.map(e => e.summary),
    };
  }

  function calcTotalYears(experiences) {
    if (!experiences.length) return 0;
    const minStart = Math.min(...experiences.map(e => e.startYear));
    const maxEnd   = Math.max(...experiences.map(e => e.endYear));
    return maxEnd - minStart;
  }

  function recommendJobTitle(skills, experiences) {
    const s         = new Set(skills.map(x => x.toLowerCase()));
    const hasAny    = (...terms) => terms.some(t => s.has(t.toLowerCase()));
    const hasGroup  = (group) => group.some(t => hasAny(t));
    const hasAll    = (...groups) => groups.every(g => hasGroup(g));

    const years     = calcTotalYears(experiences);
    const seniority = years >= 8 ? 'Senior' : years >= 5 ? 'Senior' : years >= 2 ? '' : 'Junior';
    const prefix    = seniority ? seniority + ' ' : '';

    for (const rule of TITLE_RULES) {
      if (rule.needs.every(group => hasGroup(group))) {
        return prefix + rule.title;
      }
    }
    return prefix + 'Software Engineer';
  }

  function calcATSScore(parsed) {
    const { email, phone, linkedin, sections, allSkills, verbsFound, quantLines, wordCount, experiences, educationRaw } = parsed;
    const hasExp = sections.experience || experiences.length > 0;
    const hasEdu = sections.education  || !!educationRaw;

    const breakdown = [
      {
        label: 'Informasi Kontak', max: 20,
        items: [
          { label: 'Email',    pts: email    ? 8 : 0, max: 8 },
          { label: 'Nomor HP', pts: phone    ? 7 : 0, max: 7 },
          { label: 'LinkedIn', pts: linkedin ? 5 : 0, max: 5 },
        ],
      },
      {
        label: 'Struktur CV', max: 30,
        items: [
          { label: 'Pengalaman Kerja', pts: hasExp              ? 12 : 0, max: 12 },
          { label: 'Pendidikan',       pts: hasEdu              ? 8  : 0, max: 8  },
          { label: 'Kemampuan Teknis', pts: sections.skills     ? 7  : 0, max: 7  },
          { label: 'Ringkasan/Profil', pts: sections.summary    ? 3  : 0, max: 3  },
        ],
      },
      {
        label: 'Kualitas Konten', max: 30,
        items: [
          { label: `Keahlian teknis (${allSkills.length})`,   pts: Math.min(allSkills.length  * 2, 10), max: 10 },
          { label: `Kata kerja aksi (${verbsFound.length})`,  pts: Math.min(verbsFound.length * 2, 10), max: 10 },
          { label: `Prestasi terukur (${quantLines.length})`, pts: Math.min(quantLines.length * 2, 10), max: 10 },
        ],
      },
      {
        label: 'Format & Panjang', max: 20,
        items: [
          { label: `${wordCount} kata`, pts: wordCount >= 200 ? (wordCount <= 1500 ? 10 : 5) : 0, max: 10 },
          { label: 'Teks dapat dibaca ATS', pts: 10, max: 10 },
        ],
      },
    ];

    const total = breakdown.reduce((s, c) => s + c.items.reduce((a, i) => a + i.pts, 0), 0);
    return { total, breakdown };
  }

  function buildRecommendations(parsed) {
    const { email, phone, linkedin, sections, allSkills, verbsFound, quantLines, wordCount, jobHopping } = parsed;
    const ok   = t => ({ type: 'ok',   text: t });
    const warn = t => ({ type: 'warn', text: t });
    const bad  = t => ({ type: 'bad',  text: t });
    const recs = [];

    email    ? recs.push(ok('Email terdeteksi.'))
             : recs.push(bad('Email tidak ditemukan. ATS butuh email sebagai kontak utama.'));
    phone    ? recs.push(ok('Nomor HP terdeteksi.'))
             : recs.push(warn('Nomor HP tidak terdeteksi.'));
    linkedin ? recs.push(ok('URL LinkedIn terdeteksi.'))
             : recs.push(warn('LinkedIn tidak terdeteksi. Tambahkan "linkedin.com/in/username".'));

    sections.summary ? recs.push(ok('Seksi Ringkasan/Profil ditemukan.'))
                     : recs.push(warn('Tambahkan seksi Ringkasan Profesional (2–4 kalimat) di awal CV.'));
    sections.skills  ? recs.push(ok('Seksi Kemampuan Teknis ditemukan.'))
                     : recs.push(bad('Seksi "Skills" tidak terdeteksi — kritis untuk keyword matching ATS.'));
    sections.certif  && recs.push(ok('Sertifikasi/Penghargaan terdeteksi.'));

    if      (allSkills.length >= 10) recs.push(ok(`${allSkills.length} keahlian teknis terdeteksi — sangat baik.`));
    else if (allSkills.length >= 5)  recs.push(warn(`${allSkills.length} keahlian terdeteksi. Tambahkan keyword teknologi yang relevan.`));
    else                             recs.push(bad('Terlalu sedikit keyword teknis. Cantumkan tools, bahasa, dan framework secara eksplisit.'));

    verbsFound.length >= 6
      ? recs.push(ok(`${verbsFound.length} kata kerja aksi ditemukan.`))
      : recs.push(warn('Tambahkan kata kerja aksi di setiap bullet: developed, implemented, led…'));

    if      (quantLines.length >= 3) recs.push(ok(`${quantLines.length} baris dengan angka/persen — diferensiatif.`));
    else if (quantLines.length >= 1) recs.push(warn(`${quantLines.length} prestasi terukur. Idealnya 3+.`));
    else                             recs.push(bad('Tidak ada pencapaian terukur. Contoh: "Reduced load time by 40%".'));

    if      (wordCount < 200)  recs.push(bad(`CV terlalu singkat (${wordCount} kata).`));
    else if (wordCount > 1500) recs.push(warn(`CV cukup panjang (${wordCount} kata). ATS bisa memotong konten >2 halaman.`));
    else                       recs.push(ok(`Panjang CV (${wordCount} kata) dalam rentang ideal.`));

    /* Job hopping flag */
    if (jobHopping && jobHopping.totalPositions >= 2) {
      if (jobHopping.flag) {
        recs.push(bad(
          `Terdeteksi ${jobHopping.shortStaysCount} posisi <1 tahun. ` +
          `Rata-rata tenure: ${jobHopping.avgTenureMonths} bulan. ` +
          `Recruiter mungkin akan mempertanyakan stabilitas.`
        ));
      } else {
        recs.push(ok(`Stabilitas karier ${jobHopping.label.toLowerCase()} — rata-rata ${jobHopping.avgTenureMonths} bulan per posisi.`));
      }
    }

    return recs;
  }

  /* ── JD matching ── */

  function extractJDKeywords(jdText) {
    const skills     = [];
    const skillsLower = new Set();
    for (const list of Object.values(SKILLS_DB)) {
      for (const s of list) {
        if (matchKeyword(jdText, s) && !skillsLower.has(s.toLowerCase())) {
          skills.push(s);
          skillsLower.add(s.toLowerCase());
        }
      }
    }
    /* Repeated non-stop words (freq ≥ 2, len ≥ 4) */
    const freq = {};
    jdText
      .split(/[\s\n,;:.!?()\[\]{}"'\/\\+*|&@#$%^~`=<>]+/)
      .map(t => t.trim())
      .filter(t => t.length >= 4 && !STOP_WORDS.has(t.toLowerCase()) && !/^\d+$/.test(t) && !skillsLower.has(t.toLowerCase()))
      .forEach(t => { freq[t] = (freq[t] || 0) + 1; });

    const other = Object.entries(freq)
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([term]) => term)
      .slice(0, 12);

    return { skills, other };
  }

  /* ═══════════════════════════════════════════
     § 6  PUBLIC API
  ═══════════════════════════════════════════ */

  const CVParser = {

    /**
     * Parse raw CV text (plain or HTML-pasted).
     * Returns the canonical JSON output + _meta for UI use.
     */
    parse: function (rawText) {
      const { text, lines, lower } = prepare(rawText);
      const words    = text.split(/\s+/).filter(Boolean);
      const sections = detectSections(lines);

      const email    = extractEmail(text);
      const phone    = extractPhone(text);
      const linkedin = text.match(/linkedin\.com\/in\/[\w\-]+/i)?.[0] ?? null;

      const skillsGrouped = extractSkillsGrouped(text);
      const allSkills     = Object.values(skillsGrouped).flat();

      const verbsFound  = [...new Set(ACTION_VERBS.filter(v => lower.includes(v.toLowerCase())))];
      const quantLines  = lines.filter(l => /\d+%|\b\d{3,}\b/.test(l) && l.length >= 20);
      const experiences = extractExperiences(lines, sections);
      const educationRaw = extractEducation(lines, sections);
      const jobHopping  = detectJobHopping(experiences);

      /* Canonical JSON fields */
      const result = {
        nama_lengkap:          extractName(lines),
        email,
        nomor_hp:              phone,
        pendidikan_terakhir:   educationRaw,
        pengalaman_kerja:      experiences.map(e => e.summary),
        keahlian_teknis:       allSkills,
        rekomendasi_job_title: recommendJobTitle(allSkills, experiences),

        /* Extended data for UI — not part of the output schema */
        _meta: {
          sections,
          skillsGrouped,
          allSkills,
          verbsFound,
          quantLines,
          experiences,
          educationRaw,
          linkedin,
          wordCount: words.length,
          jobHopping,
        },
      };

      return result;
    },

    /** ATS quality score breakdown */
    score: function (parsed) {
      const m = parsed._meta;
      return calcATSScore({
        email:        parsed.email,
        phone:        parsed.nomor_hp,
        linkedin:     m.linkedin,
        sections:     m.sections,
        allSkills:    m.allSkills,
        verbsFound:   m.verbsFound,
        quantLines:   m.quantLines,
        wordCount:    m.wordCount,
        experiences:  m.experiences,
        educationRaw: m.educationRaw,
        jobHopping:   m.jobHopping,
      });
    },

    /** Compare CV text against a job description string */
    matchJD: function (jdText, cvText) {
      const kw  = extractJDKeywords(jdText);
      const all = [...kw.skills, ...kw.other];
      if (all.length === 0) return null;

      const matched      = all.filter(k => matchKeyword(cvText, k));
      const missing      = all.filter(k => !matchKeyword(cvText, k));
      const matchedSkills = kw.skills.filter(k => matchKeyword(cvText, k));
      const missingSkills = kw.skills.filter(k => !matchKeyword(cvText, k));
      const pct          = Math.round((matched.length / all.length) * 100);

      return { matched, missing, matchedSkills, missingSkills, pct, total: all.length };
    },

    /** Section key → display label map (mirrors SECTION_VOCAB keys) */
    SECTION_LABELS,

    /** Build human-readable recommendation list */
    recommend: function (parsed) {
      const m = parsed._meta;
      return buildRecommendations({
        email:       parsed.email,
        phone:       parsed.nomor_hp,
        linkedin:    m.linkedin,
        sections:    m.sections,
        allSkills:   m.allSkills,
        verbsFound:  m.verbsFound,
        quantLines:  m.quantLines,
        wordCount:   m.wordCount,
        jobHopping:  m.jobHopping,
      });
    },
  };

  global.CVParser = CVParser;

})(typeof window !== 'undefined' ? window : this);
