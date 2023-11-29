import { ComponentProps, useId } from 'react';
import { Select } from '../../common/components';
import { SchemaObject, ErrorObject as AjvError } from 'ajv';

export const MatcherUserParams = (props: {
  params: SchemaObject;
  value?: Record<string, unknown>;
  onChange?: (value: Record<string, unknown> | undefined) => void;
  errors?: AjvError[] | null;
}) => {
  const unknown = 'unknown';
  const ParamViews = {
    [unknown]: UnknownParams,
    GTDBLineageMatcherUserParameters,
    MinHashHomologyMatcherUserParameters,
  };
  const ParamView =
    ParamViews[
      Object.keys(ParamViews).includes(props.params.title ?? unknown)
        ? (props.params.title as keyof typeof ParamViews)
        : unknown
    ];
  const id = useId();
  return (
    <div>
      <div id={id}>
        <ParamView {...props} />
      </div>
      {props.value && props.errors ? (
        props.errors.map((err) => (
          <label htmlFor={id}>
            {err.instancePath}: {err.message}
            <br />
            <code>{JSON.stringify(err.params)}</code>
          </label>
        ))
      ) : (
        <></>
      )}
    </div>
  );
};

const UnknownParams = ({
  params,
}: ComponentProps<typeof MatcherUserParams>) => {
  return <div>Missing User Parameter Implementation for {params.title}</div>;
};

const paramShapeErr = (name: unknown) => {
  throw new TypeError(`${name} schema has unexpected shape.`);
};

const GTDBLineageMatcherUserParameters = ({
  params,
  value,
  onChange,
}: ComponentProps<typeof MatcherUserParams>) => {
  if (!Object.keys(params?.['$defs']?.['GTDBRank'] ?? {}).includes('enum')) {
    paramShapeErr(params.title);
  }
  const definition = params?.['$defs']?.['GTDBRank'] as { enum: string[] };
  const property = params?.['properties']?.['gtdb_rank'];
  let description = '';
  if (typeof property === 'boolean') {
    paramShapeErr(params.title);
  } else {
    description = property?.['description'] ?? '';
  }

  const currentValue = value ? (value as { gtdb_rank: string }) : undefined;

  const id = useId();

  return (
    <div style={{ paddingLeft: '2em' }}>
      <label htmlFor={id}>{description}</label>
      <Select
        id={id}
        value={
          currentValue
            ? { value: currentValue.gtdb_rank, label: currentValue.gtdb_rank }
            : undefined
        }
        options={definition.enum.map((rank) => ({ value: rank, label: rank }))}
        onChange={(opts) =>
          onChange ? onChange({ gtdb_rank: String(opts[0].value) }) : undefined
        }
      />
    </div>
  );
};

const MinHashHomologyMatcherUserParameters = ({
  params,
  onChange,
  value,
}: ComponentProps<typeof MatcherUserParams>) => {
  const max_dist = params?.properties?.['maximum_distance'];
  if (!max_dist) paramShapeErr(params.title);

  const id = useId();
  const currentValue = value
    ? (value as { maximum_distance: number })
    : undefined;

  return (
    <>
      <label htmlFor={id}>
        {max_dist.title}: {max_dist.description}
      </label>
      <br />
      <input
        type="number"
        min={max_dist?.minimum}
        max={max_dist?.maximum}
        step="0.01"
        value={currentValue?.maximum_distance ?? max_dist?.default}
        onChange={(e) => {
          if (onChange)
            onChange({
              maximum_distance: !Number.isNaN(parseFloat(e.currentTarget.value))
                ? parseFloat(e.currentTarget.value)
                : e.currentTarget.value,
            });
        }}
      />
    </>
  );
};
