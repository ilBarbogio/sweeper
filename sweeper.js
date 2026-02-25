import { colors } from "./index.js"
import { rndInt } from "./utils.js"

let outlet
let boardSide, board, cells, minesLaid, victory

export function transition(){
  outlet=document.getElementById("main-outlet")
  const template=document.getElementById("sweeper-template")
  const clone=template.content.cloneNode(true)
  outlet.append(clone)

  outlet.classList.add("sweeper")
  
  setup()
}

function setup(){
  for(let f of outlet.querySelectorAll(".flag")) f.addEventListener("click",(ev)=>{
    navigator.vibrate(200)
    for(let f of outlet.querySelectorAll(".flag")) f.classList.toggle("active")
  })

  board=document.querySelector(".board")
  board.innerHTML=""

  // let back=document.createElement("div")
  // back.classList.add("background")
  // back.style.background=`url("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Anchiornis_feathers.jpg/960px-Anchiornis_feathers.jpg")`
  // outlet.append(back)

  cells=[]
  minesLaid=0
  victory=undefined
  
  boardSide=12//parseInt(getComputedStyle(board.getPropertyValue("--cell-per-side")))

  board.innerHTML=""

  // if(loadedData){
  //   let can=document.createElement("canvas")
  //   can.width=loadedData.width
  //   can.height=loadedData.height
  //   let ctx=can.getContext("2d")
  //   ctx.putImageData(loadedData,0,0)
  //   can.toBlob(blob=>{
  //     let imageUrl=URL.createObjectURL(blob)
  //     board.style.backgroundImage=`url("${imageUrl}")`
  //     // URL.revokeObjectURL(imageUrl)
  //   })
  // }

  for(let i=0;i<boardSide**2;i++) createCell(i)

  let rndColor=()=>Math.floor(Math.random()*colors.length)
  let rndPoints=()=>Math.floor(Math.random()*3+1)
  let time=6000

  colorBoard(rndColor())
  colorCells(rndPoints())

  setInterval(()=>{
    colorCells(rndPoints())
  },time)
  setTimeout(()=>{
    setInterval(()=>{
      colorBoard(rndColor())
      colorCells(rndPoints())
    },time)
  },.5*time)
  board.addEventListener("click",clickTile)

  board.addEventListener("pointerdown",()=>{
    navigator.vibrate(100)
  }
  board.addEventListener("pointerup",()=>{
    navigator.vibrate(200)
  }
  board.addEventListener("touchend",()=>{
    navigator.vibrate(500)
  }
}

export function unmount(){
  
}


function colorBoard(i){
  board.style.setProperty("--base-color",colors[i])
}
function colorCells(n=2){
  let points=[]
  for(let i=0;i<n;i++) points.push([Math.round(Math.random()*boardSide),Math.round(Math.random()*boardSide)])
  let diag=Math.sqrt(2)*boardSide
  
  for(let c of board.querySelectorAll(".cell:not(.uncovered)")){
    let dist=0
    let [x,y]=[parseInt(c.dataset.x),parseInt(c.dataset.y)]
    let exact=false
    for(let p of points){
      if(x==p[0]&&y==p[1]) exact=true
      dist+=Math.hypot(x-p[0],y-p[1])
    }
    let f=dist/(points.length*diag)
    let ratioMix=exact || Math.random()<.05 ? 10+Math.floor(f*20) : 10+Math.floor(f*60)

    let lid=c.querySelector(".lid")
    lid.style.backgroundColor=`color-mix(in hsl, var(--base-color), white ${ratioMix}%)`
  }
  
}
function createCell(i){
  let cell=document.createElement("div")
  cell.classList.add("cell")
  cell.dataset.index=i
  cell.dataset.x=i%boardSide
  cell.dataset.y=Math.floor(i/boardSide)
  cell.dataset.mine=0

  let lid=document.createElement("div")
  lid.classList.add("lid")
  cell.append(lid)

  board.append(cell)
  cells.push(cell)
}
function shakeCell(cell,amount){
  if(amount && cell && !cell.classList.contains("uncovered")){
    const lid=cell.querySelector(".lid")
    let count=3
    let interval=setInterval(()=>{
      count--
      lid.style.top=`${Math.random()*2*amount-amount}px`
      lid.style.left=`${Math.random()*2*amount-amount}px`
      if(count<0){
        clearInterval(interval)
        lid.style.top=0
        lid.style.left=0
      }
    },50)
  }
}
function dropCell(cell){
  const lid=cell.querySelector(".lid")
  lid.classList.add("explode")
  lid.addEventListener("animationend",()=>{lid.remove()})
}
function layMines(clicked){
  let maxMines=2*boardSide
  
  while(minesLaid<maxMines){
    let index=Math.floor(Math.random()*boardSide**2)
    let cell=cells[index]
    if(cell.dataset.mine==0 && index!=parseInt(clicked.dataset.index)){
      cell.dataset.mine=1
      minesLaid++
    }
  }
}


function numberTiles(){
  for(let i=0;i<boardSide**2;i++){
    let cell=cells[i]
    if(cell.dataset.mine==0){
      let neighbors=getNeighbors(cell,"nine")
      let n=0
      for(let el of neighbors) if(el && el.dataset.mine==1) n++
      cell.dataset.value=n
      // cell.innerHTML=n
    }
  }
}

function getNeighbors(clicked,configuration){
  const index=parseInt(clicked.dataset.index)
  const x=index%boardSide
  const y=Math.floor(index/boardSide)
  const neigh=[
    y==0?-1:index-boardSide,
    x==boardSide-1||y==0?-1:index-boardSide+1,
    x==boardSide-1?-1:index+1,
    x==boardSide-1||y==boardSide-1?-1:index+boardSide+1,
    y==boardSide-1?-1:index+boardSide,
    x==0||y==boardSide-1?-1:index+boardSide-1,
    x==0?-1:index-1,
    x==0||y==0?-1:index-boardSide-1,
  ]//.filter(el=>el>=0)//.map(i=>cells.find(el=>el.dataset.index==index))

  switch(configuration){
    case "nine": return neigh.filter(el=>el>=0).map(i=>cells[i])
    case "four": return [neigh[0],neigh[2],neigh[4],neigh[6]].filter(el=>el>=0).map(i=>cells[i])
    case "cross": return [neigh[1],neigh[3],neigh[5],neigh[7]].filter(el=>el>=0).map(i=>cells[i])
    default: return []
  }
}

function uncoverCell(clicked){
  if(!clicked.classList.contains("uncovered") && !clicked.classList.contains("flagged")){
    if(clicked.dataset.mine==1){
      victory=false
      endgame()
    }else{
      clicked.classList.add("uncovered")
      dropCell(clicked)
      // if(imageUrl) clicked.classList.add("transparent")
      let content=document.createElement("div")
      content.classList.add("content")
      content.innerHTML=clicked.dataset.value!=0?clicked.dataset.value:""
      clicked.append(content)
      let queued=[clicked]

      while(queued.length>0){
        let c=queued.pop()
        let neighs=getNeighbors(c,"four")
        // console.log(neighs)
        for(let n of neighs){
          if(!n.classList.contains("uncovered") && n.dataset.mine==0){
            n.classList.add("uncovered")
            dropCell(n)
            let content=document.createElement("div")
            content.classList.add("content")
            content.innerHTML=n.dataset.value!=0?n.dataset.value:""
            n.append(content)
            if(c.dataset.value==0) queued.push(n)
          }else shakeCell(n,[8,3])
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
  let lid=cell.querySelector(".lid")
  if(lid){
    if(cell.classList.contains("flagged")) lid.innerHTML=""
    else lid.innerHTML="⚑"
    cell.classList.toggle("flagged")
  }
}

function clickTile(ev){
  ev.stopPropagation()
  if(victory===undefined && ev.target.classList.contains("cell")){
    let cell=ev.target
    
    if(!outlet.querySelector(".flag").classList.contains("active")){
      let amount=cell.classList.contains("uncovered")?[4,1]:[10,3]
      let near=getNeighbors(ev.target,"four")
      let cross=getNeighbors(ev.target,"cross")
      for(let n of near) shakeCell(n,amount[0])
      for(let n of cross) shakeCell(n,amount[1])
    }
  
    let flagging=outlet.querySelector(".flag").classList.contains("active")
    
    if(minesLaid==0){
      layMines(cell)
      numberTiles()
      uncoverCell(cell)
      
    }else{
      if(flagging) flagCell(cell)
      else uncoverCell(cell)
    }
  }
}

function endgame(){
  for(let c of document.querySelectorAll("[data-mine='1']")){
    c.style.color=victory?"lime":"red"
    c.innerHTML="⛯"
  }
  // let messageDisplay=document.querySelector(".endgame")
  // messageDisplay.innerHTML=victory?"YOU WON :P":"YOU LOSE :("
  // messageDisplay.classList.add("rise")

  if(victory){
    let back=outlet.querySelector(".background")
    if(back) back.classList.add("revealed")
    let cells=[...document.querySelectorAll(".cell")]

    let breakpoints=[0]
    let divs=8
    console.log(divs)
    let stride=Math.floor(cells.length/divs)
    console.log(stride)
    for(let i=1;i<divs;i++) breakpoints.push(rndInt((i-.5)*stride,(i-.5)*stride))
      console.log(breakpoints)
    breakpoints.push(cells.length)

    let groupedCells=[]
    for(let i=0;i<breakpoints.length-1;i++) groupedCells.push(cells.slice(breakpoints[i],breakpoints[i+1]))

    let intervals=(new Array(groupedCells.length)).fill(0)

    for(let [i,g] of groupedCells.entries()){
      intervals[i]=setInterval(()=>{
      if(groupedCells[i].length>0){
        let c=i%2==0? groupedCells[i].pop() : groupedCells[i].shift()
        c.classList.add("explode")
        c.addEventListener("animationend",(ev)=>{
          if(ev.animationName=="explode"){
            c.classList.add("removed")
          }
        })
      }else clearInterval(intervals[i])
    },200) 
    }
  }
}
