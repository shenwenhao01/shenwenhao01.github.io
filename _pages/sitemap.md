---
layout: academic
academic: true
title: "Sitemap"
permalink: /sitemap/
---

<header class="academic-page-heading">
  <h1>Sitemap</h1>
</header>
<ul>
  <li><a href="{{ '/' | relative_url }}">Wenhao Shen</a></li>
  {% for link in site.data.navigation.main %}
  <li><a href="{{ link.url | relative_url }}">{{ link.title }}</a></li>
  {% endfor %}
  {% for project in site.data.projects %}
  <li><a href="{{ project.url | relative_url }}">{{ project.title }}</a></li>
  {% endfor %}
</ul>
