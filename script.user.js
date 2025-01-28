// ==UserScript==
// @name         Minefort drop plugins
// @namespace    http://tampermonkey.net/
// @version      2024-07-17
// @description  Add a drop area on the minefort console area to make it easier to upload plugins
// @author       xpncvr
// @match        https://minefort.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=minefort.com
// ==/UserScript==

(function() {
    'use strict';

    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    function displayNotification(successful) {

        const statusColor = (successful ? 'green' : 'red');

        const containerDiv = document.createElement('div');
        containerDiv.setAttribute('data-v-183af347', '');
        containerDiv.className = 'custom-z fixed right-5 top-5 space-y-3 overflow-y-auto scrollbar-none';

        const contentDiv = document.createElement('div');
        contentDiv.setAttribute('data-v-183af347', '');
        contentDiv.className = `relative flex w-[460px] max-w-sm overflow-hidden rounded-lg border-2 bg-zinc-950 bg-gradient-to-t p-4 shadow-lg ring-4 backdrop-blur-lg border-${statusColor}-900 from-${statusColor}-600/20 via-${statusColor}-900/20 to-zinc-950 ring-${statusColor}-600/10`;

        const svgContainerDiv = document.createElement('div');
        svgContainerDiv.setAttribute('data-v-183af347', '');
        svgContainerDiv.className = 'absolute -left-6 -top-6 z-[-1] opacity-10';
        svgContainerDiv.innerHTML = `<svg data-v-183af347="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-slot="icon" class="h-20 text-${statusColor}-500"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd"></path></svg>`;

        const textContainerDiv = document.createElement('div');
        textContainerDiv.setAttribute('data-v-183af347', '');
        textContainerDiv.className = 'flex-1 pl-2';
        textContainerDiv.innerHTML = `<p data-v-183af347="" class="mb-2 font-display text-lg font-medium leading-none text-color-100">${successful ? 'Upload successful' : 'Whoopsie!'}</p>
<p data-v-183af347="" class="text-sm text-color-700">${successful ? 'The plugin has been successfully uploaded.' : 'Whoopsie! There was an error uploading the plugin.'}</p>`;

        const closeButton = document.createElement('button');
        closeButton.setAttribute('data-v-183af347', '');
        closeButton.setAttribute('type', 'button');
        closeButton.className = 'flex rounded-md transition hover:bg-white/10';
        closeButton.innerHTML = `<span data-v-183af347="" class="sr-only">Close</span>
<svg data-v-183af347="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-slot="icon" class="h-5 w-5"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg>`;

        const progressBarContainerDiv = document.createElement('div');
        progressBarContainerDiv.setAttribute('data-v-183af347', '');
        progressBarContainerDiv.className = 'absolute inset-x-0 bottom-0 h-[2px] bg-white/5';

        const progressBarDiv = document.createElement('div');
        progressBarDiv.setAttribute('data-v-183af347', '');
        progressBarDiv.className = 'animation-timeout absolute inset-x-0 bottom-0 h-[2px] bg-white/60';
        progressBarDiv.style.animationDuration = '5000ms';

        contentDiv.appendChild(svgContainerDiv);
        contentDiv.appendChild(textContainerDiv);
        contentDiv.appendChild(closeButton);
        progressBarContainerDiv.appendChild(progressBarDiv);
        contentDiv.appendChild(progressBarContainerDiv);

        containerDiv.appendChild(contentDiv);

        document.body.appendChild(containerDiv);

        function removeContainerDiv() {
            if (containerDiv) {
                containerDiv.remove();
            }
        }

        setTimeout(removeContainerDiv, 5000);

        closeButton.addEventListener('click', removeContainerDiv);
    }


    function getServerIdFromUrl() {
        var url = window.location.href;
        var parts = url.split('/');
        return parts[parts.indexOf('servers') + 1];
    }

    const parent = document.createElement('div');
    parent.classname = "space-y-4";

    document.body.appendChild(parent);

    const dropArea = document.createElement('div');
    dropArea.innerHTML = 'Drag and drop plugins here or click to upload';
    dropArea.className = "bg-gradient-to-r from-minefort-800/40 via-minefort-800/60 to-minefort-800 sm:rounded-lg";
    dropArea.style.height = "200px";
    parent.appendChild(dropArea);


    function handleFileUpload(file) {
        const formData = new FormData();
        formData.append('files[]', file);

        const serverId = getServerIdFromUrl();

        uploadFile(serverId, formData)
            .then((success) => {
            if (success) {
                displayNotification(true);
            } else {
                displayNotification(false);
            }
        });
    }

    dropArea.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.style.display = 'none';

        input.click();

        input.addEventListener('change', async () => {
            const file = input.files[0];
            handleFileUpload(file);
        });
    });

    dropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    dropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
    });

    async function uploadFile(serverId, formData) {
        try {
            const response = await fetch("https://api.minefort.com/v1/server/" + serverId + "/files/upload?path=root.plugins", {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Alt-Used': 'api.minefort.com',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-site',
                },
                body: formData,
                mode: 'cors'
            });

            if (response.ok) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            return false;
        }
    }



    setInterval(function() {
        var parentElement = document.getElementsByClassName("space-y-4 lg:col-span-2")[0];
        if (parentElement && !parentElement.contains(dropArea)) {
            parentElement.appendChild(dropArea);
        }
    }, 1000);


})();
