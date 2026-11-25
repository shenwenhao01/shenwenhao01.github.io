import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const content = JSON.parse(fs.readFileSync(path.join(root, 'data/content.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sample = id => content.t2m.find(s => s.id === id);

function emphasize(value, phrases) {
  let html = escape(value);
  for (const [phrase, tone = ''] of phrases) {
    html = html.replace(escape(phrase), match => `<strong class="text-emphasis${tone ? ` emphasis-${tone}` : ''}">${match}</strong>`);
  }
  return html;
}

function video(media, label, kind = '') {
  return `<div class="video-stage ${kind}" data-media-stage>
    <video muted loop playsinline preload="none" poster="./${media.poster}" data-src="./${media.video}" aria-label="${escape(label)}"></video>
    <button class="video-toggle icon-button" type="button" aria-label="Play motion" title="Play / pause motion"><i class="icon play" aria-hidden="true"></i></button>
    <span class="media-error" role="status" hidden>Video unavailable. <a href="./${media.video}">Open video</a></span>
    <noscript><a class="nojs-video" href="./${media.video}">Play video <i class="icon play" aria-hidden="true"></i></a></noscript>
  </div>`;
}

function figure(key, alt) {
  const f = content.figures[key];
  return `<a class="figure-link" href="./${f.src}" data-figure aria-label="Enlarge ${escape(alt)}"><img src="./${f.src}" alt="${escape(alt)}" width="${f.width}" height="${f.height}" loading="lazy"></a>`;
}

function benchmark(b) {
  const directions = {up: '&uarr;', down: '&darr;', target: '&rarr;'};
  const reference = b.rows.find(r => r.group === 'Reference');
  const score = (row, i) => {
    const value = parseFloat(row.values[i]);
    const direction = b.columns[i][1];
    return direction === 'down' ? -value : direction === 'target' ? -Math.abs(value - parseFloat(reference.values[i])) : value;
  };
  let currentGroup;
  let body = '';
  for (const row of b.rows) {
    if (row.group !== currentGroup) {
      currentGroup = row.group;
      body += `<tr class="table-group"><th colspan="${b.columns.length + 1}" scope="colgroup">${row.group}</th></tr>`;
    }
    const peers = b.rows.filter(r => r.group === row.group);
    body += `<tr class="${row.method === 'MIRROR' ? 'mirror-row' : ''}"><th scope="row">${escape(row.method.replace(/~$/, ''))}</th>`;
    row.values.forEach((value, i) => {
      const best = peers.length > 1 && value !== '--' && score(row, i) === Math.max(...peers.filter(r => r.values[i] !== '--').map(r => score(r, i)));
      const parts = value.split(' +/- ');
      const cell = escape(parts[0]) + (parts[1] ? `<span class="confidence">&plusmn;${escape(parts[1])}</span>` : '');
      body += `<td>${best ? `<strong>${cell}</strong>` : cell}</td>`;
    });
    body += '</tr>';
  }
  return `<div class="benchmark-panel" id="benchmark-${b.id}">
    <h3>${b.id === 't2m' ? 'Text-to-motion generation' : 'Motion-to-text understanding'}</h3>
    <div class="table-scroll" tabindex="0" aria-label="${b.id.toUpperCase()} results table">
      <table><caption>HumanML3D ${b.id.toUpperCase()} benchmark</caption><thead><tr><th scope="col">Method</th>${b.columns.map(([name, dir]) => `<th scope="col">${escape(name)} <span aria-label="${dir === 'up' ? 'higher is better' : dir === 'down' ? 'lower is better' : 'closer to real motions is better'}">${directions[dir]}</span></th>`).join('')}</tr></thead><tbody>${body}</tbody></table>
    </div></div>`;
}

const relativeResults = [
  { task: 't2m', baseline: 'MotionGPT3', column: 0, label: 'R-Precision Top 1' },
  { task: 'm2t', baseline: 'UniMo', column: 1, label: 'BLEU@4' },
  { task: 'm2t', baseline: 'UniMo', column: 3, label: 'CIDEr' },
];
const values = {
  TITLE: escape(content.paper.title.replace(/^MIRROR:\s*/, '')),
  AUTHORS: content.paper.authors.length
    ? `<p class="paper-authors">${content.paper.authors.map(author => `<span class="paper-author">${author.url ? `<a href="${escape(author.url)}" target="_blank" rel="noopener noreferrer">${escape(author.name)}</a>` : escape(author.name)}<sup>${author.affiliations.map(escape).join(',')}</sup></span>`).join(' ')}</p>`
    : '',
  AFFILIATIONS: content.paper.authors.length && content.paper.affiliations.length
    ? `<p class="paper-affiliations">${content.paper.affiliations.map((name, i) => `<span><sup>${i + 1}</sup>${escape(name)}</span>`).join('')}</p>`
    : '',
  ABSTRACT: emphasize(content.paper.abstract, [
    ['Motion-Internalized Reasoning (MIR)', 'purple'],
    ['Reciprocal On-Policy Reinforcement (ROR)', 'blue'],
    ['reasoning entirely during prompt prefill'],
    ['reciprocal on-policy cycles'],
  ]),
  SPEED_RESULTS: ['t2m', 'm2t'].map(task => {
    const latency = content.inference[task];
    const ratio = latency.baselineSeconds / latency.mirrorSeconds;
    return `<div class="speed-result"><h4>${task === 't2m' ? 'Text-to-motion' : 'Motion-to-text'}</h4><strong class="speed-number">${ratio.toFixed(1)}&times;</strong><p>faster than explicit CoT</p>
      <div class="latency-row"><span>Explicit CoT</span><span class="latency-bar baseline-bar" style="--bar-width:100%"></span><span>${latency.baselineSeconds.toFixed(3)} s</span></div>
      <div class="latency-row"><span>MIRROR</span><span class="latency-bar mirror-bar" style="--bar-width:${(100 / ratio).toFixed(2)}%"></span><span>${latency.mirrorSeconds.toFixed(3)} s</span></div></div>`;
  }).join(''),
  RELATIVE_RESULTS: relativeResults.map(result => {
    const rows = content.benchmarks.find(b => b.id === result.task).rows;
    const ours = parseFloat(rows.find(r => r.method === 'MIRROR').values[result.column]);
    const baseline = parseFloat(rows.find(r => r.method.replace(/~$/, '') === result.baseline).values[result.column]);
    return `<div><span class="eyebrow">${result.task.toUpperCase()} / ${result.label}</span><strong>+${((ours / baseline - 1) * 100).toFixed(1)}%</strong><p>relative improvement over ${result.baseline}</p></div>`;
  }).join(''),
  T2M: content.t2m.map((s, i) => `<figure class="motion-card carousel-slide ${i === 0 ? 'is-active' : ''}" data-sample-index="${i}" aria-roledescription="slide" aria-label="${i + 1} of ${content.t2m.length}">${video(s.methods.ours, s.prompt)}<figcaption><div class="card-meta"><span class="eyebrow">Text prompt</span></div><p>&ldquo;${escape(s.prompt)}&rdquo;</p></figcaption></figure>`).join(''),
  T2M_COUNT: content.t2m.length,
  M2T: content.m2t.map((s, i) => `<figure class="motion-card carousel-slide ${i === 0 ? 'is-active' : ''}" data-sample-index="${i}" aria-roledescription="slide" aria-label="${i + 1} of ${content.m2t.length}">${video(s.media, s.prediction)}<figcaption><div class="card-meta"><span class="eyebrow">Generated description</span><span class="model-label">MIRROR</span></div><p>&ldquo;${escape(s.prediction)}&rdquo;</p></figcaption></figure>`).join(''),
  M2T_COUNT: String(content.m2t.length).padStart(2, '0'),
  COMPARISON_COUNT: String(content.comparisonIds.length).padStart(2, '0'),
  COMPARISONS: content.comparisonIds.map((id, i) => {
    const s = sample(id);
    return `<article class="comparison-group carousel-slide ${i === 0 ? 'is-active' : ''}" data-sample-index="${i}" aria-roledescription="slide" aria-label="Comparison ${i + 1} of ${content.comparisonIds.length}"><p class="comparison-prompt">&ldquo;${escape(s.prompt)}&rdquo;</p><div class="comparison-grid">${[['motiongpt3','MotionGPT3'],['unimo','UniMo'],['ours','MIRROR']].map(([key, name]) => `<figure class="comparison-film ${key === 'ours' ? 'ours' : ''}"><figcaption>${name}</figcaption>${video(s.methods[key], `${name}: ${s.prompt}`, 'comparison-video')}</figure>`).join('')}</div><div class="comparison-toolbar"><button class="quiet-button" type="button" data-group-play><i class="icon play" aria-hidden="true"></i><span>Play all</span></button><button class="icon-button" type="button" data-group-replay aria-label="Replay this comparison" title="Replay"><i class="icon replay" aria-hidden="true"></i></button></div></article>`;
  }).join(''),
  METHOD_FIGURE: figure('method', 'MIRROR architecture: semantic and kinematic latent reasoning with training-only auxiliary decoders, and reciprocal on-policy text-motion cycles.'),
  BENCHMARKS: content.benchmarks.map(benchmark).join(''),
  QUALITATIVE_FIGURES: `<figure>${figure('t2m', 'Text-to-motion qualitative comparison of MIRROR, UniMo and MotionGPT3, with semantic latent reasoning traces and mesh colors progressing over time.')}<figcaption>Text-to-motion comparison. Mesh colors progress from light to dark over time; textual reasoning is decoded from semantic latents for analysis.</figcaption></figure><figure>${figure('m2t', 'Motion-to-text qualitative comparisons showing reference motions and predicted descriptions from unified models.')}<figcaption>Motion-to-text comparison from the research source.</figcaption></figure>`,
};
let html = fs.readFileSync(path.join(root, 'scripts/index.template.html'), 'utf8');
html = html.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => {
  if (!(key in values)) throw new Error(`Unknown template key ${key}`);
  return values[key];
});
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`Rendered MIRROR page with ${content.t2m.length} T2M examples and complete benchmark tables.`);
