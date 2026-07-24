# Agent conformance — ns.webcivics.net + Qualia WASM Lite

This document is the **must / should / must-not** contract for automated agents.
It survives session resets; treat it as normative for bot behaviour on this namespace.

Related: [llms.txt](./llms.txt), [agent-mcp-guide.md](./agent-mcp-guide.md),
[agent-legislation-guide.md](./agent-legislation-guide.md).  
Qualia plan (implementation track): monorepo `docs/plans/wasm-lite-agent-query-plan.md`.

---

## Must

1. **Policy first.** Read `/ai-use-policy.json` and honour Content-Signal (`ai-train=no`).
2. **Discover, do not invent.** Dataset IDs and Register IDs come from `catalog.json`,
   `au-legislation-corpus.json`, or `/search/*-index.json` only.
3. **Host owns HTTP.** WASM Lite never opens the network; the agent/host GETs bodies and
   passes strings/bytes into `mcp_jsonrpc`.
4. **Prefer machine RDF over HTML** for large instruments (`.n3` / `.ttl` / `.jsonld`).
5. **Cite both layers:** namespace `canonicalUrl` and the official Register/ELI/OJ link
   from the package (`prov:wasDerivedFrom` / `officialSource`).
6. **Label curation status.** `cml:Proposed` is a hypothesis, not attested law or legal advice.
7. **Report projection loss.** If `projectedQuadCount > 0` or `queryMeta.dropped` is non-empty,
   say that N3-only logic/rules may be absent from RDF projections.
8. **Bound results.** Respect tool limits (export/query caps); do not dump entire AU compilations
   into a single reply.

## Should

1. Load `/wasm/webizen-lite/` and call `namespace_discovery_help` once per session.
2. Use `titleContains` on `catalog_summarize` / `corpus_summarize` for keyword discovery.
3. Default export format **`jsonld`**; offer **`rdfjson`** for bots without JSON-LD context support.
4. Use deontic tools (`evaluate_deontic`, `deontic_govern`) only on Quin/norm inputs that match
   the documented layout — after selecting the relevant section/graph.
5. Prefer published `.q42` volumes when listed (future packages); fall back to N3 until then.
6. Keep ground graph (A), logic-as-data (B), and executable logic (C) distinct in answers.

## Must not

1. Invent legislation IDs, article numbers, or “APP 12” text not grounded in retrieved graph/source.
2. Claim training rights from site Content-Signal.
3. Present WASM modal evaluation as a court judgment or authorised official text.
4. Use `/catalog.rest` or other non-existent discovery endpoints.
5. Treat multi-MB HTML CML dumps as the primary query API.
6. Silently upgrade `cml:Proposed` to Attested / exactMatch.

---

## Gold discovery checks (MVP)

Offline filters after host GET (no requirement that the full act is loaded):

| Query | Source | Expect |
|-------|--------|--------|
| `titleContains`: `Privacy Act` | catalog or au corpus | `C2026C00227` or Privacy Act compilation |
| `titleContains`: `Consumer Data Right` | au corpus | `C2019A00063`, `C2024A00075`, and/or `F2025C00572` |
| `titleContains`: `access` + category AU legislation | optional label index (P2+) | APP 12 style labels when graph loaded |

## Gold export check

```js
// After constructing ground triples for a section:
mcp_jsonrpc({
  jsonrpc: "2.0", id: 1, method: "tools/call",
  params: {
    name: "export_graph",
    arguments: {
      format: "jsonld", // or "rdfjson"
      logicMode: "as-data",
      triples: [
        {
          s: "https://ns.webcivics.net/values/example#sch-1-sec-12",
          p: "http://www.w3.org/2004/02/skos/core#prefLabel",
          o: { type: "literal", value: "12 Australian Privacy Principle 12—access to personal information", lang: "en" }
        }
      ]
    }
  }
});
```

Expect `mediaType` `application/ld+json` or `application/rdf+json`, `queryMeta.tool` = `export_graph`.

---

## Implementation status (honest)

| Capability | Status |
|------------|--------|
| MCP discovery + title filter | **Shipped** |
| export_graph multi-format | **Shipped** |
| Session `load_graph` / Q42L / `query_graph` | **Shipped** |
| `query_sparql` | **Shipped (SELECT subset only)** |
| `compile_deontic_norms` + `evaluate_deontic_session` | **Shipped** |
| Native Q42 v3 in WASM | **Not supported** — use Q42L or N3; desktop CLI for v3 |
| Full SPARQL 1.1 | **Not claimed** — joins/OPTIONAL/UNION fail closed |
| Full N3 rules in RDF/JSON | **Not claimed** — use N3 or evaluate_* |

### End-to-end recipe (AU access / CDR style)

```text
1. GET ai-use-policy.json + llms.txt
2. Load WASM; namespace_discovery_help
3. GET au-legislation-corpus.json → corpus_summarize titleContains="Privacy" / "Consumer Data Right"
4. GET chosen .n3 → load_graph format=n3
5. query_graph objectContains="access"  OR  query_sparql SELECT ?s ?p ?o FILTER CONTAINS …
6. compile_deontic_norms (if modelling a duty) → evaluate_deontic_session(nowUnix)
7. export_graph / export_q42lite as needed
8. Cite canonicalUrl + officialSource; cml:Proposed ≠ attested law
```

---

## Size and safety

- WASM ontology profile: no network, no filesystem, no LLM weights.
- Input bounds: see `ontology_capabilities` tool (`inputQuins`, `queryResults`, `n3Events`).
- Legislation packages may be multi-part; query part-by-part when volumes exist.
