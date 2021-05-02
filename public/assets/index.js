function getParameters(defaults = {}) {
    const params = defaults;
    for (const raw of window.location.search.substring(1).split('&')) {
        pair = raw.split('=');
        let name = decodeURIComponent(pair[0]);
        const value = decodeURIComponent(pair[1].replaceAll('+', ' '));
        if (name.substr(name.length - 2, 2) === '[]') {
            name = name.substr(0, name.length - 2);
            if (!params[name]) {
                params[name] = [];
            }
            params[name].push(value);
        } else {
            params[name] = value;
        }
    }
    return params;
}

function camelCase(raw) {
    let CamelCase = raw
        .split(/\s+/)
        .map(part => part && part.length ? part.charAt(0).toUpperCase() + part.substr(1) : part)
        .join('');
    CamelCase = CamelCase
        .split('-')
        .map(part => part && part.length ? part.charAt(0).toUpperCase() + part.substr(1) : part)
        .join('');
    if (CamelCase.charAt(0).match(/[0-9]/)) {
        return `_${CamelCase}`;
    } else {
        return CamelCase.charAt(0).toLowerCase() + CamelCase.substr(1);
    }
}

function addTagsColumn() {
    const button = document.querySelector('#add');
    const input = document.createElement('input');
    input.name = 'tags[]';
    input.type = 'text';
    button.parentElement.insertBefore(input, button);
}

function pushUnique(array, candidates) {
    for (let candidate of candidates) {
        candidate = candidate.trim();
        if (candidate && !array.includes(candidate)) {
            array.push(candidate);
        }
    }
}

async function loadSheet() {
    const raw = await (await fetch(`sheets.php${window.location.search}`)).json();
    const headings = raw.shift();
    for (let i = 0; i < headings.length; i++) {
        headings[i] = headings[i].trim();
    }
    for (const entry of raw) {
        const parsed = {};
        for (let i = 0; i < entry.length; i++) {
            parsed[headings[i]] = entry[i];
            if (params.tags.includes(headings[i])) {
                if (!tagGroups[headings[i]]) {
                    tagGroups[headings[i]] = [];
                }
                pushUnique(tagGroups[headings[i]], entry[i].split(','));
            }
        }
        data.push(parsed);
    }
}

function generateTagStyles() {
    const style = document.createElement('style');
    document.querySelector('head').appendChild(style);
    const names = Object.getOwnPropertyNames(tagGroups).map(name => camelCase(name));
    for (let i = 0; i < names.length; i++) {
        style.innerHTML = `${style.innerHTML}
        .${names[i]}.tag {
           --hue: calc(${i} * (360 / ${names.length}));
           --dark: hsl(var(--hue), 20%, 10%);
           --light: hsl(var(--hue), 80%, 90%);
           color: var(--dark);
           border-color: var(--dark);
           background: var(--light);
        }`;
    }
}

function filterByTag(tagGroup, tag) {
    document.querySelectorAll('.tag').forEach(tag => tag.classList.add('hide'));
    for (const entry of document.querySelectorAll('#entries > *:not(.hide)')) {
        if (!entry.dataset[tagGroup] || entry.dataset[tagGroup].indexOf(tag) < 0) {
            entry.classList.add('hide');
        } else if (entry.dataset[tagGroup]) {
            entry.querySelectorAll('.tag')
                .forEach(tag => { // jshint ignore:line
                    document.querySelectorAll(`.${tag.className.split(/\s+/).join('.')}`)
                        .forEach(other => other.classList.remove('hide'))
                });
        }
    }
}

function resetFilter() {
    for (const element of document.querySelectorAll('.hide')) {
        element.classList.remove('hide');
    }
}

function format(data, params) {
    const entries = document.createElement('div');
    entries.id = 'entries';
    for (const entry of data) {
        const dataset = {};
        if (params.format) {
            const element = document.createElement('div');
            let parsed = params.format;
            for (const field of Object.getOwnPropertyNames(entry)) {
                let value = entry[field];
                if (params.tags.includes(field)) {
                    value = `<span class="${camelCase(field)} tags">${entry[field]
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(tag => tag.length > 0)
                        .map(tag => `<a class="${camelCase(field)} ${camelCase(tag)} tag" href="javascript:filterByTag('${camelCase(field)}', '${tag}')">${tag}</a>`) // jshint ignore:line
                        .join('')}</span>`;
                    dataset[camelCase(field)] = entry[field];
                }
                parsed = parsed.replaceAll(`{${field}}`, value.trim());

            }
            entries.appendChild(element);
            element.outerHTML = parsed;
            for (const attr in dataset) {
                entries.lastElementChild.dataset[attr] = dataset[attr];
            }
        }
    }
    return entries;
}

function toolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'toolbar';
    toolbar.innerHTML = `<h1>${params.title}</h1>`;
    const groups = document.createElement('div');
    groups.id = 'tags';
    toolbar.appendChild(groups);
    const button = document.createElement('button');
    groups.appendChild(button);
    button.outerHTML = '<button type="button" onclick="resetFilter()">Reset Filter</button>';
    for (const name of Object.getOwnPropertyNames(tagGroups)) {
        const container = document.createElement('div');
        container.classList.add(camelCase(name));
        container.classList.add('tags');
        groups.appendChild(container);
        for (const tag of tagGroups[name].sort()) {
            const element = document.createElement('span');
            container.appendChild(element);
            element.outerHTML = `<a class="${camelCase(name)} ${camelCase(tag)} tag" href="javascript:filterByTag('${camelCase(name)}', '${tag}')">${tag}</a>`;
        }
    }
    return toolbar;
}

async function onLoad() {
    if (!params.edit && window.location.search) {
        await loadSheet();
        params = getParameters({
            title: 'Sheet Viewer',
            format: `<div>${Object.getOwnPropertyNames(data[0]).map(field => `<span>{${field}</span>`)}</div>`
        });
        generateTagStyles();
        const body = document.createElement('div');
        body.id = 'body';
        const _toolbar = toolbar();
        body.appendChild(_toolbar);
        const entries = format(data, params);
        body.appendChild(entries);
        document.querySelector('#body').replaceWith(body);
        entries.style.paddingTop = 'calc(1em + ' + _toolbar.clientHeight + 'px)';
    }
}

let params = getParameters();
const data = [];
const tagGroups = {};
