// =====================================================================
// MyHealth Telemedicine — Client Application v3.1
// No IIFE — all window.* functions are truly global for onclick handlers
// =====================================================================

// ── Translations ──────────────────────────────────────────────────────
var APP_TRANSLATIONS = {
  en: {
    selectLanguage: 'Select your language', systemOnline: 'System Online',
    welcomeUser: 'Welcome Back', touchSensor: 'Touch the sensor or use Face ID',
    authenticate: 'Authenticate', howCanWeHelp: 'How can we help you today?',
    sos: 'SOS Emergency', recordSymptoms: 'Record Symptoms',
    videoCall: 'Video Consultation', healthRecords: 'Health Records',
    measureBP: 'Measure BP', sugarTest: 'Sugar Test',
    liveTranscription: 'Voice Transcription', startListening: 'Start',
    stop: 'Stop', copyText: 'Copy', saveToRecords: 'Save',
    videoConsultation: 'Video Consultation',
  },
  hi: {
    selectLanguage: 'अपनी भाषा चुनें', systemOnline: 'सिस्टम ऑनलाइन',
    welcomeUser: 'वापस स्वागत है', touchSensor: 'सेंसर छुएं या फेस आईडी का उपयोग करें',
    authenticate: 'प्रमाणित करें', howCanWeHelp: 'आज हम आपकी कैसे मदद कर सकते हैं?',
    sos: 'आपातकालीन SOS', recordSymptoms: 'लक्षण रिकॉर्ड करें',
    videoCall: 'वीडियो परामर्श', healthRecords: 'स्वास्थ्य रिकॉर्ड',
    measureBP: 'बीपी मापें', sugarTest: 'शुगर टेस्ट',
    liveTranscription: 'लाइव ट्रांसक्रिप्शन', startListening: 'शुरू करें',
    stop: 'रुकें', copyText: 'कॉपी करें', saveToRecords: 'सेव करें',
    videoConsultation: 'वीडियो परामर्श',
  },
  pa: {
    selectLanguage: 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ', systemOnline: 'ਸਿਸਟਮ ਆਨਲਾਈਨ',
    welcomeUser: 'ਵਾਪਸ ਸਵਾਗਤ ਹੈ', touchSensor: 'ਸੈਂਸਰ ਛੂਓ ਜਾਂ ਫੇਸ ਆਈਡੀ ਵਰਤੋ',
    authenticate: 'ਪ੍ਰਮਾਣਿਤ ਕਰੋ', howCanWeHelp: 'ਅਸੀਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੇ ਹਾਂ?',
    sos: 'SOS ਐਮਰਜੈਂਸੀ', recordSymptoms: 'ਲੱਛਣ ਰਿਕਾਰਡ ਕਰੋ',
    videoCall: 'ਵੀਡੀਓ ਸਲਾਹ', healthRecords: 'ਸਿਹਤ ਰਿਕਾਰਡ',
    measureBP: 'ਬੀਪੀ ਮਾਪੋ', sugarTest: 'ਸ਼ੂਗਰ ਟੈਸਟ',
    liveTranscription: 'ਲਾਈਵ ਟ੍ਰਾਂਸਕ੍ਰਿਪਸ਼ਨ', startListening: 'ਸ਼ੁਰੂ ਕਰੋ',
    stop: 'ਰੋਕੋ', copyText: 'ਕਾਪੀ ਕਰੋ', saveToRecords: 'ਸੇਵ ਕਰੋ',
    videoConsultation: 'ਵੀਡੀਓ ਸਲਾਹ',
  },
};

// ── Helpers ────────────────────────────────────────────────────────────
function _$(id) { return document.getElementById(id); }

function _escHtml(str) {
  if (!str) return '';
  var d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

window._t = function (key) {
  var lang = localStorage.getItem('lang') || 'en';
  return (APP_TRANSLATIONS[lang] && APP_TRANSLATIONS[lang][key]) || APP_TRANSLATIONS.en[key] || key;
};

function _applyTranslations() {
  document.querySelectorAll('[data-t]').forEach(function (el) {
    el.textContent = window._t(el.getAttribute('data-t'));
  });
  var lang = localStorage.getItem('lang') || 'en';
  document.documentElement.lang = lang;
  document.body.classList.remove('en', 'hi', 'pa');
  document.body.classList.add(lang);
}

function _showScreen(id) {
  document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
  var el = _$(id);
  if (el) el.classList.add('active');
}

function _toast(message, type, duration) {
  type = type || 'info';
  duration = duration || 3500;
  var container = _$('toast-container');
  if (!container) return;
  var el = document.createElement('div');
  el.className = 'toast ' + type;
  var icon = document.createElement('i');
  var icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  icon.className = 'fas ' + (icons[type] || 'fa-info-circle') + ' mr-2';
  el.appendChild(icon);
  el.appendChild(document.createTextNode(message));
  container.appendChild(el);
  requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('show'); }); });
  setTimeout(function () {
    el.classList.remove('show');
    setTimeout(function () { el.remove(); }, 300);
  }, duration);
}

// ── SOS Emergency ─────────────────────────────────────────────────────
var _sosTimer = null;
var _sosValue = 5;

function triggerSOS() {
  _$('modalSOS').classList.remove('hidden');
  _sosValue = 5;
  _$('sosCountdown').textContent = '5';
  _$('sosCountdown').style.color = '#ef4444';
  _$('sosDispatchMsg').textContent = 'Locating nearest unit...';
  clearInterval(_sosTimer);
  _sosTimer = setInterval(function () {
    _sosValue--;
    _$('sosCountdown').textContent = String(_sosValue);
    if (_sosValue <= 0) {
      clearInterval(_sosTimer);
      _$('sosCountdown').textContent = '0';
      _$('sosCountdown').style.color = '#10b981';
      _$('sosDispatchMsg').textContent = 'Ambulance Dispatched!';
      _$('sosDispatchMsg').className = 'text-emerald-600 font-semibold text-lg';
      _toast('Ambulance dispatched! ETA 8-15 minutes.', 'success', 6000);
    }
  }, 1000);
}

function closeSOS() {
  clearInterval(_sosTimer);
  _$('modalSOS').classList.add('hidden');
}

// ── Voice Transcription ───────────────────────────────────────────────
var _finalTranscript = '';
var _isListening = false;
var _SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
var _recognition = _SpeechRec ? new _SpeechRec() : null;

if (_recognition) {
  _recognition.continuous = true;
  _recognition.interimResults = true;
  _recognition.onresult = function (e) {
    var interim = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      var text = e.results[i][0].transcript;
      if (e.results[i].isFinal) _finalTranscript += text + '.\n';
      else interim += text;
    }
    var out = _$('transcriptOutput');
    if (out) out.textContent = _finalTranscript + interim;
  };
  _recognition.onstart = function () {
    var vs = _$('voiceStatus'); if (vs) { vs.textContent = 'Listening...'; vs.className = 'text-center text-sm font-medium text-emerald-600'; }
    var sb = _$('startButton'); if (sb) sb.disabled = true;
    var stb = _$('stopButton'); if (stb) stb.disabled = false;
  };
  _recognition.onend = function () {
    if (_isListening) { setTimeout(function () { try { _recognition.start(); } catch(x){} }, 200); return; }
    var vs = _$('voiceStatus'); if (vs) { vs.textContent = 'Stopped.'; vs.className = 'text-center text-sm font-medium text-gray-500'; }
    var sb = _$('startButton'); if (sb) sb.disabled = false;
    var stb = _$('stopButton'); if (stb) stb.disabled = true;
  };
  _recognition.onerror = function (e) {
    var vs = _$('voiceStatus'); if (vs) vs.textContent = 'Error: ' + e.error;
    _isListening = false;
    var sb = _$('startButton'); if (sb) sb.disabled = false;
    var stb = _$('stopButton'); if (stb) stb.disabled = true;
  };
}

function startRecognition() {
  if (!_recognition) { _toast('Speech recognition not supported in this browser.', 'error'); return; }
  var lang = localStorage.getItem('lang');
  _recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'pa' ? 'pa-IN' : 'en-US';
  _finalTranscript = '';
  _isListening = true;
  try { _recognition.start(); } catch(x) {}
}

function stopRecognition() {
  _isListening = false;
  if (_recognition) try { _recognition.stop(); } catch(x) {}
}

function openTranscriber() {
  _finalTranscript = '';
  var out = _$('transcriptOutput'); if (out) out.textContent = '';
  var ais = _$('aiSummarySection'); if (ais) ais.classList.add('hidden');
  _$('modalVoice').classList.remove('hidden');
  setTimeout(startRecognition, 400);
}

function closeTranscriber() {
  stopRecognition();
  _$('modalVoice').classList.add('hidden');
}

// ── AI Symptom Checker ────────────────────────────────────────────────
function openSymptomChecker() {
  _$('symptomInput').value = '';
  _$('symptomResult').classList.add('hidden');
  _$('symptomLoading').classList.add('hidden');
  _$('modalSymptom').classList.remove('hidden');
}

function closeSymptomChecker() {
  _$('modalSymptom').classList.add('hidden');
}

function analyseSymptoms() {
  var symptoms = (_$('symptomInput').value || '').trim();
  if (!symptoms || symptoms.length < 5) { _toast('Please describe your symptoms (at least 5 characters).', 'warning'); return; }
  var btn = _$('analyseBtn');
  btn.disabled = true;
  btn.textContent = 'Analysing...';
  _$('symptomResult').classList.add('hidden');
  _$('symptomLoading').classList.remove('hidden');

  fetch('/api/ai/symptoms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms: symptoms, lang: localStorage.getItem('lang') || 'en' }),
  })
    .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
    .then(function (result) {
      if (!result.ok) throw new Error(result.data.error || 'AI analysis failed');
      var data = result.data;
      _$('symptomLoading').classList.add('hidden');
      _$('urgencyBadge').textContent = (data.urgency || 'unknown').toUpperCase() + ' URGENCY';
      _$('urgencyBadge').style.background = data.urgencyColor || '#e2e8f0';
      _$('urgencyBadge').style.color = '#1f2937';
      _$('symptomSummary').textContent = data.summary || '';
      var recsEl = _$('symptomRecs');
      recsEl.textContent = '';
      (data.recommendations || []).forEach(function (r, i) {
        var row = document.createElement('div');
        row.className = 'flex items-start gap-2 bg-blue-50 rounded-lg p-2 text-sm';
        var num = document.createElement('span');
        num.className = 'bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0';
        num.textContent = String(i + 1);
        var txt = document.createElement('span');
        txt.textContent = r;
        row.appendChild(num);
        row.appendChild(txt);
        recsEl.appendChild(row);
      });
      if (data.seekEmergencyCare) _$('emergencyAlert').classList.remove('hidden');
      else _$('emergencyAlert').classList.add('hidden');
      _$('symptomDisclaimer').textContent = data.disclaimer || '';
      _$('symptomResult').classList.remove('hidden');
      _toast('AI analysis complete.', 'success');
    })
    .catch(function (err) {
      _$('symptomLoading').classList.add('hidden');
      _toast('AI analysis failed: ' + err.message, 'error');
    })
    .finally(function () {
      btn.disabled = false;
      btn.textContent = 'Analyse Symptoms';
    });
}

// ── AI Chat ───────────────────────────────────────────────────────────
var _aiChatHistory = [];

function showAIChat() {
  _$('modalAIChat').classList.remove('hidden');
  _$('aiChatInput').focus();
}

function closeAIChat() {
  _$('modalAIChat').classList.add('hidden');
}

function _appendChatBubble(side, text) {
  var container = _$('aiChatMessages');
  if (!container) return;
  var div = document.createElement('div');
  div.className = 'chat-msg ' + side;
  var bubble = document.createElement('div');
  bubble.className = side === 'me'
    ? 'bg-brand-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm'
    : 'bg-brand-100 text-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 text-sm';
  bubble.textContent = text;
  div.appendChild(bubble);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function sendAIChat() {
  var input = _$('aiChatInput');
  var msg = (input.value || '').trim();
  if (!msg) return;
  input.value = '';
  _appendChatBubble('me', msg);
  _aiChatHistory.push({ role: 'user', content: msg });

  // typing indicator
  var typingEl = document.createElement('div');
  typingEl.className = 'chat-msg them';
  typingEl.id = 'aiTyping';
  typingEl.textContent = '...';
  _$('aiChatMessages').appendChild(typingEl);

  fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: _aiChatHistory, lang: localStorage.getItem('lang') || 'en' }),
  })
    .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
    .then(function (result) {
      var typing = _$('aiTyping'); if (typing) typing.remove();
      if (!result.ok) throw new Error(result.data.error || 'AI chat failed');
      _aiChatHistory.push({ role: 'assistant', content: result.data.reply });
      _appendChatBubble('them', result.data.reply);
    })
    .catch(function (err) {
      var typing = _$('aiTyping'); if (typing) typing.remove();
      _appendChatBubble('them', 'Sorry, I could not process that request. Please try again.');
      _toast('AI chat error: ' + err.message, 'error');
    });
}

// ── WebRTC Video Call ─────────────────────────────────────────────────
var _ICE = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }];
var _socket = null;
var _localStream = null;
var _screenStream = null;
var _peerConns = {};
var _myPeerId = null;
var _myRoomId = null;
var _myRole = 'patient';
var _remoteIce = _ICE.slice();

function openVideoCallSetup() {
  _$('vcName').value = '';
  _$('vcRoom').value = '';
  _$('modalVideoSetup').classList.remove('hidden');
}

function closeVideoSetup() {
  _$('modalVideoSetup').classList.add('hidden');
}

function generateRoomId() {
  var a = ['quick','calm','bright','safe','care'];
  var n = ['consult','clinic','health','room','meet'];
  var num = Math.floor(Math.random() * 9000) + 1000;
  _$('vcRoom').value = a[Math.floor(Math.random()*a.length)] + '-' + n[Math.floor(Math.random()*n.length)] + '-' + num;
}

function startVideoCall() {
  var nameInput = (_$('vcName').value || '').trim();
  var roomInput = (_$('vcRoom').value || '').trim();
  _myRole = _$('vcRole').value;
  if (!nameInput) { _toast('Please enter your name.', 'warning'); return; }
  if (!roomInput) { _toast('Please enter a room ID.', 'warning'); return; }
  _myPeerId = nameInput + '-' + Math.random().toString(36).slice(2, 7);
  _myRoomId = roomInput;
  closeVideoSetup();
  _$('modalVideo').classList.remove('hidden');

  navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
    audio: { echoCancellation: true, noiseSuppression: true },
  }).then(function (stream) {
    _localStream = stream;
    _addVideoTile('local', stream, nameInput + ' (You)', true);
    _$('vcRoomBadge').textContent = 'Room: ' + roomInput;
    _$('shareRoomHint').textContent = 'Share Room ID: ' + roomInput;
    _connectSocket(_myPeerId, _myRoomId, nameInput, _myRole);
  }).catch(function (err) {
    _toast('Could not access camera/mic: ' + err.message, 'error');
  });
}

function _connectSocket(peerId, roomId, peerName, role) {
  if (_socket) { _socket.disconnect(); _socket = null; }
  _socket = io({
    query: { roomId: roomId, peerId: peerId, peerName: peerName, role: role },
    reconnection: true, reconnectionAttempts: 5, reconnectionDelay: 1000,
  });
  _socket.on('connect', function () {
    console.log('[SIGNAL] connected', _socket.id);
    _toast('Connected to signaling server.', 'success', 2000);
  });
  _socket.on('message', function (raw) {
    try {
      var data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      _handleMsg(data);
    } catch (e) { console.error('[SIGNAL] parse error', e); }
  });
  _socket.on('disconnect', function (reason) {
    console.log('[SIGNAL] disconnected', reason);
    _toast('Disconnected from signaling server.', 'warning');
  });
}

function _sendSig(msg) {
  if (_socket && _socket.connected) _socket.send(JSON.stringify(msg));
}

function _handleMsg(data) {
  switch (data.type) {
    case 'roomState':
      (data.peers || []).forEach(function (peer) {
        if (peer.peerId !== _myPeerId) {
          _toast((peer.displayName || 'Peer') + ' is in the room.', 'info', 3000);
          _initiateCall(peer.peerId);
        }
      });
      _updatePeerCount();
      break;
    case 'peerJoined':
      if (data.peerId !== _myPeerId) _toast((data.displayName || 'Peer') + ' joined.', 'info');
      _updatePeerCount();
      break;
    case 'offer':
      var fromId = data.peer;
      _toast((data.name || 'Peer') + ' is calling...', 'info');
      var pc1 = _getOrCreatePC(fromId);
      if (data.iceServers) _remoteIce = data.iceServers;
      pc1.setRemoteDescription(new RTCSessionDescription(data.offer))
        .then(function () {
          if (_localStream) _localStream.getTracks().forEach(function (t) { try { pc1.addTrack(t, _localStream); } catch(x){} });
          return pc1.createAnswer();
        })
        .then(function (ans) { return pc1.setLocalDescription(ans); })
        .then(function () { _sendSig({ type: 'answer', peer: fromId, answer: pc1.localDescription }); })
        .catch(function (e) { console.error('[WebRTC] offer err', e); });
      break;
    case 'answer':
      var pc2 = _peerConns[data.peer];
      if (pc2 && pc2.signalingState !== 'stable')
        pc2.setRemoteDescription(new RTCSessionDescription(data.answer)).catch(function(){});
      break;
    case 'candidate':
      var pc3 = _peerConns[data.peer];
      if (pc3 && data.candidate)
        pc3.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(function(){});
      break;
    case 'peerLeft':
      _removeVideoTile(data.peerId);
      if (_peerConns[data.peerId]) { _peerConns[data.peerId].close(); delete _peerConns[data.peerId]; }
      _toast('A peer left the room.', 'warning');
      _updatePeerCount();
      break;
    case 'chat':
      _appendRoomChat(data.fromName, data.message, false);
      break;
    case 'mediaState':
      var tile = _$('tile-' + data.peer);
      if (tile) { var ai = tile.querySelector('.audio-state'); if (ai) ai.textContent = data.audio ? '' : '🔇'; }
      break;
    case 'notify':
      _toast((data.notification && data.notification.message) || 'Server notification', 'warning');
      break;
    case 'error':
      _toast(data.reason || 'Server error', 'error');
      break;
  }
}

function _initiateCall(targetId) {
  var pc = _getOrCreatePC(targetId);
  if (_localStream) _localStream.getTracks().forEach(function (t) { try { pc.addTrack(t, _localStream); } catch(x){} });
  pc.createOffer()
    .then(function (offer) { return pc.setLocalDescription(offer); })
    .then(function () { _sendSig({ type: 'offer', peer: targetId, offer: pc.localDescription }); })
    .catch(function (e) { console.error('[WebRTC] offer err', e); });
}

function _getOrCreatePC(peerId) {
  if (_peerConns[peerId]) return _peerConns[peerId];
  var pc = new RTCPeerConnection({ iceServers: _remoteIce });
  _peerConns[peerId] = pc;
  pc.onicecandidate = function (ev) { if (ev.candidate) _sendSig({ type: 'candidate', peer: peerId, candidate: ev.candidate }); };
  pc.onconnectionstatechange = function () {
    if (pc.connectionState === 'failed') { _toast('Connection failed. Retrying...', 'error'); pc.restartIce(); }
  };
  pc.ontrack = function (ev) {
    var stream = ev.streams[0] || new MediaStream([ev.track]);
    _addVideoTile(peerId, stream, peerId, false);
    var wm = _$('waitingMessage'); if (wm) wm.style.display = 'none';
  };
  return pc;
}

function _addVideoTile(id, stream, label, isLocal) {
  var grid = _$('videoGrid'); if (!grid) return;
  var tile = _$('tile-' + id);
  if (!tile) {
    tile = document.createElement('div');
    tile.id = 'tile-' + id;
    tile.className = 'relative rounded-xl overflow-hidden bg-gray-800';
    var vid = document.createElement('video');
    vid.autoplay = true; vid.playsInline = true; vid.muted = isLocal; vid.className = 'w-full';
    var lbl = document.createElement('div');
    lbl.className = 'absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg';
    lbl.textContent = label;
    var as = document.createElement('span'); as.className = 'audio-state';
    tile.appendChild(vid); tile.appendChild(lbl); tile.appendChild(as);
    grid.appendChild(tile);
    var wm = _$('waitingMessage'); if (wm) wm.style.display = 'none';
  }
  var v = tile.querySelector('video'); if (v) v.srcObject = stream;
}

function _removeVideoTile(id) {
  var el = _$('tile-' + id); if (el) el.remove();
  if (Object.keys(_peerConns).length === 0) { var wm = _$('waitingMessage'); if (wm) wm.style.display = 'flex'; }
}

function _updatePeerCount() {
  var c = Object.keys(_peerConns).length;
  var el = _$('vcPeerCount');
  if (el) el.textContent = c + (c === 1 ? ' participant' : ' participants');
}

function toggleMic() {
  if (!_localStream) return;
  var track = _localStream.getAudioTracks()[0];
  if (track) {
    track.enabled = !track.enabled;
    _$('micIcon').className = track.enabled ? 'fas fa-microphone text-lg' : 'fas fa-microphone-slash text-lg text-red-400';
    _sendSig({ type: 'mediaState', audio: track.enabled, video: _localStream.getVideoTracks()[0] ? _localStream.getVideoTracks()[0].enabled : true });
  }
}

function toggleCamera() {
  if (!_localStream) return;
  var track = _localStream.getVideoTracks()[0];
  if (track) {
    track.enabled = !track.enabled;
    _$('camIcon').className = track.enabled ? 'fas fa-video text-lg' : 'fas fa-video-slash text-lg text-red-400';
    _sendSig({ type: 'mediaState', audio: _localStream.getAudioTracks()[0] ? _localStream.getAudioTracks()[0].enabled : true, video: track.enabled });
  }
}

function shareScreen() {
  if (_screenStream) {
    _screenStream.getTracks().forEach(function (t) { t.stop(); });
    _screenStream = null;
    _toast('Screen sharing stopped.', 'info');
    if (_localStream) {
      var vt = _localStream.getVideoTracks()[0];
      Object.values(_peerConns).forEach(function (pc) {
        var s = pc.getSenders().find(function (x) { return x.track && x.track.kind === 'video'; });
        if (s && vt) s.replaceTrack(vt);
      });
    }
    return;
  }
  navigator.mediaDevices.getDisplayMedia({ video: true }).then(function (stream) {
    _screenStream = stream;
    var st = stream.getVideoTracks()[0];
    Object.values(_peerConns).forEach(function (pc) {
      var s = pc.getSenders().find(function (x) { return x.track && x.track.kind === 'video'; });
      if (s) s.replaceTrack(st);
    });
    var lt = _$('tile-local'); if (lt) { var v = lt.querySelector('video'); if (v) v.srcObject = stream; }
    st.onended = function () { _screenStream = null; };
    _toast('Screen sharing started.', 'success');
  }).catch(function () { _toast('Screen share cancelled.', 'info'); });
}

function copyRoomLink() {
  var url = window.location.origin + '?roomId=' + encodeURIComponent(_myRoomId || '');
  navigator.clipboard.writeText(url).then(function () { _toast('Room link copied!', 'success'); });
}

function endCall() {
  Object.keys(_peerConns).forEach(function (id) { _sendSig({ type: 'leave', peer: id }); _peerConns[id].close(); });
  _peerConns = {};
  if (_localStream) { _localStream.getTracks().forEach(function (t) { t.stop(); }); _localStream = null; }
  if (_screenStream) { _screenStream.getTracks().forEach(function (t) { t.stop(); }); _screenStream = null; }
  if (_socket) { _socket.disconnect(); _socket = null; }
  var vg = _$('videoGrid'); if (vg) vg.textContent = '';
  var cm = _$('chatMessages'); if (cm) cm.textContent = '';
  var wm = _$('waitingMessage'); if (wm) wm.style.display = 'flex';
  _$('modalVideo').classList.add('hidden');
  _toast('Call ended.', 'info');
}

function toggleChat() {
  var panel = _$('chatPanel'); if (panel) panel.classList.toggle('hidden');
}

function sendChatMessage() {
  var input = _$('chatInput');
  var msg = (input.value || '').trim();
  if (!msg) return;
  input.value = '';
  _sendSig({ type: 'chat', message: msg });
  _appendRoomChat('You', msg, true);
}

function _appendRoomChat(from, text, isMe) {
  var container = _$('chatMessages'); if (!container) return;
  var div = document.createElement('div');
  div.className = 'text-xs ' + (isMe ? 'text-right' : 'text-left');
  var nameSpan = document.createElement('span');
  nameSpan.className = 'text-gray-400';
  nameSpan.textContent = from;
  var msgDiv = document.createElement('div');
  msgDiv.className = 'mt-0.5 inline-block max-w-full ' + (isMe ? 'bg-brand-700 text-white' : 'bg-gray-700 text-gray-200') + ' rounded-lg px-3 py-1.5';
  msgDiv.textContent = text;
  div.appendChild(nameSpan);
  div.appendChild(msgDiv);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  var panel = _$('chatPanel');
  if (panel && panel.classList.contains('hidden') && !isMe) {
    panel.classList.remove('hidden');
    _toast(from + ': ' + text, 'info', 3000);
  }
}

// ── Init on DOM ready ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  _applyTranslations();
  var saved = localStorage.getItem('lang');
  if (saved && ['en', 'hi', 'pa'].indexOf(saved) !== -1) {
    _showScreen('screenDash');
  } else {
    _showScreen('screenLang');
  }

  // ── Global data-action click handler ────────────────────────────────
  // Maps data-action="functionName" to the actual function
  var actions = {
    showAIChat: showAIChat,
    triggerSOS: triggerSOS,
    closeSOS: closeSOS,
    openVideoCallSetup: openVideoCallSetup,
    closeVideoSetup: closeVideoSetup,
    openTranscriber: openTranscriber,
    closeTranscriber: closeTranscriber,
    openSymptomChecker: openSymptomChecker,
    closeSymptomChecker: closeSymptomChecker,
    closeAIChat: closeAIChat,
    sendAIChat: sendAIChat,
    startRecognition: startRecognition,
    stopRecognition: stopRecognition,
    analyseSymptoms: analyseSymptoms,
    generateRoomId: generateRoomId,
    startVideoCall: startVideoCall,
    toggleChat: toggleChat,
    sendChatMessage: sendChatMessage,
    toggleMic: toggleMic,
    toggleCamera: toggleCamera,
    endCall: endCall,
    shareScreen: shareScreen,
    copyRoomLink: copyRoomLink,
  };

  document.body.addEventListener('click', function (e) {
    var target = e.target.closest('[data-action]');
    if (!target) return;
    var name = target.getAttribute('data-action');
    if (actions[name]) actions[name]();
  });

  document.body.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var target = e.target.closest('[data-enter-action]');
    if (!target) return;
    var name = target.getAttribute('data-enter-action');
    if (actions[name]) actions[name]();
  });

  // Bind buttons that use IDs
  var sosBtn = _$('sosReceived');
  if (sosBtn) sosBtn.addEventListener('click', function () { _toast('Emergency acknowledged.', 'info', 5000); closeSOS(); });

  var copyBtn = _$('copyTranscriptBtn');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var text = (_$('transcriptOutput') || {}).textContent || '';
    navigator.clipboard.writeText(text).then(function () { _toast('Copied!', 'success'); });
  });

  var saveBtn = _$('saveTranscriptBtn');
  if (saveBtn) saveBtn.addEventListener('click', function () {
    var text = (_$('transcriptOutput') || {}).textContent || '';
    if (!text.trim()) { _toast('Nothing to save yet.', 'warning'); return; }
    var blob = new Blob([text], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = 'transcript-' + Date.now() + '.txt'; a.click();
    URL.revokeObjectURL(url);
    _toast('Saved!', 'success');
  });

  var aiSumBtn = _$('aiSummariseBtn');
  if (aiSumBtn) aiSumBtn.addEventListener('click', function () {
    var text = ((_$('transcriptOutput') || {}).textContent || '').trim();
    if (!text || text.length < 10) { _toast('Please record some symptoms first.', 'warning'); return; }
    aiSumBtn.disabled = true;
    aiSumBtn.textContent = 'Analysing...';
    fetch('/api/ai/transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: text, lang: localStorage.getItem('lang') || 'en' }),
    })
      .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, data: d }; }); })
      .then(function (result) {
        if (!result.ok) throw new Error(result.data.error || 'AI failed');
        var d = result.data;
        var c = _$('aiSummaryContent');
        if (c) {
          c.textContent = '';
          var lines = [
            'Chief Complaint: ' + (d.chiefComplaint || ''),
            'Severity: ' + (d.severity || ''),
            'Duration: ' + (d.duration || ''),
            (d.clinicalNote || ''),
          ];
          lines.forEach(function(line) {
            var p = document.createElement('p');
            p.className = 'mb-1 text-sm text-gray-700';
            p.textContent = line;
            c.appendChild(p);
          });
        }
        _$('aiSummarySection').classList.remove('hidden');
        _toast('AI summary generated!', 'success');
      })
      .catch(function (err) { _toast('AI summary failed: ' + err.message, 'error'); })
      .finally(function () { aiSumBtn.disabled = false; aiSumBtn.textContent = 'AI Summarise'; });
  });
});

// Global error handler
window.onerror = function (msg, src, line) {
  console.error('[APP ERROR]', msg, src + ':' + line);
};
