/**
 * @description Returns each of the elements in a NodeList
 * that match the specified group of selectors.
 * @param {String} selector, The Selector
 * @param {Number} cb, The callback
 * @return {Element, Number}
 */
window.getElements = (selector, cb) => {
    const selectors = document.querySelectorAll(selector);
    [].forEach.call(selectors, cb);
}

defineCustomElements = () => {
    class CustomCodeBlock extends HTMLElement {
        connectedCallback() {
            // this.innerHTML = `<slot><h1>Hello</h1></slot>`;
            return this.innerHTML;
        }
    }

    customElements.define('custom-code-block', CustomCodeBlock);
}

changeMarkdownTitleId = () => {
    getElements('.csh-markdown-title', (titleElement) => {
        titleElement.id = titleElement.id.substring(2);
    })
}

function locationHash() {
    // $(document).bind('scroll', function (e) {
    //   $('.csh-markdown-title').each(function () {
    //     if (
    //       $(this).offset().top < window.pageYOffset + 10 &&
    //       $(this).offset().top + $(this).height() > window.pageYOffset + 10
    //     ) {
    //       history.replaceState(null, null, `#${$(this).attr('id')}`);
    //     }
    //   });
    // });
}

onThisPage = () => {
    let tocList = document.createElement('div');
    tocList.setAttribute('class', 'on-this-page');

    window.insertSpacer = (index) => {
        let spacer = document.createElement('br');
        spacer.setAttribute('class', 'csh-new-line');
        spacer.setAttribute('data-menu-item-after', `${index}`);
        return spacer;
    };

    let tocListIndex = 0;
    getElements('.csh-markdown-title[data-type="##"]', (titleElement) => {
        tocListIndex++;

        const titleIdentifier = titleElement.id;
        const titleText = titleElement.textContent;
        let headerLevel = titleElement.getAttribute('data-type');

        let tocListEntry = document.createElement('span');
        tocListEntry.setAttribute('class', 'csh-markdown csh-markdown-list');
        tocListEntry.setAttribute('data-type', '*');
        tocListEntry.setAttribute('data-menu-item', `${tocListIndex}`);
        tocListEntry.setAttribute('header-level', headerLevel);

        let tocListEntryLink = document.createElement('a');
        tocListEntryLink.setAttribute('class', 'csh-markdown csh-markdown-link csh-markdown-link-text');
        tocListEntryLink.setAttribute('rel', 'noopener noreferrer');
        tocListEntryLink.setAttribute('target', '_self');
        tocListEntryLink.setAttribute('href', `#${titleIdentifier}`);
        tocListEntryLink.textContent = titleText;

        tocListEntry.append(tocListEntryLink)

        tocList.append(tocListEntry)
        tocList.append(insertSpacer(tocListIndex))

    })

    getElements('.csh-article-content-text', (articleFrame) => {
        let emphasisContainerIdentifier = articleFrame.firstElementChild.dataset.type;
        if (emphasisContainerIdentifier === '|' || emphasisContainerIdentifier === '||' || emphasisContainerIdentifier === '|||') {
            let emphasisContainer = articleFrame.firstElementChild;

            if (emphasisContainer.nextSibling.nodeName === 'BR') {
                emphasisContainer.nextSibling.remove();
            }
            articleFrame.prepend(tocList)
            articleFrame.prepend(insertSpacer(tocListIndex))
            articleFrame.prepend(insertSpacer(tocListIndex))
            articleFrame.prepend(emphasisContainer)
        } else {
            articleFrame.prepend(tocList)
        }

    });

    getElements('.on-this-page', (tocElement) => {
        tocList.prepend(insertSpacer(tocListIndex))
        tocList.append(insertSpacer(tocListIndex))
    });

    let tocTitle = document.createElement('span');
    tocTitle.setAttribute('class', 'csh-markdown csh-markdown-title csh-font-sans-semibold');
    tocTitle.setAttribute('data-type', '###');
    tocTitle.textContent = 'On this page';
    tocList.prepend(insertSpacer(tocListIndex))
    tocList.prepend(tocTitle);
}

copyLinkToHeading = () => {
    getElements('.csh-markdown-title', (titleElement) => {
        titleElement.removeAttribute('onClick');

        let wrapper = document.createElement('span');
        wrapper.setAttribute('class', 'heading-title-wrapper');

        titleElement.parentNode.insertBefore(wrapper, titleElement.nextSibling);
        wrapper.append(titleElement);

        let icon = document.createElement('span');
        icon.setAttribute('class', 'icon-copy-url');
        icon.prepend('🔖 ');
        titleElement.parentNode.insertBefore(icon, titleElement);

        wrapper.addEventListener('mouseenter', (e) => {
            icon.classList.add('hovered');
        });

        wrapper.addEventListener('mouseleave', (e) => {
            icon.classList.remove('hovered');
        });

        let iconConfirm = document.createElement('span');
        iconConfirm.setAttribute('class', 'icon-copy-url-confirm');
        iconConfirm.prepend('✅');
        titleElement.parentNode.append(iconConfirm);

        titleElement.addEventListener('click', (e) => {
            e.preventDefault();
            let directUri = `${titleElement.baseURI}#${titleElement.id}`
            navigator.clipboard.writeText(directUri)
                .then(() => {
                    iconConfirm.classList.add('hovered', 'confirmed');
                    setTimeout(function(){
                        iconConfirm.classList.remove('hovered', 'confirmed');
                    }, 2000)
                });
        });
    });
}

openChatByLink = () => {
    getElements('a[href="#openChat"', (openChatAnchor) => {
        openChatAnchor.setAttribute('data-target', 'open-chat');
        openChatAnchor.addEventListener('click', (e) => {
            e.preventDefault();
            $crisp.do('chat:open');
        });
    })
}

fancyLinks = () => {
    getElements('.csh-article-content-text a', (link) => {
        let onThisPageNode = link.parentNode.parentNode
        // console.log(link)
        if (link.getAttribute('data-target') !== 'open-chat') {
            link.setAttribute('data-target', 'link-anchor');
        } else if (link.getAttribute('data-target') === 'open-chat') {
            let chatIcon = document.createElement('span');
            chatIcon.prepend(' 💬')
            link.parentNode.insertBefore(chatIcon, link.nextSibling)
        }

        if (link.pathname.startsWith('/article/', 3) && onThisPageNode.className !== 'on-this-page') {
            let icon = document.createElement('span');
            icon.prepend(' 📚')
            link.parentNode.insertBefore(icon, link.nextSibling)
            link.setAttribute('data-target', 'link-helpdesk');
        } else if (link.hostname !== location.hostname) {
            let icon = document.createElement('span');
            icon.prepend(' 🔗')
            link.parentNode.insertBefore(icon, link.nextSibling)
            link.setAttribute('data-target', 'link-external');
        } else if (onThisPageNode.className === 'on-this-page') {
            let icon = document.createElement('span');
            icon.prepend(' 👇')
            link.parentNode.append(icon)
            link.setAttribute('data-target', 'link-anchor');
        } else if (link.getAttribute('data-target') === 'link-anchor' && onThisPageNode.className !== 'on-this-page') {
            let icon = document.createElement('span');
            const anchorHref = link.getAttribute('href');
            let targetId = anchorHref.replace('#', '');
            let targetElement = document.getElementById(targetId);
            let currentElementOffset = link.offsetTop;
            let targetElementOffset = targetElement.offsetTop;
            if (currentElementOffset < targetElementOffset) {
                icon.prepend(' 👇')
            } else {
                icon.prepend(' 👆')
            }
            link.parentNode.insertBefore(icon, link.nextSibling)
        }
    });
}

anchorLinkSmoothScroll = () => {
    getElements('a[href^="#"]', function (anchor) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const anchorHref = anchor.getAttribute('href');
            let scrollTo = anchorHref.replace('#', '');
            if (anchorHref !== '#openChat') {
                let element = document.getElementById(scrollTo);
                element.scrollIntoView({
                    behavior: 'smooth',
                });
            }
        })

    })
}

arrangeCustomCode = () => {
    let iteration = 0;
    let activeIteration = 0;
    let insideCodeBlock = false;
    let codeBlockStr = ' ';
    getElements('.csh-article-content-text', (articleFrame) => {
        let articleFrameNodeList = articleFrame.childNodes;
        let articleFrameNodeListArray = Array.from(articleFrameNodeList);

        articleFrameNodeListArray.filter((selectedNode, i) => {
            if (selectedNode.nodeType === 1) {
                return selectedNode.nodeType === 1;
            } else if (selectedNode.nodeType === 3) {
                return selectedNode.nodeType === 3;
            }
        }).forEach((filteredNode, i) => {
            iteration++;
            if (filteredNode.textContent === '<custom-code-block>') {
                let customCodeBlock = document.createElement('custom-code-block');
                customCodeBlock.setAttribute('data-id', `${iteration}`);
                let parentNode = filteredNode.parentNode;
                parentNode.insertBefore(customCodeBlock, filteredNode)
                filteredNode.remove();
                activeIteration = iteration;
                insideCodeBlock = true;
            } else if (filteredNode.textContent === '</custom-code-block>') {
                getElements(`custom-code-block[data-id="${activeIteration}"]`, (codeBlock, len) => {
                    codeBlock.innerHTML = codeBlockStr;
                    filteredNode.remove();
                    codeBlockStr = '';
                    insideCodeBlock = false;
                })
            } else if (insideCodeBlock === true) {
                let currentString = filteredNode.textContent;
                if (currentString.length) {
                    currentString = `${currentString}\n`;
                    codeBlockStr = codeBlockStr.concat(currentString);
                    codeBlockStr.concat(currentString);
                }
                if (filteredNode.nodeType === 3) {
                    filteredNode.remove();
                } else if (filteredNode.nodeType === 1 && filteredNode.nodeName === 'BR') {
                    filteredNode.remove();
                }
            }
        });
    });
}

function openChatByLinkAndSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            if (this.getAttribute('href') === '#openChat') {
                $crisp.do('chat:open');
            } else if (this.getAttribute('href') !== '#_') {
                let selector = this.getAttribute('href');
                let scrollTo = selector.replace('#_', '');
                let element = document.getElementById(scrollTo);

                if (this.getAttribute('href') === '#hiddeMessage') {
                    $('#hiddeMessage').show();
                }

                element.scrollIntoView({
                    behavior: 'smooth',
                });
            }
        });
    });
    // $('.csh-markdown-title').removeAttr('onclick');
    $('.csh-markdown-title').on('click', function (event) {
        event.preventDefault();
        let element = document.getElementById(this.getAttribute('id'));
        element.scrollIntoView({
            behavior: 'smooth',
        });
    });
}

function scrollToOnPageLoad() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        $(anchor).attr('href', $(anchor).attr('href').replace('#', '#_'));
    });

    let hashName = window.location.hash.replace('#_', '');
    let elem = document.getElementById(hashName);

    if (elem) {
        elem.scrollIntoView({
            behavior: 'smooth',
        });
    }
}


function backToTop() {
    let elementHTML = `
      <section class="back-to-top">
        <div class="csh-text-wrap">
          <a href="#" id="backToTop" class="csh-theme-background-color-default csh-font-sans-semibold custom-btn btn-back-to-top">☝ Back to Top ☝</a>
          <div id="hiddenMessage">
            <h6 class="csh-font-sans-semibold">Woohoo! You found the Back to Top button 🥳</h6>
          </div>
        </div>
      </section>
      `;
    $(elementHTML).appendTo('.csh-article-content');

    $('#backToTop').click(function (e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    defineCustomElements();
    changeMarkdownTitleId();
    // locationHash();
    onThisPage();
    copyLinkToHeading();
    openChatByLink();

    fancyLinks();
    anchorLinkSmoothScroll();

    arrangeCustomCode();
    // openChatByLinkAndSmoothScroll();
    // backToTop();

    // scrollToOnPageLoad();

    Prism.highlightAll();
    Prism.plugins.NormalizeWhitespace.setDefaults({
        'remove-trailing': true,
        'remove-indent': true,
        'left-trim': true,
        'right-trim': true,
        /*'break-lines': 80,
      'indent': 2,
      'remove-initial-line-feed': false,
      'tabs-to-spaces': 4,
      'spaces-to-tabs': 4*/
    });
});