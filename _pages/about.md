---
layout: academic
academic: true
permalink: /
title: "Wenhao Shen"
excerpt: "Wenhao Shen is a Ph.D. candidate at Nanyang Technological University working on 3D perception, generation, and post-training for generative models."
redirect_from:
  - /about/
  - /about.html
---

<section class="profile-intro" aria-labelledby="profile-name">
  <div class="profile-portrait">
    <img src="{{ '/images/profile.jpg' | relative_url }}" alt="Wenhao Shen" width="692" height="692" fetchpriority="high">
    <p class="profile-location"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> Nanyang Technological University, Singapore</p>
  </div>
  <div class="profile-heading">
    <h1 id="profile-name"><span>Wenhao Shen</span><span class="profile-name-cn" lang="zh-Hans">沈文豪</span></h1>
  </div>
  <div class="profile-bio" markdown="1">
I am a final-year Ph.D. student at the College of Computing and Data Science, [Nanyang Technological University](https://www.ntu.edu.sg/), advised by [Prof. Guosheng Lin](https://guosheng.github.io/). I work closely with [Asst. Prof. Hao Wang](https://wanghao.tech/). I am currently a research intern with the [Tencent Hunyuan 3D Generation Team](https://3d.hunyuan.tencent.com/).

Previously, I received my bachelor's degree in Artificial Intelligence from [Zhejiang University](https://www.zju.edu.cn/english/) in 2023, with an honors degree from [Chu Kochen Honors College](http://ckc.zju.edu.cn/ckcen/main.htm). I was fortunate to work with [Prof. Xiaowei Zhou](http://xzhou.me/) and [Prof. Chunhua Shen](https://cshen.github.io/).

My research focuses on **3D perception and generation**, particularly human reconstruction and motion modeling. I also explore **post-training methods** for generative models.
  </div>
  {% include profile-links.html %}
</section>

<aside class="opportunity-note">
  <p>I expect to graduate in <strong>spring 2027</strong> and am seeking opportunities in industry and academia. <a href="mailto:{{ site.author.email }}">Get in touch <i class="fas fa-arrow-right" aria-hidden="true"></i></a></p>
</aside>

<section class="research-section" aria-labelledby="selected-publications">
  <div class="section-heading">
    <h2 id="selected-publications">Selected Publications</h2>
    <a class="text-link" href="{{ '/publications/' | relative_url }}">All publications <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
  </div>
  <p class="contribution-note">* Equal contribution</p>
  <div class="publication-list">
    {% assign selected = site.data.publications | where: 'selected', true %}
    {% for paper in selected %}
      {% include publication.html paper=paper %}
    {% endfor %}
  </div>
</section>

{% include experience.html %}
