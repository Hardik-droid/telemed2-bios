'use strict';
const {Logger,show}=require('../config');
const logger=new Logger('socketServer');
const {Cignal}=require('./room');
const {AwaitQueue}=require('awaitqueue');
const queue=new AwaitQueue();
const store=new Map();

const initSocketServer=(io)=>{
  io.on('connection',(socket)=>{
    const {roomId,peerId,peerName,role}=socket.handshake.query;
    logger.info('Client connected [socketId:%s, roomId:%s, peerId:%s]',socket.id,roomId,peerId);
    if(!roomId||!peerId){
      socket.send(JSON.stringify({type:'error',reason:'roomId and peerId are required.'}));
      socket.disconnect();
      return;
    }
    queue.push(async()=>{
      const room=await getOrCreate({roomId});
      room.handleSocketConnection({peerId,peerName:peerName||peerId,socket,role:role||'patient'});
    }).catch((e)=>{logger.error('Room join failed:%o',e);show.error('Room join failed: '+e.message);});
  });
};

async function getOrCreate({roomId}){
  let room=store.get(roomId);
  if(!room){
    room=await Cignal.create({roomId});
    store.set(roomId,room);
    room.on('close',()=>{store.delete(roomId);logger.info('Room closed [roomId:%s]',roomId);});
  }
  return room;
}

function totalRoomsRunning(){return store.size;}
function allRooms(){return Array.from(store.values());}
module.exports={initSocketServer,totalRoomsRunning,allRooms};