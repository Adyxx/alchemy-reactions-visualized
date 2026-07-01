from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand

from elements.graph_data import build_graph_payload


class Command(BaseCommand):
    help = "Export the graph payload to a static JSON file."

    def add_arguments(self, parser):
        parser.add_argument(
            "--output",
            default="public/elements.json",
            help="Path to write the exported JSON payload.",
        )

    def handle(self, *args, **options):
        output_path = Path(options["output"])
        output_path.parent.mkdir(parents=True, exist_ok=True)

        payload = build_graph_payload()
        output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

        self.stdout.write(self.style.SUCCESS(f"Exported graph data to {output_path}"))
