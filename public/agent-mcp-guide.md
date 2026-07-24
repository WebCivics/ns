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
| DCAT catalog (JSON) | https://ns.webcivics.net/catalog.json |
| Catalog Turtle | https://ns.webcivics.net/catalog.ttl |
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

### Discovery tools (new)

| Tool | Purpose |
|------|---------|
| `namespace_discovery_help` | Offline URL contract + recommended agent flow for this namespace |
| `catalog_summarize` | Parse a **fetched** `catalog.json` body; filter by `categoryPrefix` |
| `resolve_dataset_urls` | Expand `/institutions/un/api-1977` → html/n3/ttl/jsonld URLs |

### Reasoning tools (existing)

`ontology_capabilities`, `hash_iri`, `parse_n3`, `query_quins`, `validate_shacl`,
`evaluate_deontic`, `evaluate_epistemic`, `route_paraconsistent`, `evaluate_ltl`,
`check_subsumption`, `deontic_govern`.

**No network, no filesystem, no LLM weights** inside the WASM. Hosts must `fetch` then call tools.

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
