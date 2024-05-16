# Collections

The collections feature supports the
[collections service](https://kbase.us/services/collections/docs).

The purpose of this README is to contain notes useful to developers, which may
not be easily grokked from the code.

### Special Casing for GTDB Collection

Due to difficulties loading the GTDB collection, some functionality had to be
special-cased to support its slightly different data schema. Once GTDB has been
updated to match the schema of the other collections, these should be removed.
These instances are marked with comments staring with `GTDB`. As of writing,
these include:

- [// GTDB IDs are not (yet?) UPAs](https://github.com/kbase/ui/blob/abc33d5d357def6b3696aa2420cb500f17ea8d9f/src/features/collections/data_products/GenomeAttribs.tsx#L209)
- [// GTDB has different column names (#1)](https://github.com/kbase/ui/blob/abc33d5d357def6b3696aa2420cb500f17ea8d9f/src/features/collections/data_products/GenomeAttribs.tsx#L294)
- [// GTDB has different column names (#2)](https://github.com/kbase/ui/blob/abc33d5d357def6b3696aa2420cb500f17ea8d9f/src/features/collections/data_products/GenomeAttribs.tsx#L298-L300)
- [// GTDB has different column names (#3)](https://github.com/kbase/ui/blob/c3494d03bc1b6da9d43bcaf8aee66962c73b241a/src/features/collections/data_products/GenomeAttribs.tsx#L320)

### Other Hardcoded Column Values

As of writing, some other collection column names have been hardcoded into the
codebase, these are marked with comments starting with `HARDCODED`. They
include:

- [Special rendering for the `classification` column](https://github.com/kbase/ui/blob/3c89e2651710c92fed916d13cb98a5e47cd7c5e1/src/features/collections/data_products/GenomeAttribs.tsx#L220-L241)
- [using the `classification` filter as our default search filter](https://github.com/kbase/ui/blob/3c89e2651710c92fed916d13cb98a5e47cd7c5e1/src/features/collections/CollectionDetail.tsx#L174-L194)
- the field order parameter and the hidden fields parameter hardcode overrides
  for which columns will appear and in what order

  - [genomeAttribs](https://github.com/kbase/ui/blob/3c89e2651710c92fed916d13cb98a5e47cd7c5e1/src/features/collections/data_products/GenomeAttribs.tsx#L244-L246)
  - [sampleAttribs](https://github.com/kbase/ui/blob/3c89e2651710c92fed916d13cb98a5e47cd7c5e1/src/features/collections/data_products/SampleAttribs.tsx#L287-L294)
- Plots are currently hardcoded for certain columns in the existing collections
  schema

  - [histogram](https://github.com/kbase/ui/blob/3c89e2651710c92fed916d13cb98a5e47cd7c5e1/src/features/collections/data_products/GenomeAttribs.tsx#L319-L325)
  - [scatter](https://github.com/kbase/ui/blob/3c89e2651710c92fed916d13cb98a5e47cd7c5e1/src/features/collections/data_products/GenomeAttribs.tsx#L292-L304)
