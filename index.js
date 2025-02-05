let boardSide, board, cells, minesLaid
let victory

function setup(){
  board=document.querySelector(".board")
  board.innerHTML=""

  document.body.addEventListener("click",(ev)=>{
    if(!ev.target.classList.contains("cell")) board.classList.toggle("flag")
  })
  
  cells=[]
  minesLaid=0
  victory=undefined

  boardSide=parseInt(getComputedStyle(document.body).getPropertyValue("--board-side"))

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
      alert("YOU LOSE :(")
      for(let c of document.querySelectorAll("[data-mine='1']")) c.innerHTML="&#9967;"
    }else{
      clicked.classList.add("uncovered")
      clicked.innerHTML=clicked.dataset.value!=0?clicked.dataset.value:""
      let queued=[clicked]

      while(queued.length>0){
        let c=queued.pop()
        let neighs=get4Neighbors(c.dataset.index)
        for(let n of neighs){
          if(!n.classList.contains("uncovered") && n.dataset.mine==0){
            n.classList.add("uncovered")
            n.innerHTML=n.dataset.value!=0?n.dataset.value:""
            if(c.dataset.value==0) queued.push(n)
          }
        }
      }

      if(boardSide**2-document.querySelectorAll(".cell.uncovered").length==minesLaid){
        alert("YOU WON :)")
        victory=true
        for(let c of document.querySelectorAll("[data-mine='1']")) c.innerHTML="&#9967;"
      }
    }
  }
}

function flagCell(cell){
  if(!cell.classList.contains("uncovered"){
  if(cell.classList.contains("flagged")){
    cell.classList.remove("flagged")
    cell.innerHTML=""
  }else{
    cell.classList.add("flagged")
    cell.innerHTML="&#9873;"
  }}
}

function clickTile(ev){
  if(victory===undefined && ev.target.classList.contains("cell")){
    let cell=ev.target
    if(minesLaid==0){
      layMines(cell.dataset.index)
      numberTiles()
      uncoverCell(cell)
    }else{
      console.log(board.classList)
      if(board.classList.contains("flag")) flagCell(cell)
      else uncoverCell(cell)
    }
  }
}


setup()
