'use strict';
const message=document.querySelector('#message'),speakButton=document.querySelector('#speak'),stopButton=document.querySelector('#stop'),status=document.querySelector('#status');
const presets=[...document.querySelectorAll('[data-preset]')];
const announcements=presets.map(button=>button.dataset.announcement);
const supported='speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const voiceSelect=document.querySelector('#voice'),rateControl=document.querySelector('#rate'),rateValue=document.querySelector('#rate-value'),previewButton=document.querySelector('#preview');
const repeatControl=document.querySelector('#repeat');
function repeatCount(){const value=Math.min(1000,Math.max(1,Math.floor(Number(repeatControl.value)||1)));repeatControl.value=String(value);return value;}
repeatControl.addEventListener('change',repeatCount);
let selectedVoiceURI='';
let audioContext,voices=[],currentUtterance,run=0,timer,nodes=[];
function update(){document.querySelector('#count').textContent=`${message.value.length} / 3000`;speakButton.disabled=!supported||!message.value.trim();}
const noveltyVoice=/albert|bad news|bahh|bells|boing|bubbles|cellos|good news|hysterical|jester|organ|trinoids|whisper|wobble|zarvox/i;
function voiceScore(v){
 if(noveltyVoice.test(v.name))return -100;
 let score=v.default?5:0;
 if(v.localService)score+=10;
 if(/samantha|alex|daniel|karen|moira|tessa|serena|ava|allison|susan|tom|oliver/i.test(v.name))score+=30;
 if(/enhanced|premium|natural/i.test(v.name))score+=40;
 return score;
}
function loadVoices(){
 voices=supported?speechSynthesis.getVoices().filter(v=>/^en(?:-|$)/i.test(v.lang)).sort((a,b)=>voiceScore(b)-voiceScore(a)):[];
 const previous=selectedVoiceURI;
 voiceSelect.replaceChildren();
 for(const voice of voices){const option=document.createElement('option');option.value=voice.voiceURI;option.textContent=`${voice.name} · ${voice.lang}`;voiceSelect.append(option);}
 if(!voices.length){const option=document.createElement('option');option.value='';option.textContent='System default';voiceSelect.append(option);}
 selectedVoiceURI=voices.some(v=>v.voiceURI===previous)?previous:(voices[0]?.voiceURI||'');
 voiceSelect.value=selectedVoiceURI;
}
voiceSelect.addEventListener('change',()=>{selectedVoiceURI=voiceSelect.value;});
rateControl.addEventListener('input',()=>{rateValue.textContent=`${Number(rateControl.value)}×`;});
previewButton.addEventListener('click',()=>announce('Hello, class. This is your announcement voice.',-1,false));
function clearPlayback(){run++;clearTimeout(timer);if(supported)speechSynthesis.cancel();for(const node of nodes){try{node.stop();}catch{}}nodes=[];currentUtterance=null;stopButton.disabled=true;presets.forEach(b=>b.classList.remove('active'));}
function stop(){clearPlayback();status.textContent='Stopped. Ready for the next announcement.';}
async function announce(text,presetIndex=-1,withChime=true){
 if(!supported){status.textContent='Speech is unavailable in this browser. Open this site in Safari, Chrome, or Edge.';return;}
 const chosenRate=Math.min(2,Math.max(0.5,Number(rateControl.value)||1));
 const chosenVoice=selectedVoiceURI;
 const total=withChime?repeatCount():1;
 let iteration=0;
 text=text.trim();if(!text){status.textContent='Type a message first.';message.focus();return;}
 clearPlayback();const token=run;stopButton.disabled=false;if(presetIndex>=0)presets[presetIndex].classList.add('active');
 async function playNext(){
 if(token!==run)return;
 iteration++;nodes=[];
 const progress=total>1?` (${iteration}/${total})`:'';
 status.textContent=(withChime?'Playing chime…':'Starting voice…')+progress;
 let delay=0;
 try{const Audio=window.AudioContext||window.webkitAudioContext;if(Audio&&withChime){audioContext??=new Audio();await audioContext.resume();if(token!==run)return;const now=audioContext.currentTime;[659.25,880].forEach((frequency,i)=>{const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,now+i*.14);gain.gain.linearRampToValueAtTime(.16,now+i*.14+.015);gain.gain.exponentialRampToValueAtTime(.001,now+i*.14+.25);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(now+i*.14);oscillator.stop(now+i*.14+.27);nodes.push(oscillator);});delay=440;}}catch{status.textContent='Chime unavailable. Starting announcement…';}
 if(token!==run)return;
 timer=setTimeout(()=>{if(token!==run)return;loadVoices();const utterance=new SpeechSynthesisUtterance(text.replace(/\b1BB\b/g,'one B B'));currentUtterance=utterance;utterance.voice=voices.find(v=>v.voiceURI===chosenVoice)||voices[0]||null;utterance.lang=utterance.voice?.lang||'en-US';utterance.rate=chosenRate;utterance.volume=1;utterance.onstart=()=>{if(token===run)status.textContent='Speaking…'+progress;};utterance.onend=()=>{if(token!==run)return;if(iteration<total){timer=setTimeout(playNext,250);}else{clearPlayback();status.textContent=total>1?`Complete. Played ${total} times.`:'Announcement complete.';}};utterance.onerror=e=>{if(token===run){clearPlayback();status.textContent=e.error==='not-allowed'?'Audio was blocked. Tap Chime & speak again.':'Could not play speech. Check your device voice settings and try again.';}};status.textContent='Starting voice…'+progress;speechSynthesis.speak(utterance);},delay);
 }
 await playNext();
}
message.addEventListener('input',update);speakButton.addEventListener('click',()=>announce(message.value));stopButton.addEventListener('click',stop);presets.forEach((button,index)=>button.addEventListener('click',()=>{message.value=announcements[index];update();announce(message.value,index);}));
loadVoices();if(supported)speechSynthesis.addEventListener('voiceschanged',loadVoices);else{previewButton.disabled=true;voiceSelect.disabled=true;rateControl.disabled=true;presets.forEach(b=>b.disabled=true);status.textContent='Speech is unavailable in this browser. Open this site in Safari, Chrome, or Edge.';}
window.addEventListener('pagehide',clearPlayback);update();
if(document.modelContext?.registerTool){const lifecycle=new AbortController();try{Promise.resolve(document.modelContext.registerTool({name:'set_announcement_text',description:'Set the text in the announcement box without playing audio.',inputSchema:{type:'object',properties:{text:{type:'string',maxLength:3000}},required:['text'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input||typeof input.text!=='string'||input.text.length>3000)throw new Error('Text must be a string of at most 3000 characters.');message.value=input.text;update();return{text:message.value};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}window.addEventListener('pagehide',()=>lifecycle.abort());}
