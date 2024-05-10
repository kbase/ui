import { JSONRPC20Error } from '../../../common/api/utils/kbaseBaseQuery';

export function jsonRPC20_ResultResponse(id: string, result: unknown) {
  return {
    body: JSON.stringify({
      jsonrpc: '2.0',
      id,
      result,
    }),
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  };
}

export function jsonRPC20_ErrorResponse(id: string, error: JSONRPC20Error) {
  return {
    body: JSON.stringify({
      jsonrpc: '2.0',
      id,
      error,
    }),
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rest_response(result: any, status = 200) {
  return {
    body: JSON.stringify(result),
    status,
    headers: {
      'content-type': 'application/json',
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockIsLinked(body: any) {
  const username = body['params']['username'];

  const result = (() => {
    switch (username) {
      case 'foo':
        return true;
      case 'bar':
        return false;
      default:
        throw new Error('Invalid test value for username');
    }
  })();
  return jsonRPC20_ResultResponse(body['id'], result);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockIsLinked_not(body: any) {
  return jsonRPC20_ResultResponse(body['id'], false);
}
