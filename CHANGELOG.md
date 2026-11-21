# Changelog

All notable changes to the Architecture Landscape template are documented here. Versions follow [Semantic Versioning](https://semver.org/): 0.x releases are initial development; 1.0 will cover the whole NAF grid in scope.

## [0.2] – 2026-11-21

### Added
- 8 NAF Viewpoint Guides completing row C: C2 Enterprise Vision, C3 Capability Dependencies, C4 Standard Processes, C5 Effects, C7 Performance Criteria, C8 Planning Constraints, Cr Capability Roadmap, and C1-S1 Service to Capability Mapping.
- 8 Viewpoint elements and 16 Concern elements (54 Concerns in total), with their associations.
- 47 relationships between metamodel elements used by the new guides.

### Changed
- Documentation of the Concerns shared by several viewpoints (e.g. Capability Planning and Management, Service Planning).
- Template Version 0.2; Read Me title.

### Notes
- Generated incrementally from 0.1: all existing identifiers, elements, relationships and views are unchanged.

## [0.1] – 2026-11-20

First release.

### Added
- Single Archi model **Architecture Landscape**, structured along the four zones of the NAF v4.1 architecture landscape: Reference Libraries and Architecture Repositories in the model, Workspace as Git branches, Registers as jArchi reports.
- **Reference Libraries**
  - ArchiMate Metamodel: 60 generic elements (one per ArchiMate 3.2 type, default meaning of the type) and 139 relationships, with one overview view per layer and a complete view.
  - 60 specialisations (56 on elements, 4 on relationships) and a NAF Metamodel of 56 elements, one per element specialisation.
  - 13 Viewpoint elements and 38 Concern elements.
  - 13 NAF Viewpoint Guides: row A (A1–A8, Ar) and column 1 (C1, S1, L1, P1).
  - 3 superstructure views (active resources, behaviour, passive resources) and an overview of the NAF Metamodel.
  - Empty Reference Architectures folders.
- **Architecture Repositories**: element folders per type, with sub-folders per specialisation; view folders by level (1 Enterprise, 2 Domain, 3 Programme, 4 Project) and by NAF grid row.
- View **0 Read Me**: purpose, structure, how to start, modelling rules, properties, version control, adaptations of NAF, maintenance of the Reference Libraries.
- Model properties: Template Name, Template Version, Framework, Organization, Model Owner, License.

### Known limitations
- Layout of generated diagrams, especially relationships, to be improved progressively.
- 31 NAF Viewpoint Guides remain to be written (rows C, S, L, P, columns 2 to r).
- jArchi controls and reports not yet provided.
