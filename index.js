let boardSide, board, capture, cells, minesLaid, phase, counter, stream
let victory, imageUrl

// function detectImage(){
  // let encr=btoa("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQziAhrQ2boRgrbEv6GbMLqkdm9nr6Ah5LbnA&s")
  // console.log(encr)

//   if(window.location?.search){
//     let str=window.location?.search.replace("?image=","")
//     imageUrl=atob(str)
//     // console.log(imageUrl)
//   }else imageUrl=undefined

//   setup()
// }

function setup(){
  board=document.querySelector(".board")
  board.innerHTML=""
  if(imageUrl) board.style.backgroundImage=`url("${imageUrl}")`

  capture=document.querySelector(".capture")

  counter=0
  let maxCounter=7
  
  document.body.addEventListener("click",(ev)=>{
    if(!ev.target.classList.contains("cell") && !board.classList.contains("capturing") && !victory){
      board.classList.toggle("flag")
      if(window.innerHeight>window.innerWidth && ev.clientY<window.innerHeight*.1){
        counter++
        if(counter>maxCounter) switchToCapture()
      }else counter=0
    }else counter=0
  })
  
  document.querySelector("button.snap").addEventListener("click",()=>{
    const container=document.body.querySelector(".video-container")
    if(!container.classList.contains("snapped")) snapImage()
    else switchToCapture()
  })

  document.querySelector("button.save").addEventListener("click",()=>{
    const container=document.body.querySelector(".video-container")
    if(container.classList.contains("snapped")) saveImage()
  })

  document.querySelector("button.exit").addEventListener("click",()=>{
    if(stream) for(let t of stream.getTracks()) t.stop()
    stream=undefined
    setupBoard()
  })

  document.querySelector("button.load").addEventListener("click",()=>{
    loadImage()
  })
  
  //board  
  setupBoard()
}

//#region CAPTURE
//capturing
async function switchToCapture(){
  const container=document.body.querySelector(".video-container")
  container.classList.remove("snapped")

  document.body.querySelector("button.save").setAttribute("disabled",true)

  const can=container.querySelector("canvas")
  if(can) can.remove()
  counter=0
  board.classList.add("capturing")
  capture.classList.add("capturing")

  const video=document.createElement("video")
  container.append(video)
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'self' }
  })
  video.srcObject = stream
  video.play()
}

function snapImage(){
  const container=document.body.querySelector(".video-container")
  container.classList.add("snapped")

  document.body.querySelector("button.save").removeAttribute("disabled")

  const video=document.body.querySelector("video")
  if(video){
    const can=document.createElement("canvas")
    container.append(can)
    const ctx=can.getContext("2d")
    can.width=video.videoWidth
    can.height=video.videoHeight

    ctx.drawImage(video,0,0)
    
    for(let t of stream.getTracks()) t.stop()
    stream=undefined
    video.remove()
  }  
  // const url=can.toDataURL("image/png",1)

  // document.body.style.backgroundImage=`url("${url}")`
}

function saveImage(){
  const password=prompt("Inserire una password numerica")
  if(isNaN(password) || password===null) alert("La password deve essere composta solo da numeri")
  else{
    const container=document.body.querySelector(".video-container")
    const can=container.querySelector("canvas")
    if(can){
      const ctx=can.getContext("2d",{willFrequentlyRead:true})
      let w=can.width
      let h=can.height
      
      let iter=300
      // let maxFactor=Math.min(Math.ceil(Math.sqrt(w)),Math.ceil(Math.sqrt(h)))
      let factors=(new Array(16)).fill(0).map((el,i)=>i+3)
      factors=factors.filter(el=>w%el==0 && h%el==0)
      scramble(password,w,h,ctx,iter,5)


      can.toBlob(blob=>{
        const url=URL.createObjectURL(blob)
        
        const link=document.createElement("a")
        link.setAttribute("download","sweeperimage.png")
        link.href=url
        link.click()

        link.remove()
        URL.revokeObjectURL(url)
      })
    }
  }
}

function loadImage(){
  const input=document.createElement("input")
  input.type="file"
  input.style.display="none"
  input.setAttribute("accept","image/png")
  document.body.append(input)

  input.addEventListener("change",ev=>{
    if(ev.target.files.length==1){
      let file=ev.target.files[0]
      const url=URL.createObjectURL(file)

      const img=document.createElement("img")
      img.addEventListener("load",ev=>{
        const password=prompt("Inserire una password numerica")
        if(isNaN(password) || password===null) alert("La password deve essere composta solo da numeri")
        
        URL.revokeObjectURL(url)
        const video=document.body.querySelector("video")
        if(video) video.remove()
        if(stream){
          for(let t of stream.getTracks()) t.stop()
          stream=undefined
        }
        const container=document.body.querySelector(".video-container")
        let can=container.querySelector("canvas")
        if(!can){
          can=document.createElement("canvas")
          container.append(can)
        }
        const ctx=can.getContext("2d")
        can.width=img.width
        can.height=img.height
        can.style.display="none"
        ctx.drawImage(img,0,0)

        let iter=300
        let factors=(new Array(16)).fill(0).map((el,i)=>i+3)
        factors=factors.filter(el=>can.width%el==0 && can.height%el==0)
        scramble(password,can.width,can.height,ctx,iter,5,true)

        setupBoard(ctx.getImageData(0,0,can.width,can.height))
        
      })
      img.src=url
    }
  })

  input.click()
}

function generaterSwaps(password,w,h,iterations,factor){
  let rnd=mulberry32(parseInt(password))
  rows=Math.floor(h/factor)
  rowSwaps=[]
  for(let i=0;i<iterations;i++) rowSwaps.push(
    Math.floor(rnd()*rows),
    Math.floor(rnd()*rows)
  )
  columns=Math.floor(w/factor)
  columnSwaps=[]
  for(let i=0;i<iterations;i++) columnSwaps.push(
    Math.floor(rnd()*rows),
    Math.floor(rnd()*rows)
  )
  return [rowSwaps,columnSwaps]
}
function scramble(password,w,h,ctx,iterations,factor,invert=false){
  let [rowSwaps,columnSwaps]=generaterSwaps(password,w,h,iterations,factor)
  let rowHeight=h/rows
  let columnWidth=w/columns
  
  if(invert){
    rowSwaps.reverse()
    columnSwaps.reverse()
  }

  for(let i=0;i<rowSwaps.length;i=i+2){
    let a=rowSwaps[i]
    let b=rowSwaps[i+1]
    if(a!=b){
      let aData=ctx.getImageData(0,a*rowHeight,w,rowHeight)
      let bData=ctx.getImageData(0,b*rowHeight,w,rowHeight)
      ctx.putImageData(aData,0,b*rowHeight)
      ctx.putImageData(bData,0,a*rowHeight)
    }
  }
  for(let i=0;i<columnSwaps.length;i=i+2){
    let a=columnSwaps[i]
    let b=columnSwaps[i+1]
    if(a!=b){
      let aData=ctx.getImageData(a*columnWidth,0,columnWidth,h)
      let bData=ctx.getImageData(b*columnWidth,0,columnWidth,h)
      ctx.putImageData(aData,b*columnWidth,0)
      ctx.putImageData(bData,a*columnWidth,0)
    }
  }
}
//#endregion

//#region GAME
function setupBoard(loadedData){
  board.classList.remove("capturing")
  capture.classList.remove("capturing")

  cells=[]
  minesLaid=0
  victory=undefined

  boardSide=parseInt(getComputedStyle(document.body).getPropertyValue("--board-side"))

  board.innerHTML=""

  if(loadedData){
    let can=document.createElement("canvas")
    can.width=loadedData.width
    can.height=loadedData.height
    let ctx=can.getContext("2d")
    ctx.putImageData(loadedData,0,0)
    can.toBlob(blob=>{
      let imageUrl=URL.createObjectURL(blob)
      board.style.backgroundImage=`url("${imageUrl}")`
      // URL.revokeObjectURL(imageUrl)
    })
  }

  for(let i=0;i<boardSide**2;i++){
    let cell=document.createElement("div")
    cell.classList.add("cell")
    cell.dataset.index=i
    cell.dataset.mine=0
    board.append(cell)
    cells.push(cell)

    board.addEventListener("click",clickTile)
  }
}
function layMines(clicked){
  let maxMines=2*boardSide
  
  while(minesLaid<maxMines){
    let index=Math.floor(Math.random()*boardSide**2)
    let cell=cells[index]
    if(cell.dataset.mine==0 && index!=clicked){
      cell.dataset.mine=1
      minesLaid++
    }
  }
}

function get9Neighbors(clicked){
  const index=parseInt(clicked)
  const x=index%boardSide
  const y=Math.floor(index/boardSide)
  let neigh=[
    y==0?-1:index-boardSide,
    x==boardSide-1||y==0?-1:index-boardSide+1,
    x==boardSide-1?-1:index+1,
    x==boardSide-1||y==boardSide-1?-1:index+boardSide+1,
    y==boardSide-1?-1:index+boardSide,
    x==0||y==boardSide-1?-1:index+boardSide-1,
    x==0?-1:index-1,
    x==0||y==0?-1:index-boardSide-1,
  ].filter(el=>el>=0).map(i=>cells.find(el=>el.dataset.index==i))
  return neigh
}

function numberTiles(){
  for(let i=0;i<boardSide**2;i++){
    let cell=cells[i]
    if(cell.dataset.mine==0){
      let neighbors=get9Neighbors(i)
      let n=0
      for(let el of neighbors) if(el && el.dataset.mine==1) n++
      cell.dataset.value=n
      // cell.innerHTML=n
    }
  }
}

function get4Neighbors(clicked){
  const index=parseInt(clicked)
  const x=index%boardSide
  const y=Math.floor(index/boardSide)
  let neigh=[
    y==0?-1:index-boardSide,
    x==boardSide-1?-1:index+1,
    y==boardSide-1?-1:index+boardSide,
    x==0?-1:index-1,
  ].filter(el=>el>=0).map(i=>cells.find(el=>el.dataset.index==i))
  return neigh
}

function uncoverCell(clicked){
  if(!clicked.classList.contains("uncovered") && !clicked.classList.contains("flagged")){
    if(clicked.dataset.mine==1){
      victory=false
      endgame()
    }else{
      clicked.classList.add("uncovered")
      if(imageUrl) clicked.classList.add("transparent")
      clicked.innerHTML=clicked.dataset.value!=0?clicked.dataset.value:""
      let queued=[clicked]

      while(queued.length>0){
        let c=queued.pop()
        let neighs=get4Neighbors(c.dataset.index)
        for(let n of neighs){
          if(!n.classList.contains("uncovered") && n.dataset.mine==0){
            n.classList.add("uncovered")
            if(imageUrl) n.classList.add("transparent")
            n.innerHTML=n.dataset.value!=0?n.dataset.value:""
            if(c.dataset.value==0) queued.push(n)
          }
        }
      }

      if(boardSide**2-document.querySelectorAll(".cell.uncovered").length==minesLaid){
        victory=true
        endgame()
      }
    }
  }
}

function flagCell(cell){
  if(cell.classList.contains("flagged")){
    cell.classList.remove("flagged")
    cell.innerHTML=""
  }else{
    cell.classList.add("flagged")
    cell.innerHTML="&#9873;"
  }
}

function clickTile(ev){
  if(victory===undefined && ev.target.classList.contains("cell")){
    let cell=ev.target
    if(minesLaid==0){
      layMines(cell.dataset.index)
      numberTiles()
      uncoverCell(cell)
    }else{
      if(board.classList.contains("flag")) flagCell(cell)
      else uncoverCell(cell)
    }
  }
}

function endgame(){
  for(let c of document.querySelectorAll("[data-mine='1']")){
    c.style.color=victory?"lime":"red"
    c.innerHTML="&#9967;"
  }
  let messageDisplay=document.querySelector(".endgame")
  messageDisplay.innerHTML=victory?"YOU WON :P":"YOU LOSE :("
  messageDisplay.classList.add("rise")

  if(victory){
    let cells=[...document.querySelectorAll(".cell")]
    let interval=setInterval(()=>{
      if(cells.length>0){
        let c=cells.pop()
        c.classList.add("disappearing")
        c.addEventListener("animationend",(ev)=>{
          if(ev.animationName=="disappear"){
            c.remove()
          }
        })
      }else{
        clearInterval(interval)
      }
    },200)
  }
}
//#endregion

//#region utils
function mulberry32(seed){
  return function(){
    let t=(seed+=0x6D2B79F5)
    t=Math.imul(t ^ (t >>> 15), t | 1)
    t^=t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
//#endregion

setup()
