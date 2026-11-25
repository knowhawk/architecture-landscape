# Tools

Command-line tools for maintaining an instance of the Architecture Landscape template. They require Python 3.8 or later and no external package.

These tools are licensed under the MIT licence ([LICENCE](LICENCE)); the template itself is licensed under CC BY 4.0.

## compare_ids.py

Compares the object identifiers of two Archi models. Use it to check that an instance can still be updated by import from a release (see *Updating the Reference Libraries of an instance* in the main [README](../README.md)).

```
python3 compare_ids.py REFERENCE TARGET
```

- `REFERENCE`: the model of a release, `Architecture_Landscape_<version>.archimate` (an `.architemplate` is also accepted: the tool reads the model inside the archive).
- `TARGET`: your instance (`.archimate`).

### Output

1. **A table by kind of object** (model, folder, element, relation, view, diagram object, profile):
   - *Same id*: objects of the release found in the instance with the same identifier;
   - *Missing*: objects of the release not found in the instance;
   - *Added*: objects of the instance that are not in the release, normally your architecture content.
2. **Suspected duplicates in the target**: folders, elements, views or profiles sharing kind, type, name and specialisation.
3. **Reference identifiers kept in target**, as a percentage.

### Interpretation

| Result | Meaning |
|---|---|
| Kept close to 100 % | The instance shares the identifiers of the release: it can be updated by import. |
| Kept close to 0 % | The instance was created with *New Model from Template* (or saved again as a template): Archi regenerated the identifiers. An import would duplicate the Reference Libraries instead of updating them. |
| Some *Missing* | Objects of the release deleted or recreated in the instance. The Reference Libraries should not be modified in an instance. |
| Duplicate folders with the same name | Expected: the template repeats folder names on purpose (for example one `Architecture Repositories` folder per top-level folder, one `C Concepts` folder per view zone). |
| Duplicate elements, views or profiles | To be checked: usually the result of an import into a model with regenerated identifiers. |

Run it before and after each import into your instance.
