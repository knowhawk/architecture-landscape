# Architecture Landscape

An Archi template of an enterprise architecture landscape, inspired by the **NATO Architecture Framework (NAF) v4.1** for method and structure, and modelled in **ArchiMate 3.2** with [Archi](https://www.archimatetool.com/).

It is an original work: NAF and ArchiMate are its two sources of inspiration, not standards it claims to comply with. Every borrowing is cited (document and section) and every deviation is documented.

> Status: **0.1** (initial development). Version 1.0 will cover the whole NAF grid in scope. See [CHANGELOG.md](CHANGELOG.md).

## What it contains

One Archi model, **Architecture Landscape**, organised along the four zones of the NAF architecture landscape (NAF v4.1, ch. 2, §§ 2.15–2.20):

| NAF zone | In this template |
|---|---|
| Workspace | Git working branches |
| Reference Libraries | Zone of the model: ArchiMate Metamodel (one generic element per type), NAF Metamodel (one element per specialisation), Viewpoints and Concerns, Reference Architectures, NAF Viewpoint Guides |
| Architecture Repositories | Zone of the model: the architecture content of the enterprise; approved content is on `main` |
| Registers | jArchi reports (planned) |

- **Specialisations**: NAF concepts are carried by Archi specialisations on the ArchiMate element or relationship whose meaning fits best. A specialisation is set only when it changes the meaning.
- **NAF Viewpoint Guides**: one guide view per NAF viewpoint, named by its code (C1, A2, P1…), with its purpose, concerns, scope, modelling rules and deviations. Version 0.1 contains row A and column 1 (13 guides).
- **Views**: by architecture level (1 Enterprise, 2 Domain, 3 Programme, 4 Project), then by NAF grid row (C Concepts, S Service Specifications, L Logical Specifications, P Physical Resource Specifications, A Architecture Meta-Data).

The view **0 Read Me** inside the model gives the full rules: structure, properties, version control and adaptations of NAF.

## Getting started

1. Download the `.architemplate` file from the latest [release](../../releases).
2. In Archi (5.11 or later): **File › New › New Model from Template…**, then *Open template file*.
3. Rename the model `<Organization> - Architecture Landscape` and fill in the model properties.
4. Create one sub-folder per domain, programme or project under the view folders `2 Domain`, `3 Programme` or `4 Project`.
5. Build each view according to its guide in **Views › Reference Libraries › NAF Viewpoint Guides**.

To put your instance under version control, share it with coArchi (Archi's collaboration plug-in) in a **private repository of your own organisation**. Do not fork this repository.

### Updating the Reference Libraries of an instance

The Reference Libraries are not modified in an instance. To move to a new release, import the new template into your model (**File › Import › Another Model into the selected model**); elements keep their identifiers.

## Adaptations of NAF

- Viewpoints S6, L6 and P6 (sequences) are out of scope.
- States, modes, transitions, standards, profiles, protocols, readiness levels and architecture status are element properties, not elements.
- Architecture versions and baselines are Git commits and tags, not elements.
- Where NAF turns a relationship into an element (needline, operational flow, resource flow, element correspondence), the template uses an ArchiMate relationship with a specialisation.

## Why not TOGAF?

This template draws on two sources only: NAF v4.1 for method and repository structure, and the ArchiMate 3.2 modelling language. The TOGAF® Standard was deliberately not used as a source, for three reasons:

1. **All rights reserved** – The copyright notice of The Open Group publications forbids reproducing any part without the copyright owners' prior permission. This is incompatible with an openly licensed (CC BY 4.0) work.
2. **No licence path for an individual open work** – The TOGAF Standard, 10th Edition, requires a Commercial License for commercial use. The free Non-Commercial License is offered to corporate and academic institutions; individuals are not listed.
3. **Generative AI restrictions** – Without written permission, The Open Group publications may not be used or incorporated for training or developing generative AI systems, nor in connection with using such tools to generate or synthesize content. This template is developed with AI assistance.

Sources: copyright notice of The Open Group publications; https://www.opengroup.org/legal/licensing ; https://www.opengroup.org/licensing-commercial-and-non-commercial (consulted 2026-11-16).

The terms *architecture landscape*, *reference libraries* and *architecture repositories* are used in their NAF sense, where the landscape contains the repositories.

## What about ArchiMate?

ArchiMate is used as a modelling language, as implemented by the open-source Archi tool. The ArchiMate Specification carries the same copyright notice as TOGAF, including an explicit AI use restriction. Therefore no text from it is reproduced, paraphrased or summarized in this template: ArchiMate concepts are only named and referenced by specification chapter.

The template stays on ArchiMate 3.2. For ArchiMate 4, The Open Group offers a free Non-Commercial License open to individuals, alongside an Annual Commercial License; in both cases, the AI use restriction of the copyright notice still applies unless written permission is granted.

## Contributing

Changes go through pull requests to `main`, with Archi Validator reporting no warning. See [.github/pull_request_template.md](.github/pull_request_template.md).

## Licence and trademarks

Architecture Landscape template – Copyright © 2026 Olivier Sabbe.

This template is licensed under the [Creative Commons Attribution 4.0 International](LICENSE) licence (CC BY 4.0).

NAF concepts remain the property of NATO; the NAF v4.1 documents are cited by reference. ArchiMate® and TOGAF® are registered trademarks of The Open Group. Archi® is a registered trademark of Phillip Beauvoir.
