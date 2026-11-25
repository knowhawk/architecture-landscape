#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Olivier Sabbe
# Part of the Architecture Landscape template: https://github.com/knowhawk/architecture-landscape
"""Compare object identifiers between Archi models (.archimate or .architemplate).

Usage:
  python compare_ids.py REFERENCE TARGET

REFERENCE : release model used as source (e.g. Architecture_Landscape_0.6.archimate)
TARGET    : instance model (.archimate) to check
"""
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict

XSI_TYPE = "{http://www.w3.org/2001/XMLSchema-instance}type"


def local(tag):
    return tag.split("}", 1)[-1]


def load_root(path):
    if zipfile.is_zipfile(path):
        with zipfile.ZipFile(path) as z:
            names = [n for n in z.namelist() if n.endswith(".archimate")]
            if not names:
                sys.exit(f"{path}: no .archimate file inside the archive")
            data = z.read(names[0])
        return ET.fromstring(data)
    return ET.parse(path).getroot()


def kind_of(node):
    tag = local(node.tag)
    xtype = node.get(XSI_TYPE, "")
    if tag == "element":
        if xtype.endswith("Relationship"):
            return "relation"
        if xtype.endswith("DiagramModel") or xtype.endswith("SketchModel") or xtype.endswith("CanvasModel"):
            return "view"
        return "element"
    if tag == "folder":
        return "folder"
    if tag == "profile":
        return "profile"
    if tag in ("child", "sourceConnection"):
        return "diagram object"
    if tag == "model":
        return "model"
    return "other"


def collect(root):
    objects = {}
    for node in root.iter():
        oid = node.get("id")
        if not oid:
            continue
        objects[oid] = {
            "kind": kind_of(node),
            "type": node.get(XSI_TYPE, local(node.tag)).replace("archimate:", ""),
            "name": node.get("name", ""),
            "profiles": node.get("profiles", ""),
        }
    return objects


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    ref = collect(load_root(sys.argv[1]))
    tgt = collect(load_root(sys.argv[2]))

    kinds = ["model", "folder", "element", "relation", "view", "diagram object", "profile", "other"]
    print(f"{'Kind':<15}{'Reference':>10}{'Same id':>10}{'Missing':>10}{'Added':>10}")
    for k in kinds:
        r = {i for i, o in ref.items() if o["kind"] == k}
        t = {i for i, o in tgt.items() if o["kind"] == k}
        if not r and not t:
            continue
        print(f"{k:<15}{len(r):>10}{len(r & t):>10}{len(r - t):>10}{len(t - r):>10}")

    groups = defaultdict(list)
    for oid, o in tgt.items():
        if o["kind"] in ("element", "view", "folder", "profile") and o["name"]:
            groups[(o["kind"], o["type"], o["name"], o["profiles"])].append(oid)
    dups = {k: v for k, v in groups.items() if len(v) > 1}
    print(f"\nSuspected duplicates in target: {len(dups)}")
    for (k, t, n, p), ids in sorted(dups.items())[:50]:
        print(f"  {k} | {t} | {n} | profiles={p or '-'} | {len(ids)} ids")

    same = sum(1 for i in ref if i in tgt and ref[i]["kind"] != "model")
    total = sum(1 for i in ref if ref[i]["kind"] != "model")
    if total:
        print(f"\nReference identifiers kept in target: {same}/{total} ({100 * same / total:.1f} %)")


if __name__ == "__main__":
    main()
