/**
 * Since messages are by definition "un-typed" in the sense of TypeScript static types,
 * it is not a bad idea to validate the messages as they arrive.
 *
 * Although the usage of channels makes it very unlikely that external messages will
 * ever be received, there is still room for developer error!  And since messages are
 * exchanged between differen web apps (Europa, kbase-ui), it is also not out of the
 * real of possibility that a malformed message will be received.
 *
 * There should be type assertion support for every received messages. Outgoing messages
 * do not need assertions as they are internally derived and are fully covered by the TS
 * type system.
 *
 * For every covered message, there should be:
 * - a TS type definition for the message
 * - a jsonschema for the type
 * - an assertion function for the type
 *
 * Each assertion function utilizes the associated json schema to validate incoming
 * data. TS assertion functions throw in the case of an invalid value.
 *
 */

import AJV from 'ajv';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema';

/**
 * A navigation path represents a route in either kbase-ui, europa, or any kbase ui.
 * There are various types below to implement this. This is also implemented in
 * kbase-ui.
 *
 * TODO: verify that this is indeed needed here.
 */

export type NavigationType = 'kbaseui' | 'europaui';

export interface NavigationPathBase {
  params?: Record<string, string>;
  newWindow?: boolean;
  path: string;
  type: NavigationType;
}

export interface NavigationPathKBaseUI extends NavigationPathBase {
  type: 'kbaseui';
}

export interface NavigationPathEuropa extends NavigationPathBase {
  type: 'europaui';
}

export type NavigationPath = NavigationPathKBaseUI | NavigationPathEuropa;

export interface NextRequestObject {
  path: NavigationPath;
  label?: string;
}

export interface NextRequest {
  path: string;
  params?: Record<string, string>;
}

/**
 * Payload definitions
 *
 * These assist in correctly coding these payloads, although at present there is
 * not code to provide that sent or received messages adhere to them.
 *
 */

/**
 * Europa message payload definitions
 *
 * Europa message payload type enforcement should be through TypeScript.
 *
 */

export type EuropaConnectPayload = {};
/**
 * Payload for the `europa.authenticated` message
 */
export interface EuropaAuthenticatedPayload {
  token: string;
  navigation?: NextRequest;
}

export interface EuropaAuthnavigatePayload {
  token: string | null;
  navigation?: NextRequest;
}

/**
 * Payload for the `europa.deauthenticated` message.
 */
export interface EuropaDeauthenticatedPayload {
  navigation?: NextRequest;
}
/**
 * Payload `europa.start` message.
 */
export interface EuropaNavigatePayload {
  path: string;
  params?: Record<string, string>;
}

/** Messages received from kbase-ui */

/**
 * Payload for `kbase-ui.connect` message
 */
export interface KBaseUIConnectPayload {
  channel: string;
}
const KBASE_UI_CONNECT_PAYLOAD_SCHEMA: SomeJSONSchema = {
  type: 'object',
  required: ['channel'],
  additionalProperties: false,
  properties: {
    channel: { type: 'string' },
  },
};
export function assertKBaseUIConnectPayload(
  payload: unknown
): asserts payload is KBaseUIConnectPayload {
  const validate = new AJV().compile(KBASE_UI_CONNECT_PAYLOAD_SCHEMA);
  const isValid = validate(payload);
  if (!isValid) {
    throw new Error('connect payload is not valid');
  }
}

/**
 * Payload for `kbase-ui.connected` message
 */
export interface KBaseUIConnectedPayload {
  channel: string;
}
const KBASE_UI_CONNECTED_PAYLOAD_SCHEMA: SomeJSONSchema = {
  type: 'object',
  required: [],
  additionalProperties: false,
  properties: {},
};
export function assertKBaseUIConnectedPayload(
  payload: unknown
): asserts payload is KBaseUIConnectedPayload {
  const validate = new AJV().compile(KBASE_UI_CONNECTED_PAYLOAD_SCHEMA);
  const isValid = validate(payload);
  if (!isValid) {
    throw new Error('connected payload is not valid');
  }
}

/**
 * Payload for `kbase-ui.set-title`
 */
export interface KBaseUISetTitlePayload {
  title: string;
}
const KBASE_UI_SET_TITLE_PAYLOAD_SCHEMA: SomeJSONSchema = {
  type: 'object',
  required: ['title'],
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
  },
};
export function assertKBaseUISetTitlePayload(
  payload: unknown
): asserts payload is KBaseUISetTitlePayload {
  const validate = new AJV().compile(KBASE_UI_SET_TITLE_PAYLOAD_SCHEMA);
  const isValid = validate(payload);
  if (!isValid) {
    throw new Error('set-title payload is not a valid');
  }
}

/**
 * Payload for `kbase-ui.loggedin`
 */
export interface KBaseUILoggedinPayload {
  token: string;
  expires: number;
  nextRequest?: NextRequestObject;
}

const KBASE_UI_LOGGEDIN_PAYLOAD_SCHEMA: SomeJSONSchema = {
  type: 'object',
  required: ['token', 'expires'],
  additionalProperties: false,
  properties: {
    token: { type: 'string' },
    expires: { type: 'integer' },
    nextRequest: {
      type: 'object',
      required: ['path'],
      additionalProperties: false,
      properties: {
        path: {
          type: 'object',
          required: ['type', 'path'],
          additionalProperties: false,
          properties: {
            type: { type: 'string' },
            path: { type: 'string' },
            params: {
              // this is how one can model Record<string, string>
              type: 'object',
              required: [],
              additionalProperties: {
                type: 'string',
              },
            },
            newWIndow: { type: 'boolean' },
          },
        },
        label: { type: 'string' },
      },
    },
  },
};
export function assertKBaseUILoggedinPayload(
  payload: unknown
): asserts payload is KBaseUILoggedinPayload {
  const validate = new AJV().compile(KBASE_UI_LOGGEDIN_PAYLOAD_SCHEMA);
  const isValid = validate(payload);
  if (!isValid) {
    throw new Error('setTitle Payload is not a valid');
  }
}

/**
 * Payload for `kbase-ui.navigated` message
 */
export interface KBaseUINavigatedPayload {
  path: string;
  params: Record<string, string>;
  type?: 'kbaseui' | 'europaui';
}
const KBASE_UI_NAVIGATED_PAYLOAD_SCHEMA: SomeJSONSchema = {
  type: 'object',
  required: ['path', 'params'],
  additionalProperties: false,
  properties: {
    path: { type: 'string' },
    params: {
      type: 'object',
      required: [],
      additionalProperties: {
        type: 'string',
      },
    },
    type: {
      type: 'string',
      enum: ['kbaseui', 'europaui'],
    },
  },
};
export function assertKBaseUINavigatedPayload(
  payload: unknown
): asserts payload is KBaseUINavigatedPayload {
  const validate = new AJV().compile(KBASE_UI_NAVIGATED_PAYLOAD_SCHEMA);
  const isValid = validate(payload);
  if (!isValid) {
    throw new Error('navigation payload is not valid');
  }
}

/**
 * Payload for `kbase-ui.redirect` message
 */
export interface KBaseUIRedirectPayload {
  url: string;
}
const KBASE_UI_REDIRECT_PAYLOAD_SCHEMA: SomeJSONSchema = {
  type: 'object',
  required: ['url'],
  additionalProperties: false,
  properties: {
    url: { type: 'string' },
  },
};
export function assertKBaseUIRedirectPayload(
  payload: unknown
): asserts payload is KBaseUIRedirectPayload {
  const validate = new AJV().compile(KBASE_UI_REDIRECT_PAYLOAD_SCHEMA);
  const isValid = validate(payload);
  if (!isValid) {
    throw new Error('redirect payload is not valid');
  }
}
