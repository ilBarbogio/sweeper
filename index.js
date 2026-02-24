import { transition as mountSweeper } from "./sweeper.js"
import { transition as mountMenu } from "./menu.js"
import { transition as mountSliding } from "./sliding.js"
import { transition as mountMinihjong } from "./minihjong.js"

export const colors=["#641e79","#ec116c","#ff640a","#1aff0a"]
//"#ffe20a" negatise is dark blue, low viswibility on the background

export function mount(scene){
  switch(scene){
    case "sweeper":
      document.startViewTransition(mountSweeper)
      break
    case "minihjong":
      document.startViewTransition(mountMinihjong)
      break
    case "sliding":
      document.startViewTransition(mountSliding)
      break
    case "menu":
      document.startViewTransition(mountMenu)
    default:
      break
  }
}

mount("sweeper")
