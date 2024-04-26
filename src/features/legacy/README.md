# Legacy UI Support - aka kbase-ui embedding

> This documentation is quite out of date; I'll be updating it soon.

The venerable `kbase-ui` web app is supported in Europa through iframe
embedding. The embedding approach is similar to that used in kbase-ui to host
plugins for the nearly a decade, so it is a fairly reliable and well-trod path.

Within Europa, kbase-ui is referred to as "legacy", although within the kbase-ui
codebase this term is not used.

Generally, the integration is based on:

*   invoking kbase-ui in an iframe, whose `src` attribute references a service
    endpoint for kbase-ui

*   a window message (via the window `postMessage` api and the Window `message`
    event) protocol for safely starting kbase-ui

*   hosting kbase-ui routes under the url pathname prefix `/legacy`.

## URL format

There are two types of URLS involved in invoking a kbase-ui feature - the public
facing urls, and the internal url for iframe integration.

The public facing urls may be either the "kbase-ui classic" or "legacy".
kbase-ui classic urls have no pathname, use the url fragment identifier, or
"hash", to embody both routing path within kbase-ui and any parameters, and may
use the url query component, or "search params".

For example

```url
https://ci.kbase.us#about
```

would invoke the About view within kbase-ui, or

```url
https://ci.kbase.us#account?tab=links
```

would invoke the Account Manager with the "links" tab selected, with an
alternative form of

```url
https://ci.kbase.us?tab=links#account
```

Europa recognizes such classic kbase-ui links and converts them into "legacy"
paths.

The legacy path is of form

```url
https://ci.kbase.us/legacy/my/path$param1=value1&param2=value2
```

where

* `/legacy/` prefixes the kbase-ui hash path
* `$` optionally denotes that parameters follow
* parameters are encoded as a query component

### URL Rewriting

The Europa routing support recognizes the presence of a fragment identifier on
the root path `/`. This matches a url with either the root pathname `/` or no
pathname at all. If there is no fragment identifier, the `/narratives` Narrative
Navigator is invoked. Otherwise, the fragment identifier and query component are
processed, transformed into a legacy path, and re-issued as a redirect.

### Whitelisted URL Query Parameters

Europa filters query component fields by name. The `paramsSlice.ts` module
contains support for a whiltelist of all allowable field names. If a field name
is not present in this whitelist, a url employing a query component with this
field name will be ignored, resulting in the default url (`/narratives`) being
invoked.

This is clearly an undesirable outcome! However, the likelihood of getting into
this pickle is low. Although supported, `kbase-ui` and it's plugins do not use
this form of url (i.e. a query component), although it is unknown of there are
any extant usages in other codebases. The workaround is simple - either append
the query component to the fragment identifier or to the legacy path.

### Legacy Component

## Europa Elements Support kbase-ui

* url path prefix of `/legacy`
* ui elements to navigate to kbase-ui endpoints
* support for a special url format for kbase-ui under Europa
* support for the kbase-ui integration window messaging protocol

## kbase-ui elements to support embedding in Euoropa

## Mounting kbase-ui

1.  Europa receives a URL whose pathname is either /legacy/\* or contains a hash
    (fragment identifier).

2.  Europa mounts the Legacy component

3.  The legacy component...

> TODO

## Communication between Europa and kbase-ui

## State Model

The mechanism for loading kbase-ui in the Legacy component utilizes a state
machine that operates through a sequence of `useEffect` statements. The state
machine represents the various stages of loading kbase-ui, which are
communicated to the Legacy component via window messages.

The states are:

* `NONE` - initial state; set up for listening to kbase-ui
* `READY_WAITING` - waiting for receipt of `kbase-ui.ready` message
* `READY` - kbase-ui has sent the `kbase-ui.ready` message; and is presumably
    setting up
* `STARTED_WAITING` - waiting for receipt of the `kbase-ui.started` message
* `STARTED` - the started message has been received, meaning kbase-ui is up and
  running
* `SUCCESS` - the legacy component has finished setting up

### `NONE`: initial state

In the initial NONE state, the receive channel is set up, and a timeout monitor
started, as we are now waiting for the `kbase-ui.ready` message to be received.

After setup, transitions to next state `READY_WAITING`

### `READY_WAITING`: wait for ready message

In this state we set up a handler for the `kbase-ui.ready` state

### `READY`: kbase-ui is ready and setting up

### \`
