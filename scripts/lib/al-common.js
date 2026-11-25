// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Olivier Sabbe
// Architecture Landscape - common library of the jArchi scripts.
// https://github.com/knowhawk/architecture-landscape
//
// Loaded by each script with: load(__DIR__ + "../../lib/al-common.js");
// Reads the structure of the template (guides, folders) from the model itself:
// no list of viewpoints or folders is hard-coded (principle J2).

var AL = (function () {
    "use strict";

    // Names of the template folders the scripts rely on.
    var REFLIB = "Reference Libraries";
    var GUIDES = "NAF Viewpoint Guides";
    var GENERIC = ["ArchiMate Metamodel", "NAF Metamodel"];
    var REPOS = "Architecture Repositories";

    // Property conventions of the template (Read Me, section 5).
    var STATES = ["As-Is", "Transition", "To-Be"];
    var LIFECYCLE = ["Planned", "In Implementation", "Active", "Phasing Out", "Retired"];
    var NEEDS_CHANGE_REF = ["Planned", "In Implementation", "Phasing Out"];

    // ---------- Model and folders ----------

    function requireModel() {
        if (!model.isSet()) {
            window.alert("Select a model (or an object of a model) in the Models Tree first.");
            exit();
        }
    }

    // Names of the folders containing obj, from the top-level folder down.
    function folderPath(obj) {
        var names = [];
        var p = $(obj).parent("folder").first();
        while (p) {
            names.unshift(p.name);
            p = $(p).parent("folder").first();
        }
        return names;
    }

    function pathOf(obj) {
        return folderPath(obj).join(" / ");
    }

    function isInReferenceLibraries(obj) {
        return folderPath(obj).indexOf(REFLIB) >= 0;
    }

    // Generic element or relationship of the ArchiMate Metamodel or the NAF Metamodel.
    function isGeneric(obj) {
        var path = folderPath(obj);
        if (path.indexOf(REFLIB) < 0) return false;
        return path.some(function (n) { return GENERIC.indexOf(n) >= 0; });
    }

    function guidesFolder() {
        var f = $("folder").filter(function (o) {
            return o.name === GUIDES && $(o).parent("folder").first() &&
                $(o).parent("folder").first().name === REFLIB;
        }).first();
        if (!f) {
            window.alert("No folder '" + GUIDES + "' found: this model does not look like an Architecture Landscape instance.");
            exit();
        }
        return f;
    }

    // Top-level Views folder (whatever its name), found from the guides folder.
    function viewsRoot() {
        var f = guidesFolder();
        var p = $(f).parent("folder").first();
        while ($(p).parent("folder").first()) p = $(p).parent("folder").first();
        return p;
    }

    // Grid-row folder names, in the order of the guides folder.
    function rows() {
        var names = [];
        $(guidesFolder()).children("folder").each(function (f) { names.push(f.name); });
        return names;
    }

    // Level folders of the Architecture Repositories zone (1 Enterprise ... 4 Project).
    function levels() {
        var out = [];
        $(viewsRoot()).children("folder").each(function (f) {
            if (f.name !== REFLIB) out.push(f);
        });
        return out;
    }

    // Guide views: [{code, title, row, view, purpose, archimateViewpoint}].
    function guides() {
        var out = [];
        $(guidesFolder()).children("folder").each(function (rowFolder) {
            $(rowFolder).children("archimate-diagram-model").each(function (v) {
                var code = v.prop("NAF Viewpoint");
                if (!code) return;
                out.push({
                    code: code,
                    title: v.name.indexOf(code + " ") === 0 ? v.name.substring(code.length + 1) : v.name,
                    row: rowFolder.name,
                    view: v,
                    purpose: v.documentation || "",
                    archimateViewpoint: v.prop("ArchiMate Viewpoint") || ""
                });
            });
        });
        return out;
    }

    function guideByCode(code) {
        var g = guides();
        for (var i = 0; i < g.length; i++) if (g[i].code === code) return g[i];
        return null;
    }

    function childFolder(parent, name) {
        return $(parent).children("folder").filter(function (f) { return f.name === name; }).first();
    }

    // ---------- Dialogs ----------

    // window.promptSelection() returns a String object (new String(...)), not a string:
    // === and indexOf() fail on it. This wrapper returns a primitive string, or null if cancelled.
    function select(title, choices) {
        var r = window.promptSelection(title, choices);
        return r === null || r === undefined ? null : String(r);
    }

    // window.prompt() wrapper: trimmed primitive string, or null if cancelled.
    function ask(title, value) {
        var r = window.prompt(title, value || "");
        return r === null || r === undefined ? null : String(r).trim();
    }

    // Creates a sub-folder and returns it. The jArchi documentation does not say that
    // folder.createFolder() returns the new folder: if it does not, find it by name.
    function createFolder(parent, name, documentation) {
        var before = [];
        $(parent).children("folder").each(function (f) { before.push(f.id); });
        var f = parent.createFolder(name);
        if (!f || !f.id) {
            f = $(parent).children("folder").filter(function (o) {
                return o.name === name && before.indexOf(o.id) < 0;
            }).first();
        }
        if (!f) throw new Error("Could not create the folder '" + name + "'.");
        if (documentation) f.documentation = documentation;
        return f;
    }

    // ---------- Properties ----------

    // All values of a (possibly repeated) property, as a JavaScript array of strings.
    function props(obj, key) {
        var v = $(obj).prop(key, true);
        if (v === null || v === undefined) return [];
        if (typeof v === "string") return [v];
        var out = [];
        for (var i = 0; i < v.length; i++) out.push(String(v[i]));
        return out;
    }

    // All property keys of an object (repeated keys listed once).
    function propKeys(obj) {
        var k = $(obj).prop();
        var out = [];
        if (!k) return out;
        for (var i = 0; i < k.length; i++) {
            var s = String(k[i]);
            if (out.indexOf(s) < 0) out.push(s);
        }
        return out;
    }

    // ---------- Pure rules (no jArchi call; tested outside Archi) ----------

    // "<code> <Subject>" -> {code, subject} or null.
    function parseViewName(name) {
        var m = /^(\S+) (\S.*)$/.exec(name || "");
        return m ? { code: m[1], subject: m[2] } : null;
    }

    // "<From> -> <To> [<Event>]" -> {from, to, event} or null (Read Me section 5, specification § 4 bis).
    function parseTransition(s) {
        var m = /^(.+?) -> (.+?)(?: \[(.+)\])?$/.exec(s || "");
        if (!m) return null;
        return { from: m[1].trim(), to: m[2].trim(), event: m[3] ? m[3].trim() : "" };
    }

    // "<name>: <type>" or "<name>: <value>" -> {name, value} or null (specification § 4 ter).
    function parseNameValue(s) {
        var m = /^([^:]+?): (\S.*)$/.exec(s || "");
        return m ? { name: m[1].trim(), value: m[2].trim() } : null;
    }

    // Repeated property written as a numbered key ("State 1", "Standard_2").
    function isNumberedKey(key) {
        return /^.+?[ _-]?\d+$/.test(key) && !/^\d+$/.test(key);
    }

    // ---------- Files (registers) ----------

    var CSV_SEPARATOR = ",";   // RFC 4180; a BOM is written so that Excel reads UTF-8

    function csvLine(cells) {
        return cells.map(function (c) {
            var s = c === null || c === undefined ? "" : String(c);
            return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        }).join(CSV_SEPARATOR);
    }

    function csv(header, rows) {
        return "\uFEFF" + [csvLine(header)].concat(rows.map(csvLine)).join("\r\n") + "\r\n";
    }

    function mdTable(header, rows) {
        var esc = function (c) { return String(c === null || c === undefined ? "" : c).replace(/\|/g, "\\|"); };
        return ["| " + header.map(esc).join(" | ") + " |", "|" + header.map(function () { return "---"; }).join("|") + "|"]
            .concat(rows.map(function (r) { return "| " + r.map(esc).join(" | ") + " |"; })).join("\n") + "\n";
    }

    // Asks for an output folder once; returns null if cancelled.
    function askOutputDir(title) {
        var d = window.promptOpenDirectory({ title: title });
        return d === null || d === undefined ? null : String(d);
    }

    function writeText(dir, fileName, text) {
        var p = dir.replace(/[\\/]$/, "") + "/" + fileName;
        $.fs.writeFile(p, text, "UTF8");
        return p;
    }

    function today() {
        var d = new Date();
        var z = function (n) { return (n < 10 ? "0" : "") + n; };
        return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
    }

    // ---------- Report ----------

    function Report(title) {
        this.title = title;
        this.items = [];
    }
    Report.prototype.add = function (level, check, obj, message) {
        this.items.push({ level: level, check: check, obj: obj, message: message });
    };
    Report.prototype.error = function (check, obj, message) { this.add("ERROR", check, obj, message); };
    Report.prototype.warning = function (check, obj, message) { this.add("WARNING", check, obj, message); };
    Report.prototype.count = function (level) {
        return this.items.filter(function (i) { return i.level === level; }).length;
    };
    Report.prototype.print = function () {
        console.show();
        console.setTextColor(0, 0, 0);
        console.log("=== " + this.title + " ===");
        this.items.forEach(function (i) {
            if (i.level === "ERROR") console.setTextColor(200, 0, 0); else console.setTextColor(200, 120, 0);
            var label = i.obj ? (i.obj.name || (i.obj.source && i.obj.target ? i.obj.source.name + " -> " + i.obj.target.name : "")) : "";
            var o = i.obj ? " '" + label + "' (" + i.obj.type + ", " + pathOf(i.obj) + ")" : "";
            console.log(i.level + " [" + i.check + "]" + o + ": " + i.message);
        });
        console.setTextColor(0, 0, 0);
        console.log(this.title + ": " + this.count("ERROR") + " error(s), " + this.count("WARNING") + " warning(s).");
        console.log("");
    };

    return {
        REFLIB: REFLIB, GUIDES: GUIDES, GENERIC: GENERIC, REPOS: REPOS,
        STATES: STATES, LIFECYCLE: LIFECYCLE, NEEDS_CHANGE_REF: NEEDS_CHANGE_REF,
        requireModel: requireModel, folderPath: folderPath, pathOf: pathOf,
        isInReferenceLibraries: isInReferenceLibraries, isGeneric: isGeneric,
        guidesFolder: guidesFolder, viewsRoot: viewsRoot, rows: rows, levels: levels,
        guides: guides, guideByCode: guideByCode, childFolder: childFolder, createFolder: createFolder, select: select, ask: ask,
        props: props, propKeys: propKeys,
        parseViewName: parseViewName, parseTransition: parseTransition,
        parseNameValue: parseNameValue, isNumberedKey: isNumberedKey,
        csv: csv, mdTable: mdTable, askOutputDir: askOutputDir, writeText: writeText, today: today,
        Report: Report
    };
})();
