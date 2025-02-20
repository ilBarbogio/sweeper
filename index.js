let boardSide, board, cells, minesLaid
let victory, imageUrl

function detectImage(){
  // let encr=btoa("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQziAhrQ2boRgrbEv6GbMLqkdm9nr6Ah5LbnA&s")
  // console.log(encr)

  if(window.location?.search){
    let str=window.location?.search.replace("?image=","")
    imageUrl=atob(str)
    // console.log(imageUrl)
  }else imageUrl=undefined

  setup()
}

function setup(){
  board=document.querySelector(".board")
  board.innerHTML=""

  if(imageUrl) board.style.backgroundImage=`url("${imageUrl}")`

  document.body.addEventListener("click",(ev)=>{
    if(!ev.target.classList.contains("cell") && !victory) board.classList.toggle("flag")
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
  }else if(!cell.classList.contains("uncovered")){
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

    if(imageUrl){
      const link=document.createElement("a")
      link.href=imageUrl
      link.style="position:fixed;top:-10em;visibility:hidden"
      document.body.append(link)
      board.addEventListener("click",()=>{link.click()})
    }
  }
}


detectImage()
