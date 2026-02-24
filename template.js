import { mount, colors } from "./index.js"

let outlet

export function transition(){
  outlet=document.getElementById("main-outlet")
  const template=document.getElementById("TEMPLATE-template")
  const clone=template.content.cloneNode(true)
  outlet.append(clone)

  outlet.classList.add("menu")
  
  setup()
}

function setup(){
  
}

export function unmount(){
  outlet.classList.remove("TEMPLATE")
  outlet.innerHTML=""
}