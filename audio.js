let aCtx, mainGain
let base=440
let oscillators={
  base:{started:false,gain:undefined,osc:undefined,f:base,timeout:undefined},
  third:{started:false,gain:undefined,osc:undefined,f:base*.25*5,timeout:undefined},
  fifth:{started:false,gain:undefined,osc:undefined,f:base*.25*6,timeout:undefined},
  octave:{started:false,gain:undefined,osc:undefined,f:base*2,timeout:undefined}
}
export let onSounds=new Set()
let times={
  attack:.2,
  sweep:.5,
  release:.015
}

export const setup=()=>{
  aCtx=new AudioContext()

  mainGain=aCtx.createGain()
  mainGain.gain.value=.1

  let compressor=aCtx.createDynamicsCompressor()

  // let vawe=new PeriodicWave(aCtx,celeste)
  // osc=new OscillatorNode(aCtx,{
  //   frequency:220,
  //   type:"custom",
  //   periodicWave:vawe
  // })
  // osc.start()

  mainGain.connect(compressor).connect(aCtx.destination)

  for(let freq of Object.keys(oscillators)){
    oscillators[freq].osc=new OscillatorNode(aCtx,{
      frequency:oscillators[freq].f,
      type:"sine"
    })
    
    oscillators[freq].gain = new GainNode(aCtx)
    oscillators[freq].osc.connect(oscillators[freq].gain).connect(mainGain)
  }
}

export const play=(freq)=>{
  if(aCtx && freq && onSounds.size==0){
    if(!oscillators[freq].started){
      oscillators[freq].osc.start()
      oscillators[freq].started=true
    }
    if(oscillators[freq].timeout){
      clearTimeout(oscillators[freq].timeout)
      oscillators[freq].timeout=undefined
    }
    let time=aCtx.currentTime
    oscillators[freq].gain.gain.cancelScheduledValues(time)
    oscillators[freq].gain.gain.setValueAtTime(0, time)
    // oscillators[freq].gain.gain.linearRampToValueAtTime(1, time + times.attack)
    oscillators[freq].gain.gain.setTargetAtTime(1, time, times.attack)
    onSounds.add(freq)
  }
}

export const stop=(freq)=>{
  if(aCtx && freq && oscillators[freq].gain){
    let time=aCtx.currentTime
    // oscillators[freq].gain.gain.cancelScheduledValues(time)
    // oscillators[freq].gain.gain.linearRampToValueAtTime(0, time +times.release)
    oscillators[freq].gain.gain.setTargetAtTime(0, time, times.release)
    oscillators[freq].timeout=setTimeout(()=>{onSounds.delete(freq)},times.release*2)
  }
}

export const stopAll=()=>{
  if(aCtx){
    onSounds.clear()
    let time=aCtx.currentTime
    for(let k of Object.keys(oscillators)) if(oscillators[k].gain) oscillators[k].gain.gain.linearRampToValueAtTime(0, time +times.release)
  }
}

export const isPlaying=()=>{
  return onSounds.size>0
}