import { mount, colors } from "./index.js"
let outlet

let boardSide=10
let cellSide, cells, boards, victory

export function transition(){
  outlet=document.getElementById("main-outlet")
  const template=document.getElementById("minihjong-template")
  const clone=template.content.cloneNode(true)
  outlet.append(clone)

  outlet.classList.add("minihjong")
  
  setup()
}

function setup(){
  boards=document.querySelectorAll(".board")
  console.log(boards)
  for(let [i,board] of boards.entries()){
    console.log(i,board)
    board.innerHTML=""
    setupCells(board,i)
  }
  window.addEventListener("resize",()=>{
    for(let [i,board] of boards.entries()){
      // board.style.setProperty("grid-template-columns",`repeat(${boardSide}, calc( calc( var(--side) / ${boardSide}) - ${i*2}) )`)
      // board.style.setProperty("grid-template-rows",`repeat(${boardSide}, calc( calc( var(--side) / ${boardSide}) - ${i*2}) )`)
      // board.innerHTML=""
    }
  })
  
  cells=[]
  victory=undefined
return
  // for(let i=0;i<boardSide**2;i++) createCell(i)

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

function setupCells(board,boardIndex){
  const n=boardSide-boardIndex*4
  for(let i=0;i<n-boardIndex;i++){
    const row=document.createElement("div")
    row.classList.add("row")
    const rowN=(i+boardIndex)%2==0 ? n-1 : n
    for(let j=0;j<rowN;j++){
      let cell=createCell(boardIndex,i,j)
      row.append(cell)
    }
    console.log(row)
    board.append(row)
  }
}
function createCell(boardIndex,i,j){
  const cell=document.createElement("div")
  cell.classList.add("cell")
  
  const lid=document.createElement("div")
  lid.classList.add("lid")
  lid.style.backgroundColor=colors[boardIndex]
  // lid.innerHTML="🀀"
  cell.append(lid)

  return cell
}

function colorBoard(){
  colorBoardUtil(board)
}
function colorCells(){
  colorCellsUtil(cells,boardSide,rndInt(3,1))
}

export function unmount(){
  outlet.classList.remove("minihjong")
  outlet.innerHTML=""
}

/*
🀀
🀁
🀂
🀃
🀄
🀅
🀆
🀇
🀈
🀉
🀊
🀋
🀌
🀍
🀎
🀏
🀐
🀑
🀒
🀓
🀔
🀕
🀖
🀗
🀘
🀙
🀚
🀛
🀜
🀝
🀞
🀟
🀠
🀡
🀢
🀣
🀤
🀥
🀦
🀧
🀨
🀩
🀪
🀫
1F000
1F001
1F002
1F003
1F004
1F005
1F006
1F007
1F008
1F009
1F00A
1F00B
1F00C
1F00D
1F00E
1F00F
1F010
1F011
1F012
1F013
1F014
1F015
1F016
1F017
1F018
1F019
1F01A
1F01B
1F01C
1F01D
1F01E
1F01F
1F020
1F021
1F022
1F023
*/