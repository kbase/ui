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
  };
  const ParamView =
    ParamViews[
      Object.keys(ParamViews).includes(props.params.title ?? unknown)
        ? (props.params.title as keyof typeof ParamViews)
        : unknown
    ];
  return <ParamView {...props} />;
};

const UnknownParams = ({
  params,
}: ComponentProps<typeof MatcherUserParams>) => {
  return <div>Missing User Parameter Implementation for {params.title}</div>;
};

const GTDBLineageMatcherUserParameters = ({
  params,
  value,
  onChange,
  errors,
}: ComponentProps<typeof MatcherUserParams>) => {
  const formErr = () => {
    throw new TypeError(`${params.title} data has unexpected shape.`);
  };
  if (!Object.keys(params?.definitions?.['GTDBRank'] ?? {}).includes('enum')) {
    formErr();
  }
  const definition = params?.definitions?.['GTDBRank'] as { enum: string[] };
  const property = params?.['properties']?.['gtdb_rank'];
  let description = '';
  if (typeof property === 'boolean') {
    formErr();
  } else {
    description = property?.['description'] ?? '';
  }

  const currentValue = value ? (value as { gtdb_rank: string }) : undefined;

  const id = useId();

  return (
    <>
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
      {value && errors ? (
        errors.map((err) => (
          <label htmlFor={id}>
            {err.instancePath}: {err.message}
            <br />
            <code>{JSON.stringify(err.params)}</code>
          </label>
        ))
      ) : (
        <></>
      )}
    </>
  );
};
