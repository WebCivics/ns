# Agent MCP guide — Qualia WASM Lite on ns.webcivics.net

This guide is for **LLM agents and tool hosts** that need to discover and reason over
Web Civics ontologies published at `https://ns.webcivics.net`.

The browser-local engine is **webizen-lite-wasm** (Qualia `wasm-ontology` profile):
read-only N3 parse, bounded Quin query, SHACL subset, deontic/epistemic/LTL helpers,
and **site discovery tools** that never open the network themselves.

## Policy first

1. Read <https://ns.webcivics.net/ai-use-policy.json>
2. Read <https://ns.webcivics.net/llms.txt>
3. Automated retrieval, indexing, grounding, and agent-assisted research are affirmatively
   allowed under the published policy. **Training rights are not granted** by Content-Signal
   in `robots.txt`. Respect layered rights on legislation packages.

## Discovery without inventing URLs

| Resource | URL |
|----------|-----|
| Agent navigation | https://ns.webcivics.net/llms.txt |
| Conformance (must/should/must-not) | https://ns.webcivics.net/agent-conformance.md |
| DCAT catalog (JSON) | https://ns.webcivics.net/catalog.json |
| Catalog Turtle | https://ns.webcivics.net/catalog.ttl |
| Title index (all) | https://ns.webcivics.net/search/title-index.json |
| AU title index | https://ns.webcivics.net/search/au-title-index.json |
| AU legislation corpus | https://ns.webcivics.net/au-legislation-corpus.json |
| JSON-LD context | https://ns.webcivics.net/context.jsonld |
| Institutions index | https://ns.webcivics.net/institutions/ |
| UN instruments index | https://ns.webcivics.net/institutions/un/ |
| AU federal legislation index | https://ns.webcivics.net/institutions/au-fed-legislation/ |
| Legislation package guide | https://ns.webcivics.net/agent-legislation-guide.md |
| This MCP guide | https://ns.webcivics.net/agent-mcp-guide.md |
| WASM package (web) | https://ns.webcivics.net/wasm/webizen-lite/ |

### URL contract

- **HTML docs (human + agent browse):** trailing slash  
  `https://ns.webcivics.net/institutions/un/api-1977/`
- **RDF projections:**  
  `.n3` (canonical source when rules matter), `.ttl`, `.jsonld`
- **Directory pages** (no leaf file): list children —  
  `/institutions/`, `/institutions/un/`, `/core/`, etc.
- Prefer short paths (`/core/...`, `/institutions/...`). `/ontologies/...` is compatibility only.

## Qualia WASM Lite (MCP in-process)

### Embed (browser)

```html
<script type="module">
  import init, { mcp_jsonrpc, version } from "/wasm/webizen-lite/webizen_lite_wasm.js";
  await init();
  console.log("webizen-lite-wasm", version());

  const list = JSON.parse(mcp_jsonrpc(JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list"
  })));
  console.log(list);
</script>
```

### MCP methods

- `initialize` — negotiate protocol (`2025-11-25`, `2025-06-18`, `2025-03-26`)
- `ping`
- `tools/list`
- `tools/call`

Notifications without `id` return an empty string (JSON-RPC).

### Discovery tools

| Tool | Purpose |
|------|---------|
| `namespace_discovery_help` | Offline URL contract + recommended agent flow for this namespace |
| `catalog_summarize` | Parse a **fetched** `catalog.json`; filter by `categoryPrefix`, `titleContains`, `idPrefix` |
| `corpus_summarize` | Parse a **fetched** legislation corpus JSON (e.g. AU); `titleContains` / `idPrefix` |
| `resolve_dataset_urls` | Expand `/institutions/un/api-1977` → html/n3/ttl/jsonld URLs |
| `export_graph` | Serialise ground triples: `jsonld` (default), `rdfjson`, `turtle`, `n3`, `yamlld` |

### Session graph + query (compile-to-runtime path)

| Tool | Purpose |
|------|---------|
| `load_graph` | Load `n3` / `quins` / `q42lite` into a **session** graph (max 8 graphs, bounded Quins) |
| `load_q42` | Load **Q42L** (wasm-safe) base64; native Q42 v3 memmap volumes are **rejected** with guidance |
| `list_graphs` / `unload_graph` | Session management |
| `query_graph` | Filter by S/P/O/C hashes and `labelContains` / `objectContains` (lexicon) |
| `query_sparql` | **SELECT-only subset**: `SELECT * WHERE { ?s ?p ?o }` + optional `FILTER(CONTAINS(…?o…))` |
| `export_q42lite` | Serialise a session graph to Q42L base64 for transfer |

**Q42L** magic `Q42L` (version 1): header + optional JSON lexicon + packed 48-byte Quins.  
Full native **Q42 v3** (LZ4 SuperBlocks + mmap) remains a **desktop/`qualia-cli`** path until a wasm-safe reader ships.

### Deontic bridge

| Tool | Purpose |
|------|---------|
| `compile_deontic_norms` | Build norm Quins from `{partyIri, propertyIri, actionIri, opcode, expiryUnix, isDefeater}` |
| `evaluate_deontic_session` | Run `evaluate_deontic` on `graphId` or `quins` + `nowUnix` |
| `evaluate_deontic` / `deontic_govern` | Direct Quin / policy-mode tools (unchanged) |

### Other reasoning tools

`ontology_capabilities`, `hash_iri`, `parse_n3`, `query_quins`, `validate_shacl`,
`evaluate_epistemic`, `route_paraconsistent`, `evaluate_ltl`, `check_subsumption`.

**No network, no filesystem, no LLM weights** inside the WASM. Hosts must `fetch` then call tools.

### Export formats (bot-readable RDF)

| `format` | Media type | Notes |
|----------|------------|--------|
| `jsonld` | `application/ld+json` | **Default** for agents |
| `rdfjson` | `application/rdf+json` | [RDF/JSON WG Note](https://www.w3.org/TR/rdf-json/) — no JSON-LD context required |
| `turtle` | `text/turtle` | Conventional RDF |
| `n3` | `text/n3` | Ground projection unless you attach native rules separately |
| `yamlld` | `application/ld+yaml` | Same model as JSON-LD, YAML text |

`logicMode` on `export_graph`: `none` | `as-data` | `evaluate` | `native-n3` — sets honesty flags in `queryMeta.dropped`. Executable N3 rules are **not** fully represented in pure RDF/JSON; use N3 or Qualia `evaluate_*` / future `.q42` load.

### Example: list UN instruments via catalog

```js
const catalogText = await (await fetch("https://ns.webcivics.net/catalog.json")).text();
const reply = JSON.parse(mcp_jsonrpc(JSON.stringify({
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: {
    name: "catalog_summarize",
    arguments: {
      catalogJson: catalogText,
      categoryPrefix: "institutions/un",
      limit: 20
    }
  }
})));
// reply.result.structuredContent.datasets → titles + n3Url / canonicalUrl
```

### Example: find AU Privacy / CDR by title

```js
const corpusText = await (await fetch("https://ns.webcivics.net/au-legislation-corpus.json")).text();
const hits = JSON.parse(mcp_jsonrpc(JSON.stringify({
  jsonrpc: "2.0", id: 21, method: "tools/call",
  params: {
    name: "corpus_summarize",
    arguments: { corpusJson: corpusText, titleContains: "Consumer Data Right", limit: 10 }
  }
})));
// hits.result.structuredContent.datasets → C2019A00063, F2025C00572, …
```

### Example: export a section as JSON-LD or RDF/JSON

```js
const exported = JSON.parse(mcp_jsonrpc(JSON.stringify({
  jsonrpc: "2.0", id: 22, method: "tools/call",
  params: {
    name: "export_graph",
    arguments: {
      format: "rdfjson", // or "jsonld"
      logicMode: "as-data",
      triples: [{
        s: "https://example.org/about",
        p: "http://purl.org/dc/terms/title",
        o: { type: "literal", value: "Anna's Homepage", lang: "en" }
      }]
    }
  }
})));
// exported.result.structuredContent.body → graph; mediaType → application/rdf+json
```

### Example: parse a rights instrument

```js
const n3 = await (await fetch("https://ns.webcivics.net/institutions/un/api-1977.n3")).text();
const parsed = JSON.parse(mcp_jsonrpc(JSON.stringify({
  jsonrpc: "2.0",
  id: 3,
  method: "tools/call",
  params: { name: "parse_n3", arguments: { source: n3 } }
})));
```

### Example: bootstrap help (no fetch)

```js
mcp_jsonrpc(JSON.stringify({
  jsonrpc: "2.0", id: 4, method: "tools/call",
  params: { name: "namespace_discovery_help", arguments: {} }
}));
```

## Host MCP wiring (desktop / agent runtime)

1. Load the WASM module (same `mcp_jsonrpc` export).
2. On `tools/list` / `tools/call` from the outer MCP session, forward to `mcp_jsonrpc`.
3. For any tool that needs documents, **you** perform HTTP GET (with policy headers if required), then pass the body as a string argument.
4. Cite `canonicalUrl` from the catalog when answering users.

## Build the package (maintainers)

From the Qualia monorepo:

```bash
wasm-pack build crates/webizen-lite-wasm --target web --out-dir pkg --release
# copy pkg/* into ns site: public/wasm/webizen-lite/
```

Reference size (order of magnitude): ~270 KiB raw / ~95 KiB gzip.

## Related

- Human-readable legislation packaging: [agent-legislation-guide.md](./agent-legislation-guide.md)
- Qualia capability profiles: QualiaDB `docs/manuals/wasm-capability-profiles.md`
- Product habitat (desktop): Webizen / QualiaDB branch `0.0.26`
