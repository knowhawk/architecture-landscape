// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Olivier Sabbe
// Architecture Landscape - checks of the jArchi scripts (requires al-common.js).
// https://github.com/knowhawk/architecture-landscape
//
// Each check reads the model and fills a report; it never modifies the model (principle J1).
// Only the architecture content is checked: the Reference Libraries are left aside.

var ALChecks = (function () {
    "use strict";

    var EVENT_TYPES = ["business-event", "application-event", "technology-event"];
    var BEHAVIOUR = /(-process|-function|-interaction|-service|-event|value-stream)$/;
    var SINGLE = ["Lifecycle Status", "Change Reference", "Initial State", "Standard Group", "Profile",
        "Readiness Level", "Architecture Status"];
    var KNOWN = SINGLE.concat(["State", "Mode", "State Transition", "Standard", "Protocol",
        "Attribute", "Physical Characteristic"]);

    var genericCache = {};
    function generic(o) {
        if (!(o.id in genericCache)) genericCache[o.id] = AL.isGeneric(o);
        return genericCache[o.id];
    }
    var refCache = {};
    function inRef(o) {
        if (!(o.id in refCache)) refCache[o.id] = AL.isInReferenceLibraries(o);
        return refCache[o.id];
    }
    function contentOf(selector) {
        var out = [];
        $(selector).each(function (o) { if (!inRef(o)) out.push(o); });
        return out;
    }

    // ---------- 3. Metamodel links ----------
    function metamodelLinks(report) {
        var C = "Metamodel Links";
        $("relationship").each(function (r) {
            var s = generic(r.source), t = generic(r.target);
            if (s !== t) {
                var g = s ? r.source : r.target;
                report.error(C, r, "relationship between architecture content and the generic element '" +
                    g.name + "' (" + AL.pathOf(g) + "); use an element with the specialisation instead");
            }
        });
        contentOf("archimate-diagram-model").forEach(function (v) {
            $(v).find().each(function (o) {
                var c = o.concept;
                if (c && generic(c)) report.error(C, v, "the view shows the generic " +
                    (c.type.indexOf("relationship") >= 0 ? "relationship" : "element") + " '" + c.name + "'");
            });
        });
    }

    // ---------- 4. Views ----------
    function views(report) {
        var C = "Views";
        var rows = AL.rows();
        var guides = {};
        AL.guides().forEach(function (g) { guides[g.code] = g; });
        var plateaus = contentOf("plateau").map(function (p) { return p.name; });
        var programmeLevel = AL.levels().filter(function (l) { return /Programme$/.test(l.name); })[0];
        var programmes = [];
        if (programmeLevel) $(programmeLevel).children("folder").each(function (f) { programmes.push(f.name); });
        var seen = {};

        contentOf("archimate-diagram-model").forEach(function (v) {
            var path = AL.folderPath(v);
            if (path.length === 1 && v.name === "0 Read Me") return;
            var row = path[path.length - 1];
            var levelName = path.length > 1 ? path[1] : "";
            if (rows.indexOf(row) < 0) report.error(C, v, "not in a grid-row folder (" + rows.join(", ") + ")");

            var key = path.join("/") + "/" + v.name;
            if (seen[key]) report.warning(C, v, "another view has the same name in this folder");
            seen[key] = true;

            var n = AL.parseViewName(v.name);
            var code = v.prop("NAF Viewpoint");
            if (!n) report.error(C, v, "name is not '<code> <Subject>'");
            if (!code) report.error(C, v, "property NAF Viewpoint is missing");
            else {
                if (n && n.code !== code) report.error(C, v, "code in the name (" + n.code + ") differs from NAF Viewpoint (" + code + ")");
                var g = guides[code];
                if (!g) report.error(C, v, "NAF Viewpoint '" + code + "' is not the code of a guide");
                else if (rows.indexOf(row) >= 0 && g.row !== row) report.error(C, v, code + " belongs in grid row '" + g.row + "', not '" + row + "'");
            }

            var state = v.prop("Architecture State");
            var phase = v.prop("Enterprise Phase");
            if (!state) report.error(C, v, "property Architecture State is missing");
            else if (AL.STATES.indexOf(state) < 0) report.error(C, v, "Architecture State '" + state + "' is not one of " + AL.STATES.join(", "));
            else if (state !== "As-Is" && !phase) report.error(C, v, "property Enterprise Phase is required for a " + state + " view");
            if (phase) {
                if (state === "As-Is") report.warning(C, v, "Enterprise Phase is set on an As-Is view");
                if (plateaus.indexOf(phase) < 0) report.warning(C, v, "Enterprise Phase '" + phase + "' is not the name of a Plateau");
            }

            var prog = v.prop("Programme");
            if (prog) {
                if (!/Project$/.test(levelName)) report.warning(C, v, "property Programme is meant for project views");
                if (programmes.indexOf(prog) < 0) report.warning(C, v, "Programme '" + prog + "' has no folder under " + (programmeLevel ? programmeLevel.name : "the programme level"));
            }
        });
    }

    // ---------- 5. Properties ----------
    function properties(report) {
        var C = "Properties";
        var events = {};
        EVENT_TYPES.forEach(function (t) {
            contentOf(t).forEach(function (e) { (events[e.name] = events[e.name] || []).push(e); });
        });

        function checkObject(o, isRel) {
            var keys = AL.propKeys(o);
            keys.forEach(function (k) {
                var base = k.replace(/[ _-]?\d+$/, "");
                if (base !== k && KNOWN.indexOf(base) >= 0) report.warning(C, o, "numbered key '" + k + "': repeat the key '" + base + "' instead");
                var vals = AL.props(o, k);
                if (SINGLE.indexOf(k) >= 0 && vals.length > 1) report.error(C, o, "'" + k + "' must have a single value");
                if (KNOWN.indexOf(k) >= 0) vals.forEach(function (x) {
                    if (/[;\n]/.test(x) || (/^(State|Mode|Protocol)$/.test(k) && /,/.test(x)))
                        report.warning(C, o, "'" + k + "' value '" + x + "' looks like a list: one value per key");
                });
            });

            // Lifecycle Status and Change Reference
            var ls = AL.props(o, "Lifecycle Status");
            if (ls.length) {
                if (AL.LIFECYCLE.indexOf(ls[0]) < 0) report.error(C, o, "Lifecycle Status '" + ls[0] + "' is not one of " + AL.LIFECYCLE.join(", "));
                else if (AL.NEEDS_CHANGE_REF.indexOf(ls[0]) >= 0 && !AL.props(o, "Change Reference").length)
                    report.error(C, o, "Change Reference is required when Lifecycle Status is " + ls[0]);
            }

            if (isRel) {
                ["Protocol", "Standard"].forEach(function (k) {
                    if (AL.props(o, k).length && o.type !== "flow-relationship")
                        report.error(C, o, "'" + k + "' is set on a relationship only when it is a Flow");
                });
                return;
            }

            // States, modes and transitions
            var states = AL.props(o, "State");
            var stateNames = states.concat(states.map(function (s) { var p = AL.parseNameValue(s); return p ? p.value : s; }));
            AL.props(o, "Initial State").forEach(function (s) {
                if (stateNames.indexOf(s) < 0) report.error(C, o, "Initial State '" + s + "' is not a declared State");
            });
            AL.props(o, "State Transition").forEach(function (s) {
                var t = AL.parseTransition(s);
                if (!t) { report.error(C, o, "State Transition '" + s + "' is not '<From> -> <To> [<Event>]'"); return; }
                [t.from, t.to].forEach(function (x) {
                    if (stateNames.indexOf(x) < 0) report.error(C, o, "State Transition '" + s + "': '" + x + "' is not a declared State");
                });
                if (t.event) {
                    var ev = events[t.event];
                    if (!ev) { report.error(C, o, "State Transition '" + s + "': no Event element named '" + t.event + "'"); return; }
                    var expected = BEHAVIOUR.test(o.type) ? "triggering-relationship" : "association-relationship";
                    var linked = ev.some(function (e) {
                        return $(e).rels(expected).filter(function (r) { return r.source.id === o.id || r.target.id === o.id; }).size() > 0;
                    });
                    if (!linked) report.warning(C, o, "event '" + t.event + "' is not linked to this element by " +
                        (expected === "triggering-relationship" ? "triggering" : "association"));
                }
            });

            // Attributes and physical characteristics
            AL.props(o, "Attribute").forEach(function (s) {
                if (!AL.parseNameValue(s)) report.error(C, o, "Attribute '" + s + "' is not '<name>: <type>'");
            });
            if (AL.props(o, "Attribute").length) {
                if (o.type === "business-object" && o.specialization !== "Information Object")
                    report.warning(C, o, "Attribute is meant for an Information Object (Business Object specialised) or a Data Object");
                else if (o.type !== "business-object" && o.type !== "data-object")
                    report.error(C, o, "Attribute is set only on an Information Object or a Data Object");
            }
            AL.props(o, "Physical Characteristic").forEach(function (s) {
                if (!AL.parseNameValue(s)) report.error(C, o, "Physical Characteristic '" + s + "' is not '<name>: <value>'");
            });
            if (AL.props(o, "Physical Characteristic").length && o.type !== "data-object")
                report.error(C, o, "Physical Characteristic is set only on a Data Object");

            // Readiness Level
            if (AL.props(o, "Readiness Level").length && !(o.type === "implementation-event" && o.specialization === "Milestone"))
                report.error(C, o, "Readiness Level is set only on a Milestone (Implementation Event specialised)");
        }

        contentOf("element").forEach(function (e) { checkObject(e, false); });
        contentOf("relationship").forEach(function (r) { checkObject(r, true); });
    }

    function runAndPrint(name, fn) {
        var r = new AL.Report(name);
        fn(r);
        r.print();
        return r;
    }

    return {
        metamodelLinks: metamodelLinks, views: views, properties: properties,
        runAndPrint: runAndPrint
    };
})();
