---
layout: academic
academic: true
title: "Projects"
permalink: /projects/
excerpt: "Research projects by Wenhao Shen in human perception, reconstruction, and generation."
---

<header class="academic-page-heading projects-heading">
  <h1>Projects</h1>
</header>
<section class="project-gallery" aria-label="Research projects">
  {% for project in site.data.projects %}
    {% include project.html project=project %}
  {% endfor %}
</section>
