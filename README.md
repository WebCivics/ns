# ns.webcivics.net

**The Web Civics Ontology Namespace**

Welcome to `ns.webcivics.net`, the foundational namespace and semantic registry for Web Civics.

While initiatives like `schema.org` provide vocabularies optimized for search engines and commercial discoverability, this namespace is designed specifically for **Human-Centric** systems. It provides the RDF vocabularies, SHACL shapes, and Context Markup Language (CML) architectures necessary to codify human rights instruments, fundamental freedoms, and the modalities of human agency into the fabric of the Semantic Web.

## The Core Philosophy: "Civics" vs. "Civic"

The architecture of this namespace is built on a precise distinction between two concepts that are often mistakenly conflated:

* **Civics (The Activity):** Civics is an active, generative verb. It is the grassroots activity of *natural persons* organizing, building, and asserting their rights and mutual agreements. It is the bottom-up creation of the social contract.
* **Civic (The Artifact):** Civic is the resulting noun or adjective. It describes the infrastructure, public goods, or frameworks that are often subsequently adopted, maintained, or managed by formal institutions (such as governments) *after* natural persons have established them.

**Web-Civics** is the digital manifestation of the former. It represents the proactive, technical engineering by natural persons to build web-scale systems that protect self-determination, autonomy, and human rights. This namespace provides the semantic tooling for natural persons to engage in Web-Civics.

## What is Published Here?

This site serves as a machine-readable, resolvable directory of ontologies and knowledge graphs, providing:

* **Normative Instruments:** High-fidelity RDF/SHACL representations of international human rights instruments (from institutions like the UN, UNESCO, ILO, etc.). These are structured to reflect the exact modalities defined in the instruments themselves.
* **nquins & CML Integration:** Advanced contextual data structures utilizing nquins alongside Context Markup Language (CML) to enable deep, context-aware semantic mapping.
* **Human-Centric Architectures:** Vocabularies that prioritize user agency and local, decentralized data storage over centralized institutional control.

*(Note: Within these vocabularies, we strictly differentiate natural persons and their agency from institutional tracking. Enumerated states involving the use of multiple cryptography-supported identifiers are treated with specific, compartmentalized precision.)*

## Directory Structure & Usage

URIs within this namespace are designed to be persistent and conceptually structured. For example, international agreements are organized by their institutional provenance and normative function, rather than being treated as commercial "vendor" schemas:

* `/institutions/un/...`
* `/institutions/unesco/...`
* `/normative/declarations/...`

When resolving URIs, this server uses content negotiation to return either human-readable HTML documentation or machine-readable W3C standard formats (JSON-LD, Turtle, RDF/XML) based on the `Accept` headers of the request.

## Contributing

`ns.webcivics.net` is an evolving, open-source effort heavily aligned with W3C community standards, including paradigms emerging from the Human-Centric AI Community Group and the broader Web Science community.

*(Contribution guidelines and repository links to be added.)*
