'use strict';
const {Logger,iceServers}=require('../../config');
const logger=new Logger('Room');
const Peers=require('./Peers');
const EventEmitter=require('events').EventEmitter;
const config=require('../../config/services/config');

class Cignal extends EventEmitter{
  static async create({roomId}){
    logger.info('create() [roomId:%s]',roomId);
    return new Cignal({roomId,roomParticipants:new Peers()});
  }
  constructor({roomId,roomParticipants}){
    super();
    this.setMaxListeners(Infinity);
    this._roomId=roomId;
    this._participants=roomParticipants;
    this._closed=false;
    this._createdAt=Date.now();
  }
  get roomId(){return this._roomId;}
  get peerCount(){return this._participants.count;}

  handleSocketConnection({peerId,peerName,socket,role}){
    const maxPeers=config.maxPeersPerRoom||10;
    if(this._participants.count>=maxPeers){
      try{socket.send(JSON.stringify({type:'error',reason:'Room is full.'}));socket.disconnect();}catch(e){}
      return;
    }
    let peer;
    try{
      peer=this._participants.createPeer(peerId,socket);
      peer.data.displayName=peerName||peerId;
      peer.data.role=role||'patient';
    }catch(err){
      logger.error('createPeer() failed:%o',err);
      try{socket.send(JSON.stringify({type:'error',reason:'Failed to create peer.'}));}catch(e){}
      return;
    }
    const existing=this._participants.peers.filter((p)=>p.id!==peerId);
    peer.send({type:'roomState',peers:existing.map((p)=>({peerId:p.id,displayName:p.data.displayName,role:p.data.role}))});
    for(const other of existing) other.send({type:'peerJoined',peerId:peer.id,displayName:peer.data.displayName,role:peer.data.role});
    peer.on('message',(msg)=>this._handleSocketRequest(peer,msg).catch((e)=>logger.error('request failed:%o',e)));
    peer.on('close',()=>{
      if(this._closed)return;
      if(this._participants.count===0){this._close();return;}
      for(const other of this._participants.peers) other.send({type:'peerLeft',peerId:peer.id});
    });
  }

  async _handleSocketRequest(peer,data){
    switch(data.type){
      case 'offer':{const t=this._participants.getPeer(data.peer);if(t&&t.connected)t.send({type:'offer',offer:data.offer,peer:peer.id,name:peer.data.displayName,iceServers});else peer.send(this._notifyError('Target unavailable.'));break;}
      case 'answer':{const t=this._participants.getPeer(data.peer);if(t&&t.connected)t.send({type:'answer',answer:data.answer,peer:peer.id});else peer.send(this._notifyError('Target unavailable.'));break;}
      case 'candidate':{const t=this._participants.getPeer(data.peer);if(t&&t.connected)t.send({type:'candidate',candidate:data.candidate,peer:peer.id});else peer.send(this._notifyError('Target unavailable.'));break;}
      case 'leave':{const t=this._participants.getPeer(data.peer);if(t&&t.connected)t.send({type:'leave',peer:peer.id});break;}
      case 'information':{const t=this._participants.getPeer(data.peer);if(t&&t.connected)t.send(data);else peer.send(this._notifyError('Target unavailable.'));break;}
      case 'chat':{
        for(const other of this._participants.peers){
          if(other.id!==peer.id) other.send({type:'chat',from:peer.id,fromName:peer.data.displayName,message:data.message,timestamp:Date.now()});
        }
        break;
      }
      case 'mediaState':{
        for(const other of this._participants.peers){
          if(other.id!==peer.id) other.send({type:'mediaState',peer:peer.id,audio:data.audio,video:data.video});
        }
        break;
      }
      default:logger.warn('Unknown message type:%s',data.type);
    }
  }

  _notifyError(message){return {type:'notify',notification:{type:'error',message}};}
  _close(){this._closed=true;this._participants.close();this.emit('close');}
}

module.exports=Cignal;