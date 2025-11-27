<template>
  <div class="about-page">
    <div class="container">
      <div class="page-header">
        <h1>About</h1>
      </div>

      <div class="content">
        <section>
          <h2>Owens Valley Paiute Sentence Builder</h2>
          <p>
            This application is an educational tool designed to help people learn and explore
            the grammar of <strong>Owens Valley Paiute</strong> (Nüümü Yadoha), an endangered
            Uto-Aztecan language spoken in the Owens Valley region of California.
          </p>
        </section>

        <section>
          <h2>Features</h2>
          <ul>
            <li>
              <strong>Sentence Builder:</strong> An interactive tool to construct grammatically
              correct Paiute sentences by selecting subject, object, and verb components along
              with their appropriate suffixes.
            </li>
            <li>
              <strong>Translator:</strong> An experimental English-to-Paiute translator powered
              by LLM-assisted rule-based machine translation.
            </li>
          </ul>
        </section>

        <section>
          <h2>Research</h2>
          <p>
            The translator is based on research presented in the paper:
          </p>
          <blockquote>
            <a href="https://arxiv.org/abs/2405.08997" target="_blank">
              "LLM-Assisted Rule Based Machine Translation for Low/No-Resource Languages"
            </a>
          </blockquote>
          <p>
            This approach combines traditional rule-based machine translation techniques with
            modern large language models to enable translation for languages with very limited
            digital resources.
          </p>
        </section>

        <section>
          <h2>Acknowledgments</h2>
          <p>
            We are deeply grateful to the <strong>Nüümü Yadoha Language Program</strong> at the
            Owens Valley Career Development Center for their tireless work in preserving and
            teaching the Owens Valley Paiute language.
          </p>
          <p>
            Special thanks to the elders and language teachers who have contributed to documenting
            this beautiful language for future generations.
          </p>
        </section>

        <section>
          <h2>Important Notes</h2>
          <div class="warning-box">
            <p>
              <strong>This is an educational tool</strong> and may contain errors. For accurate
              translations and language learning, please consult the teachers at the
              <a href="http://www.ovcdc.com/language" target="_blank">Nüümü Yadoha Language Program</a>.
            </p>
          </div>
        </section>

        <section>
          <h2>Links</h2>
          <ul class="link-list">
            <li>
              <a href="https://dictionary.kubishi.com" target="_blank">Kubishi Dictionary</a> -
              Search the Owens Valley Paiute dictionary
            </li>
            <li>
              <a href="http://www.ovcdc.com/language" target="_blank">Nüümü Yadoha Language Program</a> -
              Official language program
            </li>
            <li>
              <a href="https://github.com/kubishi" target="_blank">Kubishi on GitHub</a> -
              Source code and projects
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>

<style scoped>
.about-page {
  padding: 2rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
}

.content {
  max-width: 700px;
  margin: 0 auto;
}

section {
  margin-bottom: 2rem;
}

section h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-primary);
  padding-bottom: 0.5rem;
}

section p {
  margin-bottom: 1rem;
  line-height: 1.8;
}

section ul {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

section li {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

blockquote {
  background: var(--bg-secondary);
  padding: 1rem 1.5rem;
  border-left: 3px solid var(--accent-primary);
  margin: 1rem 0;
}

blockquote a {
  color: var(--accent-primary);
  font-style: italic;
}

.warning-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  padding: 1rem;
  border-radius: 0.25rem;
}

.warning-box p {
  margin: 0;
}

.link-list {
  list-style: none;
  margin-left: 0;
}

.link-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-primary);
}

.link-list li:last-child {
  border-bottom: none;
}

.link-list a {
  color: var(--accent-primary);
}

a {
  color: var(--accent-primary);
}

a:hover {
  text-decoration: underline;
}
</style>
