---
layout: academic
academic: true
body_class: projects-page
title: "Projects"
permalink: /projects/
excerpt: "Research projects by Wenhao Shen in human perception, reconstruction, and generation."
---

<h1 class="visually-hidden">Research projects</h1>
<section class="project-gallery" aria-label="Research projects">
  {% for project in site.data.projects %}
    {% include project.html project=project %}
  {% endfor %}
</section>
