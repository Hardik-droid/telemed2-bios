'use strict';

const { Logger } = require('../../config');
const logger = new Logger('Peer');
const EventEmitter = require('events').EventEmitter;

class Peer extends EventEmitter {
  constructor(peerId, transport) {
    super();
    this.setMaxListeners(Infinity);
    this._closed = false;
    this._id = peerId;
    this._transport = transport;
    this._data = {};
    this._connected = true;
    this._joinedAt = Date.now();
    this._handleTransport();
  }
  get id() { return this._id; }
  get connected() { return this._connected; }
  get closed() { return this._closed; }
  get data() { return this._data; }
  get joinedAt() { return this._joinedAt; }
  set data(data) { this._data = data; }
  send(msg) { if (this._closed) return; this._transport.send(msg); }
  close(code, reason) {
    if (this._closed) return;
    this._closed = true;
    this._transport.close(code, reason);
    this.emit('close');
  }
  _handleTransport() {
    if (this._transport.closed) { this._closed = true; setImmediate(() => this.emit('close')); return; }
    this._transport.on('close', () => { if (this._closed) return; this._closed = true; this.emit('close'); });
    this._transport.on('disconnect', () => { if (this._closed) return; this._connected = false; this.emit('disconnect'); });
    this._transport.on('reconnected', () => { if (this._closed) return; this._connected = true; this.emit('reconnected'); });
    this._transport.on('message', (message) => this._handleRequest(message));
  }
  _handleRequest(message) {
    try { this.emit('message', message); } catch(e) { logger.error('error:%O', e); }
  }
}

module.exports = Peer;