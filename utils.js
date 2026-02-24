import { colors } from "./index.js"

export function mulberry32(seed){
  return function(){
    let t=(seed+=0x6D2B79F5)
    t=Math.imul(t ^ (t >>> 15), t | 1)
    t^=t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const rndColor=()=>Math.floor(Math.random()*colors.length)
export const rndInt=(a,b=0)=>Math.floor(Math.random()*a+b)

export function getNeighborsWithOptions(boardSide,clicked,allCells,configuration){
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
    case "nine": return neigh.filter(el=>el>=0).map(i=>allCells[i])
    case "four": return [neigh[0],neigh[2],neigh[4],neigh[6]].filter(el=>el>=0).map(i=>allCells[i])
    case "cross": return [neigh[1],neigh[3],neigh[5],neigh[7]].filter(el=>el>=0).map(i=>allCells[i])
    default: return []
  }
}

let points=[]
export function colorBoardUtil(board,color){
  const currentColor=color ?? colors[rndInt(colors.length)]
  board.style.setProperty("--base-color",currentColor)
}
export function generateColorPoints(boardSide,n=2){
  points=[]
  for(let i=0;i<n;i++) points.push([Math.round(Math.random()*boardSide),Math.round(Math.random()*boardSide)])
}
export function colorCellsUtil(cells,boardSide=12,n=rndInt(3,1)){
  generateColorPoints(boardSide,n)
  for(let c of cells){
    const lid=c.querySelector(".lid")
    if(lid) lid.style.backgroundColor=getCellColorUtil(c,boardSide)
  }
}
export function getCellColorUtil(cell,boardSide){
  const diag=Math.sqrt(2)*boardSide
  let dist=0
  const [x,y]=[parseInt(cell.dataset.x),parseInt(cell.dataset.y)]
  let exact=false
  for(let p of points){
    if(x==p[0]&&y==p[1]) exact=true
    dist+=Math.hypot(x-p[0],y-p[1])
  }
  let f=dist/(points.length*diag)
  let ratioMix=exact || Math.random()<.05 ? 10+Math.floor(f*20) : 10+Math.floor(f*60)

  return `color-mix(in hsl, var(--base-color), white ${ratioMix}%)`
}