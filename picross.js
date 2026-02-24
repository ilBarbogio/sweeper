import { mount, colors } from "./index.js"

let outlet

export function transition(){
  outlet=document.getElementById("main-outlet")
  const template=document.getElementById("picross-template")
  const clone=template.content.cloneNode(true)
  outlet.append(clone)

  outlet.classList.add("menu")
  
  setup()
}

function setup(){
  for(let t of outlet.querySelectorAll(".tile")) t.addEventListener("click",ev=>{
    const game=ev.target.dataset.game
    unmount()
    mount(game)
  })
}

export function unmount(){
  outlet.classList.remove("picross")
  outlet.innerHTML=""
}