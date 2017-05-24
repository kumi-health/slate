import { findDOMNode } from "react-dom"


function getHtmlFromNativePaste(component, data, callback) {
  const contentNode = findDOMNode(component)

  const clipboardNode = contentNode.cloneNode()
  clipboardNode.setAttribute("class", "")
  clipboardNode.setAttribute("style", "position: fixed; left: -9999px")

  contentNode.parentNode.insertBefore(clipboardNode, contentNode)

  clipboardNode.focus()

  // clear call stack to let native paste behaviour occur, then get what was pasted from the DOM
  setTimeout(() => {
    if (clipboardNode.childElementCount > 0) {

      // contains any child nodes -> html content

      const html = clipboardNode.innerHTML
      clipboardNode.parentNode.removeChild(clipboardNode)

      callback({ ...data, html, type: "html" })
    } else {

      // only plain text, no html

      callback(data)
    }
  }, 0)

}


export default getHtmlFromNativePaste
