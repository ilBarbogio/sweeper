import { mount, colors } from "./index.js"
import { rndColor, rndInt, getNeighborsWithOptions, colorBoardUtil, colorCellsUtil, getCellColorUtil } from "./utils.js"

let boardSide=8
let outlet, cellSide, cells, board, victory

export function transition(){
  outlet=document.getElementById("main-outlet")
  const template=document.getElementById("sliding-template")
  const clone=template.content.cloneNode(true)
  outlet.append(clone)

  outlet.classList.add("sliding")
  
  setup()
}

export function unmount(){
  outlet.classList.remove("sliding")
  outlet.innerHTML=""
}

function setup(){
  for(let f of outlet.querySelectorAll(".undo")) f.addEventListener("click",(ev)=>{
    for(let f of outlet.querySelectorAll(".undo")) f.classList.toggle("active")
  })

  board=document.querySelector(".board")
  board.style.setProperty("grid-template-columns",`repeat(${boardSide}, calc( var(--side) / ${boardSide}) )`)
  board.style.setProperty("grid-template-rows",`repeat(${boardSide}, calc( var(--side) / ${boardSide}) )`)
  board.innerHTML=""
  window.addEventListener("resize",()=>{
    board.style.setProperty("grid-template-columns",`repeat(${boardSide}, calc( var(--side) / ${boardSide}) )`)
    board.style.setProperty("grid-template-rows",`repeat(${boardSide}, calc( var(--side) / ${boardSide}) )`)
  })
  
  cells=[]
  victory=undefined

  for(let i=0;i<boardSide**2;i++) createCell(i)

  let time=6000

  const boardRect=board.getBoundingClientRect()
  cellSide=boardRect.width/boardSide

  colorBoard()
  colorCells()

  setInterval(()=>{
    colorCells()
  },time)
  setTimeout(()=>{
    setInterval(()=>{
      colorBoard()
      colorCells()
    },time)
  },.5*time)
  board.addEventListener("click",clickTile)
}

function createCell(i){
  const uncovered=Math.random()<.05
  const cell=document.createElement("div")
  cell.classList.add("cell")
  if(uncovered) cell.classList.add("uncovered")
  cell.dataset.index=i
  cell.dataset.x=i%boardSide
  cell.dataset.y=Math.floor(i/boardSide)

  if(!uncovered){
    const lid=document.createElement("div")
    lid.classList.add("lid")
    cell.append(lid)
  }

  board.append(cell)
  cells.push(cell)
}

function colorBoard(){
  colorBoardUtil(board)
}
function colorCells(){
  colorCellsUtil(cells,boardSide,rndInt(3,1))
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

function clickTile(ev){
  ev.stopPropagation()
  if(victory===undefined && ev.target.classList.contains("cell")){
    const cell=ev.target
    const lid=cell.querySelector(".lid")
    // shakeCell(cell,[10,6])

    const uncovered=[]
    for(let n of getNeighbors(cell)) if(n.classList.contains("uncovered")) uncovered.push(n)
    if(uncovered.length==0 || uncovered.length>1){
    }else{
      const target=uncovered[0]
      const vX=parseInt(target.dataset.x)-parseInt(cell.dataset.x)
      const vY=parseInt(target.dataset.y)-parseInt(cell.dataset.y)

      lid.style.left=`${vX*cellSide}px`
      lid.style.top=`${vY*cellSide}px`

      target.classList.remove("uncovered")
      const newLid=document.createElement("div")
      newLid.classList.add("lid")
      newLid.style.backgroundColor=getCellColorUtil(target,boardSide)
      console.log(getCellColorUtil(target))
      newLid.style.visibility="hidden"
      target.append(newLid)

      setTimeout(()=>{
        cell.classList.add("uncovered")
        lid.remove()
        newLid.style.visibility="visible"
        shakeCell(target,[10,6])
      },275)
    }
    // if(!outlet.querySelector(".flag").classList.contains("active")){
    //   let amount=cell.classList.contains("uncovered")?[4,1]:[10,3]
    //   let near=getNeighbors(ev.target,"four")
    //   let cross=getNeighbors(ev.target,"cross")
    //   for(let n of near) shakeCell(n,amount[0])
    //   for(let n of cross) shakeCell(n,amount[1])
    // }
  
    
  }
}
function getNeighbors(cell){
  return getNeighborsWithOptions(boardSide,cell,cells,"four")
}