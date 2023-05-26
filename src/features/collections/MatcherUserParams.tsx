import { ComponentProps, useCallback, useEffect, useId, useState } from 'react';
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

  const [currentValue, setCurrentValue] = useState<
    Record<string, unknown> | undefined
  >(undefined);
  const setIfChanged = useCallback(
    (value: Record<string, unknown>) =>
      setCurrentValue((currentValue) =>
        JSON.stringify(currentValue) !== JSON.stringify(value)
          ? value
          : currentValue
      ),
    [setCurrentValue]
  );
  useEffect(
    () => (value ? setIfChanged(value) : undefined),
    [setIfChanged, value]
  );
  useEffect(
    () => (onChange ? onChange(currentValue) : undefined),
    [onChange, currentValue]
  );

  const id = useId();

  const currentSelection = currentValue
    ? (currentValue as { gtdb_rank: string })['gtdb_rank']
    : undefined;
  return (
    <>
      <label htmlFor={id}>{description}</label>
      <Select
        id={id}
        value={
          currentSelection
            ? { value: currentSelection, label: currentSelection }
            : undefined
        }
        options={definition.enum.map((rank) => ({ value: rank, label: rank }))}
        onChange={(opts) => setIfChanged({ gtdb_rank: String(opts[0].value) })}
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
