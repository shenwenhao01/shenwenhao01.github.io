---
layout: academic
academic: true
title: "Publications"
permalink: /publications/
excerpt: "Publications by Wenhao Shen on human mesh recovery, motion capture, reconstruction, and generation."
---

<header class="academic-page-heading">
  <h1>Publications</h1>
  <p>Human perception, reconstruction, and generation.</p>
</header>

<section data-publications aria-label="Publications">
  <form class="publication-filters" role="search" hidden>
    <div class="publication-search">
      <label class="visually-hidden" for="publication-query">Search publications</label>
      <i class="fas fa-search" aria-hidden="true"></i>
      <input id="publication-query" type="search" placeholder="Search publications" autocomplete="off">
    </div>
    <div class="publication-year">
      <label for="publication-year">Year</label>
      <select id="publication-year">
        <option value="all">All years</option>
        {% assign years = site.data.publications | map: 'year' | uniq | sort | reverse %}
        {% for year in years %}<option value="{{ year }}">{{ year }}</option>{% endfor %}
      </select>
    </div>
    <p class="publication-count" role="status" aria-live="polite" aria-atomic="true">{{ site.data.publications.size }} publications</p>
  </form>
  <p class="contribution-note">* Equal contribution</p>
  <section class="publication-group" aria-labelledby="peer-reviewed">
    <h2 id="peer-reviewed" class="publication-group-title">Conference &amp; Journal Papers</h2>
    <div class="publication-list">
      {% assign published = site.data.publications | where: 'type', 'published' %}
      {% for paper in published %}{% include publication.html paper=paper %}{% endfor %}
    </div>
  </section>
  <section class="publication-group" aria-labelledby="preprints">
    <h2 id="preprints" class="publication-group-title">Preprints</h2>
    <div class="publication-list">
      {% assign preprints = site.data.publications | where: 'type', 'preprint' %}
      {% for paper in preprints %}{% include publication.html paper=paper %}{% endfor %}
    </div>
  </section>
  <div class="publication-empty" hidden>
    <p>No publications found.</p>
    <button class="text-link" type="button" data-reset-filters><i class="fas fa-undo" aria-hidden="true"></i> Clear filters</button>
  </div>
</section>
