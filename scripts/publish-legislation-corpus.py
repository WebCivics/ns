#!/usr/bin/env python3
"""Publish validated legislation ETL graphs into the tracked namespace source tree."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


REGISTER_ID = re.compile(r"^([A-Z]\d{4}[A-Z]\d{5})")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def official_register_url(dataset_id: str) -> tuple[str, str]:
    match = REGISTER_ID.match(dataset_id.upper())
    if not match:
        raise ValueError(f"unrecognised Federal Register ID: {dataset_id}")
    register_id = match.group(1)
    if register_id[5] == "C":
        return register_id, f"https://www.legislation.gov.au/{register_id}"
    return register_id, f"https://www.legislation.gov.au/{register_id}/latest/downloads"


def augment_graph(text: str, base_iri: str, dataset_id: str, official_url: str) -> str:
    marker = f"<{base_iri}> a cof:Document ;\n"
    if text.count(marker) != 1:
        raise ValueError(f"expected exactly one document marker for {dataset_id}: {base_iri}")
    additions = (
        marker
        + f'    dc:identifier "{dataset_id}" ;\n'
        + f"    prov:wasDerivedFrom <{official_url}> ;\n"
    )
    return text.replace(marker, additions, 1)


def publish(source_root: Path, destination_root: Path, manifest_path: Path,
            expected_count: int) -> None:
    source_root = source_root.resolve()
    destination_root = destination_root.resolve()
    manifest_path = manifest_path.resolve()
    instrument_dirs = sorted(path for path in source_root.iterdir() if path.is_dir())
    if len(instrument_dirs) != expected_count:
        raise RuntimeError(
            f"expected {expected_count} instrument directories, found {len(instrument_dirs)}"
        )

    destination_root.mkdir(parents=True, exist_ok=True)
    records: list[dict] = []
    expected_outputs: set[Path] = set()

    for instrument_dir in instrument_dirs:
        source_graphs = list(instrument_dir.glob("*.cml.n3"))
        source_manifest = instrument_dir / "manifest.json"
        if len(source_graphs) != 1 or not source_manifest.is_file():
            raise RuntimeError(
                f"{instrument_dir.name}: expected one *.cml.n3 and one manifest.json"
            )

        metadata = json.loads(source_manifest.read_text(encoding="utf-8"))
        pending = metadata["segmentation"]["pending"]
        counts = metadata["counts"]
        rdf_validation = metadata["validation"]["rdf"]
        qualia_validation = metadata["validation"]["qualiaDb"]
        if (pending != 0 or counts["classified"] != counts["provisions"]
                or not rdf_validation["ok"] or not qualia_validation["ok"]):
            raise RuntimeError(f"{instrument_dir.name}: package is incomplete or invalid")

        dataset_id = instrument_dir.name
        register_id, official_url = official_register_url(dataset_id)
        graph_text = source_graphs[0].read_text(encoding="utf-8")
        graph_text = augment_graph(
            graph_text, metadata["baseIri"], dataset_id, official_url
        )
        graph_bytes = graph_text.encode("utf-8")
        output = destination_root / f"{dataset_id}.n3"
        output.write_bytes(graph_bytes)
        expected_outputs.add(output)

        records.append({
            "id": dataset_id,
            "registerId": register_id,
            "title": metadata["title"],
            "canonicalUrl": (
                f"https://ns.webcivics.net/institutions/au-fed-legislation/{dataset_id}/"
            ),
            "n3Url": (
                f"https://ns.webcivics.net/institutions/au-fed-legislation/{dataset_id}.n3"
            ),
            "officialSource": official_url,
            "baseIri": metadata["baseIri"],
            "curationStatus": metadata["curationStatus"],
            "model": metadata["generatedBy"]["model"],
            "sourcePdfSha256": metadata["source"]["sha256"],
            "sourcePages": metadata["source"]["pages"],
            "sections": counts["sections"],
            "subsections": counts["subsections"],
            "provisions": counts["provisions"],
            "classified": counts["classified"],
            # Publication adds dc:identifier and official-source provenance to the
            # already validated ETL graph.
            "rdfTriples": rdf_validation["n3Triples"] + 2,
            "qualiaQuinsReadBack": qualia_validation["quinsReadBack"],
            "n3Sha256": sha256(graph_bytes),
            "n3Bytes": len(graph_bytes),
        })

    for stale in destination_root.glob("*.n3"):
        if stale not in expected_outputs:
            stale.unlink()

    corpus = {
        "version": 1,
        "jurisdiction": "AU",
        "source": "Federal Register of Legislation",
        "sourceTerms": "https://www.legislation.gov.au/terms-of-use",
        "curationStatus": "cml:Proposed",
        "datasetCount": len(records),
        "summary": {
            "provisions": sum(record["provisions"] for record in records),
            "classified": sum(record["classified"] for record in records),
            "rdfTriples": sum(record["rdfTriples"] for record in records),
            "qualiaQuinsReadBack": sum(record["qualiaQuinsReadBack"] for record in records),
            "n3Bytes": sum(record["n3Bytes"] for record in records),
        },
        "datasets": records,
    }
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps(corpus, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(
        f"published {len(records)} graphs, {corpus['summary']['rdfTriples']} RDF triples, "
        f"{corpus['summary']['qualiaQuinsReadBack']} verified quins"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument(
        "--destination-root", type=Path,
        default=Path("public/raw/ontologies/institutions/au-fed-legislation"),
    )
    parser.add_argument(
        "--manifest", type=Path, default=Path("public/au-legislation-corpus.json")
    )
    parser.add_argument("--expected-count", type=int, default=222)
    args = parser.parse_args()
    publish(args.source_root, args.destination_root, args.manifest, args.expected_count)


if __name__ == "__main__":
    main()
