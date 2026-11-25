# jArchi scripts

Scripts for working with an instance of the Architecture Landscape template in [Archi](https://www.archimatetool.com/), with the jArchi scripting plug-in. They read the structure of the template from the model itself (guides, grid-row and level folders): they follow new releases of the template without change.

These scripts are licensed under the MIT licence ([LICENCE](LICENCE)); the template itself is licensed under CC BY 4.0.

## Installation

1. Install the jArchi plug-in (version 1.12 or later, which requires Archi 5.8 or later; tested with Archi 5.11).
2. Copy the `scripts` folder of the release to your computer.
3. In Archi, open the **Scripts Manager** and set the scripts folder to this `scripts` folder in the jArchi preferences, or drag the `Architecture Landscape` folder into the Scripts Manager. Keep the `lib` folder next to the `Architecture Landscape` folder: every script loads its libraries from `../../lib/`.
4. Select your model (or any object of it) in the Models Tree before running a script.

## Scripts

| Folder | Script | Purpose | Changes the model |
|---|---|---|---|
| Create | New View from Guide | Creates an empty view `<code> <Subject>` in the folder of its level, scope and grid row, with the view properties (NAF Viewpoint, Architecture State, Enterprise Phase, Programme, ArchiMate Viewpoint) and the Purpose of its guide as documentation. The guide diagram is not copied: build the view with your architecture content, following the guide. | Yes |
| Create | New Scope Folder | Creates a documented domain, programme or project folder under `2 Domain`, `3 Programme` or `4 Project`, with its five grid-row folders. | Yes |
| Check | Check Metamodel Links | Relationships between the architecture content and the generic elements of the ArchiMate Metamodel or the NAF Metamodel; content views showing a generic element. | No |
| Check | Check Views | View name `<code> <Subject>`, NAF Viewpoint, grid-row folder, Architecture State, Enterprise Phase, Programme. | No |
| Check | Check Properties | Lifecycle Status and Change Reference; State, Initial State, State Transition and their events; Attribute and Physical Characteristic; Readiness Level; Protocol and Standard on relationships; numbered keys and list values. | No |
| Check | Run All Checks | Runs the three checks and prints a summary. Run it before each pull request, together with the Archi Validator. | No |
| Registers | Register Viewpoint Usage | Writes `viewpoint-usage-<date>.csv` (one line per view) and `.md` (matrix scope x viewpoint) in a folder you choose. | No |
| Registers | Register Lifecycle | Writes `lifecycle-<date>.csv` (one line per concept with a Lifecycle Status) and `.md` (summary and portfolio of changes) in a folder you choose. | No |

The checks only look at the architecture content: the Reference Libraries are left aside. Each message gives the level (ERROR or WARNING), the check, the object (name, type and folder) and the rule broken. Errors break a rule of the template; warnings point at something to review.

CSV files are UTF-8 with a byte order mark, comma-separated (RFC 4180). If Excel shows a register in a single column (for example with French or Belgian regional settings), open it with **Data › From Text/CSV** instead of a double-click.

## Rules checked

The rules are those of the view **0 Read Me** of the model (sections 4 and 5).
