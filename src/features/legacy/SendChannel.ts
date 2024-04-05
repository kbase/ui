/**
 * A class that captures a specific use case of sending a window message from one window
 * to another.
 *
 * It is designed to be used with a paired `ReceiveChannel`. This is where it is really
 * useful, as both `SendChannel` and `ReceiveChannel` enforce the same message data
 * structure.
 *
 * The "channel" concept is that by using a specific data structure whose `envelope`
 * contains a mandatory channel id, all window message communication is constrained to a
 * matching partner channel. In other words, given that the window message api is open
 * to any javascript running in the client, or even browser plugins, this technique
 * ensures that only a subset, or "channel", is even considered by the recipient channel.
 *
 * Beyond the plain `postMessage`, it offers these advantages:
 * - object captures information that doesn't change between message sends, making
 *   message send api more concise
 * - automatic channeling of messages to the intended target receive channel
 * - optional "spy" to all a callback for every message send; useful for debugging.
 *
 * Message structure:
 * - name: message name
 *    - a string; expresses the identity of the message or event; must be matched by a
 *      listener on the receiver channel
 * - payload: message data
 *    - arbitrary JSON data
 * - envelope: message metadata:
 *   - channel: target channel
 *   - id: unique identifier for the message (useful for debugging)
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a random or pseudo-random string identifier.
 *
 * @returns {string}
 */
function uniqueId() {
  return uuidv4();
}

export interface MessageEnvelope {
  /** The id of the channel for which this message is intended. */
  channel: string;

  /** The id of the message itself */
  id: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MessagePayload {}

export interface ChannelMessageConstructorParams {
  name: string;
  payload: unknown;
  envelope: MessageEnvelope;
}

/**
 * Represents a message in a channel.
 *
 */
export class ChannelMessage {
  /**
   *
   * @param {ChannelMessageConstructorParams} param0 The constructor parameters in
   * object clothing
   */
  name: string;
  payload: unknown;
  envelope: MessageEnvelope;
  constructor({ name, payload, envelope }: ChannelMessageConstructorParams) {
    this.name = name;
    this.payload = payload;
    this.envelope = envelope;
  }

  toJSON() {
    const { envelope, name, payload } = this;
    return { envelope, name, payload };
  }
}

/**
 * The parameter structure for SendChannel's constructor.
 *
 * Follows the named-prameters pattern.
 */
export interface SendChannelConstructorParams {
  /** The window to which to send messages */
  window: Window;

  /** The URL origin of the window to which we are sending messages */
  targetOrigin: string;

  /** The id assigned to this channel */
  channel: string;

  /** Spy on sent messages; useful for debugging */
  spy?: (message: ChannelMessage) => void;
}

/**
 * Supports targeted window message sending.
 *
 */
export default class SendChannel {
  /** The window to which to send messages */
  window: Window;

  /** The URL origin of the window to which we are sending messages */
  targetOrigin: string;

  /** The id assigned to this channel */
  channel: string;

  /** Spy on sent messages; useful for debugging */
  spy?: (message: ChannelMessage) => void;

  constructor({
    window,
    targetOrigin,
    channel,
    spy,
  }: SendChannelConstructorParams) {
    this.window = window;
    this.targetOrigin = targetOrigin;
    this.channel = channel;
    this.spy = spy;
  }

  setChannelId(channel: string) {
    this.channel = channel;
  }

  /**
   * Sends a message to the configured window.
   *
   * @param {string} name
   * @param {T} payload
   */
  send<T>(name: string, payload: T): ChannelMessage {
    const envelope: MessageEnvelope = {
      channel: this.channel,
      id: uniqueId(),
    };
    const message = new ChannelMessage({ name, payload, envelope });
    this.window.postMessage(message.toJSON(), this.targetOrigin);

    if (this.spy) {
      try {
        this.spy(message);
      } catch (ex) {
        const errorMessage = ex instanceof Error ? ex.message : 'Unknown error';
        // eslint-disable-next-line no-console
        console.error('Error running spy', errorMessage, ex);
      }
    }

    return message;
  }
}
