#!/usr/bin/env node
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const SKILL_DIR = __dirname;
const NODE_MODULES = path.join(SKILL_DIR, 'node_modules');
const FLASH_UI_DIR = path.join(__dirname, '..', 'flash-ui-codegen');
const FLASH_UI_SCRIPT = path.join(FLASH_UI_DIR, 'flash-ui.js');

// Check and install own dependencies if needed
if (!fs.existsSync(NODE_MODULES)) {
  console.error('Installing npm dependencies for website-redesign...');
  try {
    execSync('npm install', { cwd: SKILL_DIR, stdio: 'inherit' });
    console.error('Dependencies installed.\n');
  } catch (e) {
    console.error('Failed to install dependencies:', e.message);
    process.exit(1);
  }
}

// Check if flash-ui-codegen skill exists
if (!fs.existsSync(FLASH_UI_SCRIPT)) {
  console.error('\n❌ flash-ui-codegen skill not found!');
  console.error('\nThis skill depends on flash-ui-codegen.');
  console.error('Make sure it is installed at: ~/.claude/skills/flash-ui-codegen/');
  console.error('\nExpected path: ' + FLASH_UI_SCRIPT + '\n');
  process.exit(1);
}

// Use dynamic import for node-fetch (ESM module)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function fetchWebsiteContent(url) {
  console.error(`Fetching content from: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    console.error(`Error fetching URL: ${error.message}`);
    throw error;
  }
}

function parseHTMLContent(html) {
  // Simple HTML text extraction without cheerio (to avoid ESM issues)
  // Remove script and style tags
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');

  // Extract structured content
  const content = {
    title: '',
    navigation: [],
    sections: [],
    rawText: ''
  };

  // Get title
  const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    content.title = titleMatch[1].trim();
  }

  // Get navigation links
  const navMatch = text.match(/<nav[^>]*>([\s\S]*?)<\/nav>/gi);
  if (navMatch) {
    navMatch.forEach(nav => {
      const links = nav.match(/<a[^>]*>([^<]+)<\/a>/gi);
      if (links) {
        links.forEach(link => {
          const linkText = link.replace(/<[^>]+>/g, '').trim();
          if (linkText && !content.navigation.includes(linkText)) {
            content.navigation.push(linkText);
          }
        });
      }
    });
  }

  // Extract headings and their following content
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match;
  while ((match = headingRegex.exec(text)) !== null) {
    const headingText = match[2].replace(/<[^>]+>/g, '').trim();
    if (headingText) {
      content.sections.push({
        type: `h${match[1]}`,
        text: headingText
      });
    }
  }

  // Extract paragraphs
  const paragraphs = text.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  if (paragraphs) {
    paragraphs.forEach(p => {
      const pText = p.replace(/<[^>]+>/g, '').trim();
      if (pText && pText.length > 20) {
        content.sections.push({
          type: 'p',
          text: pText
        });
      }
    });
  }

  // Extract list items
  const listItems = text.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  if (listItems) {
    listItems.forEach(li => {
      const liText = li.replace(/<[^>]+>/g, '').trim();
      if (liText && liText.length > 3) {
        content.sections.push({
          type: 'li',
          text: liText
        });
      }
    });
  }

  // Extract buttons and CTAs
  const buttons = text.match(/<button[^>]*>([\s\S]*?)<\/button>/gi);
  if (buttons) {
    buttons.forEach(btn => {
      const btnText = btn.replace(/<[^>]+>/g, '').trim();
      if (btnText && btnText.length > 1) {
        content.sections.push({
          type: 'button',
          text: btnText
        });
      }
    });
  }

  // Get all visible text (fallback)
  content.rawText = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 10000);

  return content;
}

function analyzeBusinessContext(content) {
  const allText = (content.rawText + ' ' + content.title + ' ' + content.sections.map(s => s.text).join(' ')).toLowerCase();

  // Detect business sector
  const sectors = {
    'tech/saas': ['saas', 'software', 'api', 'platform', 'cloud', 'ai', 'automation', 'integration', 'app', 'dashboard'],
    'ecommerce': ['shop', 'store', 'buy', 'cart', 'product', 'shipping', 'order', 'price', 'sale'],
    'finance': ['bank', 'invest', 'finance', 'payment', 'money', 'loan', 'credit', 'trading', 'crypto'],
    'healthcare': ['health', 'medical', 'doctor', 'patient', 'clinic', 'therapy', 'care', 'wellness'],
    'education': ['learn', 'course', 'training', 'education', 'student', 'teach', 'class', 'certification'],
    'agency/services': ['agency', 'consulting', 'service', 'solution', 'expert', 'team', 'project', 'client'],
    'recruitment/hr': ['hiring', 'recruit', 'job', 'career', 'talent', 'candidate', 'interview', 'hr', 'workforce'],
    'real-estate': ['property', 'real estate', 'home', 'apartment', 'rent', 'buy', 'listing'],
    'marketing': ['marketing', 'brand', 'campaign', 'seo', 'social', 'content', 'ads', 'growth']
  };

  let detectedSector = 'general';
  let maxScore = 0;
  for (const [sector, keywords] of Object.entries(sectors)) {
    const score = keywords.filter(kw => allText.includes(kw)).length;
    if (score > maxScore) {
      maxScore = score;
      detectedSector = sector;
    }
  }

  // Detect target audience
  const audienceSignals = {
    'b2b': ['business', 'enterprise', 'company', 'team', 'organization', 'professional', 'roi', 'efficiency'],
    'b2c': ['you', 'your', 'personal', 'easy', 'simple', 'free', 'today', 'instant'],
    'developers': ['api', 'developer', 'code', 'integration', 'sdk', 'documentation', 'github'],
    'startups': ['startup', 'scale', 'grow', 'founder', 'launch', 'mvp', 'agile']
  };

  let targetAudience = [];
  for (const [audience, keywords] of Object.entries(audienceSignals)) {
    if (keywords.filter(kw => allText.includes(kw)).length >= 2) {
      targetAudience.push(audience);
    }
  }

  // Detect conversion goals
  const conversionSignals = {
    'lead-generation': ['contact', 'demo', 'trial', 'get started', 'sign up', 'request', 'book'],
    'direct-sales': ['buy', 'purchase', 'add to cart', 'checkout', 'order now', 'pricing'],
    'engagement': ['subscribe', 'newsletter', 'follow', 'join', 'community', 'download']
  };

  let conversionGoals = [];
  for (const [goal, keywords] of Object.entries(conversionSignals)) {
    if (keywords.filter(kw => allText.includes(kw)).length >= 1) {
      conversionGoals.push(goal);
    }
  }

  // Suggest mood/tone based on sector
  const moodSuggestions = {
    'tech/saas': 'Modern, clean, trustworthy. Focus on clarity and efficiency. Use whitespace generously.',
    'finance': 'Professional, secure, stable. Convey trust and reliability. Subtle, confident design.',
    'healthcare': 'Caring, clean, accessible. Calm and reassuring. Prioritize readability.',
    'recruitment/hr': 'Dynamic, human-centered, professional. Show energy and opportunity.',
    'agency/services': 'Creative, bold, distinctive. Show personality while remaining professional.',
    'ecommerce': 'Engaging, visual, action-oriented. Clear product focus with strong CTAs.',
    'education': 'Inspiring, accessible, organized. Balance professionalism with approachability.',
    'general': 'Clean, modern, user-friendly. Focus on clear hierarchy and intuitive navigation.'
  };

  return {
    sector: detectedSector,
    audience: targetAudience.length > 0 ? targetAudience : ['general'],
    conversionGoals: conversionGoals.length > 0 ? conversionGoals : ['engagement'],
    mood: moodSuggestions[detectedSector] || moodSuggestions['general']
  };
}

function buildPrompt(content, url) {
  // Analyze business context
  const context = analyzeBusinessContext(content);

  const prompt = `RÈGLE ABSOLUE: Tu DOIS utiliser EXACTEMENT le texte fourni ci-dessous, MOT POUR MOT, SANS AUCUNE modification, reformulation, traduction ou interprétation. Chaque mot, chaque phrase doit être reproduit à l'identique.

Crée une homepage moderne et élégante pour le site ${url}
Tu as carte blanche pour le design visuel, mais le TEXTE doit rester STRICTEMENT IDENTIQUE.

=== CONTEXTE BUSINESS (pour guider tes choix de design) ===
Secteur détecté: ${context.sector}
Audience cible: ${context.audience.join(', ')}
Objectifs de conversion: ${context.conversionGoals.join(', ')}
Ton/Ambiance suggérée: ${context.mood}

Utilise ce contexte pour faire des choix de design qui CONVERTISSENT:
- Choisis des couleurs et un style adaptés au secteur ${context.sector}
- Pense à l'audience ${context.audience.join('/')} dans tes choix visuels
- Optimise le design pour ${context.conversionGoals.join(' et ')}
- Ne donne PAS de couleurs spécifiques, mais choisis intelligemment en fonction du contexte

=== CONTENU TEXTUEL EXACT DU SITE (À REPRODUIRE MOT POUR MOT) ===

${content.title ? `TITRE DU SITE: "${content.title}"` : ''}

${content.navigation.length > 0 ? `NAVIGATION:
${content.navigation.map(n => `- "${n}"`).join('\n')}` : ''}

CONTENU DES SECTIONS:
${content.sections.map(s => {
  if (s.type.startsWith('h')) {
    return `\n### ${s.type.toUpperCase()}: "${s.text}"`;
  } else if (s.type === 'button') {
    return `BOUTON: "${s.text}"`;
  } else if (s.type === 'li') {
    return `- "${s.text}"`;
  } else {
    return `TEXTE: "${s.text}"`;
  }
}).join('\n')}

=== FIN DU CONTENU EXACT ===

STYLE TECHNIQUE:
- Tailwind CSS
- React TSX
- Animations fluides et modernes
- Design responsive
- Micro-interactions au hover
- Hierarchie visuelle claire avec CTAs bien visibles
- Design orienté conversion

RAPPEL: Le texte ci-dessus doit apparaître EXACTEMENT comme écrit dans le design final.`;

  return prompt;
}

async function runFlashUI(prompt) {
  return new Promise((resolve, reject) => {
    console.error('\nLaunching Flash UI...\n');

    const child = spawn('node', [FLASH_UI_SCRIPT, prompt], {
      stdio: ['inherit', 'pipe', 'inherit']
    });

    let output = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        resolve(output); // Still return output even on non-zero exit
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  const url = process.argv[2];

  if (!url) {
    console.error('Usage: node website-redesign.js <URL>');
    console.error('Example: node website-redesign.js https://example.com');
    process.exit(1);
  }

  // Validate URL
  try {
    new URL(url);
  } catch (e) {
    console.error(`Invalid URL: ${url}`);
    process.exit(1);
  }

  try {
    // Step 1: Fetch website content
    const html = await fetchWebsiteContent(url);
    console.error(`Fetched ${html.length} characters of HTML`);

    // Step 2: Parse content
    const content = parseHTMLContent(html);
    console.error(`Parsed: ${content.sections.length} sections, ${content.navigation.length} nav items`);

    // Step 3: Build prompt
    const prompt = buildPrompt(content, url);
    console.error(`Built prompt: ${prompt.length} characters`);

    // Save prompt for reference
    const fs = require('fs');
    fs.writeFileSync('/tmp/website-redesign-prompt.txt', prompt);
    console.error('Prompt saved to: /tmp/website-redesign-prompt.txt');

    // Step 4: Run Flash UI
    const result = await runFlashUI(prompt);
    console.log(result);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
