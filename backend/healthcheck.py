#!/usr/bin/env python3

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

work = Path(sys.argv[1] if len(sys.argv) > 1 else os.environ.get("WORK_DIR", "/data"))
log_dir = Path(os.environ.get("LOG_DIR", "/var/log/estratti"))
state = Path(os.environ.get("HEALTHCHECK_STATE_FILE", log_dir / "healthcheck.state"))
newer_than = timedelta(days=int(os.environ.get("HEALTHCHECK_NEWER_THAN_DAYS", 2)))
preview_max_lines = int(os.environ.get("HEALTHCHECK_PREVIEW_MAX_LINES", 50))
heartbeat_every = timedelta(days=int(os.environ.get("HEARTBEAT_DAYS", 30)))
heartbeat = log_dir / "heartbeat.state"
counts_state = Path(os.environ.get("HEALTHCHECK_COUNTS_FILE", log_dir / "counts.state"))
out = work / "output"
problems = {}
counts = {}
events = []
labels = {"regions": "regioni", "provinces": "province", "municipalities": "comuni"}


def load(path):
    if not path.exists():
        return {}
    with open(path) as file:
        return json.load(file)


def save(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as file:
        json.dump(data, file, indent=0, sort_keys=True)


def check(path):
    if not (out / path).exists():
        problems[path] = "mancante"
    elif datetime.now() - datetime.fromtimestamp((out / path).stat().st_mtime) > newer_than:
        problems[path] = f"non aggiornato da più di {newer_than.days} giorni"


previous = load(state)
previous_counts = load(counts_state)

unreadable = False
for name in ("regions", "provinces", "municipalities"):
    topojson = f"topojson/limits_IT_{name}.json"
    check(topojson)
    try:
        with open(out / topojson) as file:
            objects = json.load(file)["objects"]
    except (OSError, ValueError, KeyError):
        problems.setdefault(topojson, "illeggibile")
        unreadable = True
        continue
    for obj in objects.values():
        for geometry in obj["geometries"]:
            for key, path in geometry["properties"].items():
                if key.startswith("."):
                    check(path)
    count = sum(len(obj["geometries"]) for obj in objects.values())
    if previous_counts.get(name, count) != count:
        events.append(f"numero di {labels[name]} cambiato: {previous_counts[name]} -> {count}: {topojson}")
    counts[name] = count

save(counts_state, previous_counts | counts)

if unreadable:
    problems = {**previous, **problems}

if problems != previous or events:
    changes = events + [
        f"{previous.get(path, 'ok')} -> {problems.get(path, 'ok')}: {path}"
        for path in sorted(problems.keys() | previous.keys())
        if problems.get(path) != previous.get(path)
    ]
    print(f"[Estratti OSM Italia] Individuati {len(problems)} problemi")
    print(f"\n{len(changes)} cambiamenti dall'ultima esecuzione:")
    for change in changes[:preview_max_lines]:
        print(f"- {change}")
    if len(changes) > preview_max_lines:
        print(f"- ... e altri {len(changes) - preview_max_lines} cambiamenti")
    print(f"\nLog completo: {log_dir}/last")
    save(state, problems)
    heartbeat.touch()
elif heartbeat_every and (
    not heartbeat.exists()
    or datetime.now() - datetime.fromtimestamp(heartbeat.stat().st_mtime) > heartbeat_every
):
    print(f"[Estratti OSM Italia] Heartbeat: {len(problems)} problemi")
    print("\nQuesto messaggio conferma che l'invio delle email funziona.")
    print(f"Log completo: {log_dir}/last")
    heartbeat.parent.mkdir(parents=True, exist_ok=True)
    heartbeat.touch()
