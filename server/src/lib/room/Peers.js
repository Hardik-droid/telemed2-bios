'use strict';
const {Logger}=require('../../config');
const SocketTransport=require('../transports/SocketTransport');
const Peer=require('./Peer');
const EventEmitter=require('events').EventEmitter;
class Peers extends EventEmitter{
  constructor(){super();this.setMaxListeners(Infinity);this._closed=false;this._peers=new Map();}
  get closed(){return this._closed;}
  get peers(){return Array.from(this._peers.values());}
  get count(){return this._peers.size;}
  hasPeer(id){return this._peers.has(id);}
  getPeer(id){return this._peers.get(id);}
  close(){
    if(this._closed)return;
    this._closed=true;
    for(const peer of this._peers.values())peer.close();
    this.emit('close');
  }
  createPeer(peerId,socket){
    if(!socket)throw new TypeError('no socket given');
    if(typeof peerId!=='string'||!peerId){if(socket.disconnect)socket.disconnect();throw new TypeError('peerId must be string');}
    if(this._peers.has(peerId)){this._peers.get(peerId).close();}
    const st=new SocketTransport(socket);
    const peer=new Peer(peerId,st);
    this._peers.set(peer.id,peer);
    peer.on('close',()=>this._peers.delete(peerId));
    return peer;
  }
}
module.exports=Peers;