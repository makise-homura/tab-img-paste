// ==UserScript==
// @name         Tabun Image Uploader
// @version      0.1.5
// @description  upload images by pasting them
// @author       badunius, makise_homura
// @grant        none
// @match        https://tabun.everypony.ru/*
// @match        https://tabun.everypony.online/*
// @match        https://tabun.everypony.info/*
// @match        https://tabun.everypony.me/*
// @match        https://tabun.me/*
// @downloadURL  https://github.com/makise-homura/tab-img-paste/raw/refs/heads/master/paste-img.user.js
// @updateURL    https://github.com/makise-homura/tab-img-paste/raw/refs/heads/master/paste-img.user.js
// ==/UserScript==

const src = `
/**
 * Returns LS security key
 */
const getKey = () => {
    const link = document.querySelector('li.item-signout a')
    const href = link && link.href || ''
    const query = href.split('?')[1] || ''
    const key = query.split('=')[1] || ''
    return key
}

/**
 * Returns image as file from clipboard items
 */
const getImage = (items) => {
    for (let item of items) {
        if (item.type.includes('image')) {
            return item.getAsFile()
        }
    }
    
    return null
}

/**
 * Creates and sends a form
 */
const sendImage = async (image) => {
    const form = new FormData()
    form.append('img_file', image)
    form.append('title', '')
    form.append('security_ls_key', getKey())
  
    const res = await fetch('/ajax/upload/image/', {
        method: 'POST',
        body: form
    })
  
    const text = await res.text()

    const json = JSON.parse(new DOMParser().parseFromString(text, 'text/html').querySelector('textarea').textContent)

    return json
}

/**
 * Insert tag
 */
const pasteTag = (target, data) => {
    const start = target.selectionStart
    const end = target.selectionEnd
    const text = target.value

    const before = text.slice(0, start)
    const after = text.slice(end)
    const middle = data.sText || ''

    target.value = before + middle + after
    target.selectionStart = start
    target.selectionEnd = start + middle.length
}

const onPaste = (evt) => {
    if (evt.target.tagName !== 'TEXTAREA') { return }

    const  { items } = evt.clipboardData
    const image = getImage(items)
    if (!image) { return }
    
    sendImage(image)
        .then(res => pasteTag(evt.target, res))
}


document.addEventListener('paste', onPaste)
`

const script = document.createElement('script')
script.textContent = src
document.body.appendChild(script)
console.log('Image Uploader ready')