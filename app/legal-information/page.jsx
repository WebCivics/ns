export const metadata = {
  title: 'Legal information and terms | ns.webcivics.net',
  description: 'Scope, source, limitations, attribution, and terms for experimental legislation renderings.',
};

const registerUrl = 'https://www.legislation.gov.au/';
const eurLexUrl = 'https://eur-lex.europa.eu/';

export default function LegalInformationPage() {
  return (
    <article className="container legal-information-page">
      <p className="eyebrow">Legislation collection</p>
      <h1>Legal information, scope and terms of use</h1>
      <p className="status-line"><strong>Technical alpha / proof of concept</strong> · Updated 15 July 2026</p>

      <div className="legal-summary" role="note" aria-label="Important legal information">
        <h2>Important: this is not legal advice or an official source</h2>
        <p>
          These pages are experimental, machine-assisted semantic renderings intended to help people
          explore legislation, identify potentially relevant provisions, and frame questions for a
          qualified legal professional. Do not rely on them to make legal, compliance, financial, or
          other consequential decisions.
        </p>
        <a className="btn btn-primary" href={registerUrl}>Australian Federal Register</a>{' '}
        <a className="btn btn-secondary" href={eurLexUrl}>EUR-Lex</a>
      </div>

      <section>
        <h2>1. What this collection is</h2>
        <p>
          The collection is a technical demonstration that parses legislation from official sources
          into human-readable HTML and semantic formats. It adds machine-proposed concepts,
          relationships, and logic classifications to support discovery and research. It is in active
          development and may change without notice.
        </p>
      </section>

      <section>
        <h2>2. What it is not</h2>
        <p>
          Nothing on this site is legal advice, a legal opinion, a compliance determination, or a
          substitute for advice from a qualified professional. Use of the site does not create a
          solicitor-client or other professional relationship. The site is not affiliated with or
          endorsed by the Australian Government, the Office of Parliamentary Counsel, the European Union,
          or the Publications Office of the European Union.
        </p>
      </section>

      <section>
        <h2>3. Official and authorised versions</h2>
        <p>
          The <a href={registerUrl}>Federal Register of Legislation</a> is the approved whole-of-government
          source for Australian Government legislation. The Register explains that authorised versions
          are PDF documents bearing the relevant authorised or authoritative marking. A transformed HTML,
          RDF, CML, COF, JSON-LD, Turtle, or QualiaDB representation on this site is not an authorised version.
        </p>
        <p>
          Each legislation page links to the corresponding Register ID when one is available. Always use
          that record to check the law's status, the applicable point-in-time version, commencement,
          amendments, endnotes, rectifications, and any supporting or incorporated material.
        </p>
        <p>
          For European Union material, follow the page's ELI link to EUR-Lex and the Official Journal record.
          Only EU documents published in the Official Journal of the European Union are authentic.
        </p>
      </section>

      <section>
        <h2>4. Automated transformation and interpretation risk</h2>
        <p>
          Source documents are parsed and segmented programmatically. Machine-assisted classification may
          then propose deontic, temporal, epistemic, or other semantic relationships. Parsing can misidentify
          headings or provision boundaries; annotations can be incomplete or wrong; and a provision shown in
          isolation can lose qualifications supplied elsewhere in the legislation or by other law.
        </p>
        <p>
          Labels such as “obligation”, “permission”, “right”, or “prohibition” are exploratory metadata,
          not findings about the legal effect of a provision. Courts, tribunals, regulators, and practitioners
          may interpret the same material differently and in a wider factual and legal context.
        </p>
      </section>

      <section>
        <h2>5. Currency and completeness</h2>
        <p>
          A page reflects only the source document identified on that page. It may be a historical or
          point-in-time compilation and may not include later amendments, repeals, rectifications,
          uncommenced provisions, modifications, application or transitional rules, or material incorporated
          by reference. Processing and publication dates are not assurances that the law remains current.
        </p>
      </section>

      <section>
        <h2>6. Appropriate use</h2>
        <p>You may use the collection to explore legal information and prepare questions. You remain responsible for:</p>
        <ul>
          <li>checking the relevant official Register, ELI, EUR-Lex or Official Journal record;</li>
          <li>considering whether other legislation, case law, delegated legislation, or facts affect the issue;</li>
          <li>obtaining qualified advice before acting or deciding not to act; and</li>
          <li>not presenting machine-proposed annotations as official or professionally reviewed conclusions.</li>
        </ul>
      </section>

      <section id="source-legislation">
        <h2>7. Source legislation: copyright and reuse</h2>
        <p>
          The legislation pages are based on content from the Federal Register of Legislation and have been
          reformatted and augmented for semantic display. The Register states that, except for the Commonwealth
          Coat of Arms and material otherwise noted, its content is provided under the{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International licence</a>.
          Third-party material and other exceptions may require separate permission. See the Register's{' '}
          <a href="https://www.legislation.gov.au/terms-of-use">terms of use</a> for the controlling source and attribution conditions.
        </p>
        <p>
          Rights in source legislation remain governed by the official source. The separate technical-work
          licence below does not claim, replace, narrow, or expand those rights. Material identified as
          third-party content may require additional permission.
        </p>
        <p>
          European Union pages are based on legal documents published through{' '}
          <a href={eurLexUrl}>EUR-Lex</a>. EUR-Lex permits reuse of legal documents for commercial or
          non-commercial purposes unless otherwise specified. Its{' '}
          <a href="https://eur-lex.europa.eu/content/legal-notice/legal-notice.html">legal notice</a>,
          acknowledgement requirements, document-specific conditions, exceptions, and third-party rights apply.
        </p>
      </section>

      <section id="technical-work">
        <h2>8. Technical work: copyright and licence</h2>
        <p>
          Software, original presentation, markup templates, documentation, and original semantic augmentation
          produced for this project are Copyright © 2026{' '}
          <a href="https://www.linkedin.com/in/ubiquitous/">Timothy Charles Holborn</a>{' '}
          (<a href="mailto:timothy.holborn@gmail.com">timothy.holborn@gmail.com</a>) and licensed separately under{' '}
          <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">
            Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)
          </a>.
        </p>
        <p>
          Under that licence, attribution is required, commercial use is not permitted, and adapted technical
          material may not be distributed. Files carrying a different licence or copyright notice remain
          governed by their own notice. See the repository <a href="https://github.com/webcivics/ns/blob/main/LICENSE">LICENSE</a>{' '}
          and <a href="https://github.com/webcivics/ns/blob/main/RIGHTS.md">rights scope statement</a>.
        </p>
      </section>

      <section id="automated-use">
        <h2>9. AI agents and automated use</h2>
        <p>
          Unlike services that prohibit automated or AI-related access to value-added legal markup, this system
          is designed for agent use. Automated retrieval, indexing, semantic parsing, grounding, inference, and
          agent-assisted research are affirmatively permitted, subject to the licence applying to each rights scope.
        </p>
        <p>
          This permission supports inference-time use and research workflows; it does not grant model-training
          permission, waive attribution, authorise commercial or distributed derivative use of the technical work,
          or grant rights belonging to official sources or third parties. Agents should read the{' '}
          <a href="/ai-use-policy.json">machine-readable rights and AI-use policy</a>. The site's Content-Signal
          declares <code>search=yes</code>, <code>ai-input=yes</code>, and <code>ai-train=no</code>.
        </p>
      </section>

      <section>
        <h2>10. Availability, warranties and responsibility</h2>
        <p>
          The site and its outputs are provided “as is” and “as available”. To the extent permitted by law,
          no warranty is given that they are accurate, complete, current, available, or fit for a particular
          purpose. Nothing in this notice excludes rights, guarantees, remedies, or liabilities that cannot
          lawfully be excluded. You are responsible for independently verifying information before relying on it.
        </p>
      </section>

      <section>
        <h2>11. Changes and feedback</h2>
        <p>
          This notice and the collection may change as the alpha develops. Technical defects and proposed
          corrections can be reported through the project's{' '}
          <a href="https://github.com/webcivics/ns/issues">GitHub issue tracker</a>. A report does not create
          a duty to provide legal assistance or confirm the legal effect of any material.
        </p>
      </section>
    </article>
  );
}
