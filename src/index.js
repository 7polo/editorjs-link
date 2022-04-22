import './index.less';
import ResizeDrag from './resize-drag';
import {debounce} from 'throttle-debounce';

export default class Link {

    static get isReadOnlySupported() {
        return true;
    }

    static get toolbox() {
        return {
            icon: `<svg width="13" height="14" xmlns="http://www.w3.org/2000/svg">
  <path d="M8.567 13.629c.728.464 1.581.65 2.41.558l-.873.873A3.722 3.722 0 1 1 4.84 9.794L6.694 7.94a3.722 3.722 0 0 1 5.256-.008L10.484 9.4a5.209 5.209 0 0 1-.017.016 1.625 1.625 0 0 0-2.29.009l-1.854 1.854a1.626 1.626 0 0 0 2.244 2.35zm2.766-7.358a3.722 3.722 0 0 0-2.41-.558l.873-.873a3.722 3.722 0 1 1 5.264 5.266l-1.854 1.854a3.722 3.722 0 0 1-5.256.008L9.416 10.5a5.2 5.2 0 0 1 .017-.016 1.625 1.625 0 0 0 2.29-.009l1.854-1.854a1.626 1.626 0 0 0-2.244-2.35z" transform="translate(-3.667 -2.7)"/>
</svg>
`,
            title: 'Link',
        };
    }

    static get enableLineBreaks() {
        return true;
    }

    constructor({data, config, api, readOnly}) {
        this.api = api;
        this.readOnly = readOnly;

        this.nodes = {
            container: null,
            inputHolder: null,
            previewHolder: null,
            input: null
        };

        this._data = {
            link: '',
            meta: {}
        };

        this.data = data;
    }

    render() {
        this.nodes.container = this.make('div', [this.api.styles.block, 'link-tool']);

        this.nodes.inputHolder = this.makeInputHolder();
        this.nodes.previewHolder = this.prepareLinkPreview();

        this.nodes.container.appendChild(this.nodes.previewHolder);
        this.nodes.container.appendChild(this.nodes.inputHolder);

        this.freshPreview(this.data);

        return this.nodes.container;
    }

    save() {
        return this.data;
    }

    validate() {
        return this.data.link.trim() !== '';
    }

    set data(data) {
        this._data = Object.assign({}, {
            link: data.link || this._data.link,
            meta: data.meta || this._data.meta,
        });
    }

    get data() {
        return this._data;
    }

    makeInputHolder() {
        const inputHolder = this.make('div', 'link-tool__input-holder');
        this.nodes.input = this.make('div', [this.api.styles.input, 'link-tool__input'], {
            contentEditable: !this.readOnly
        });
        this.nodes.input.textContent = this.data.link;

        this.nodes.input.dataset.placeholder = this.api.i18n.t('Link');

        if (!this.readOnly) {
            this.nodes.input.addEventListener('paste', (event) => {
                this.startFetching(event);
            });

            this.nodes.input.addEventListener('keydown', (event) => {
                switch (event.keyCode) {
                    case 13:
                        event.preventDefault();
                        event.stopPropagation();
                        this.startFetching(event);
                        break;
                }
            });
        }
        inputHolder.appendChild(this.nodes.input);
        return inputHolder;
    }


    /**
     * Prepare link preview holder
     *
     * @returns {HTMLElement}
     */
    prepareLinkPreview() {
        const holder = this.make('div', ['link-tool__preview-holder', 'ce-block__focused-area']);
        holder.dataset.mutationFree = true;

        this.nodes.previewer = this.make('iframe', 'third-party-iframe', {
            frameborder: 0,
            sandbox: 'allow-forms allow-orientation-lock allow-presentation ' +
                'allow-same-origin allow-scripts allow-popups allow-downloads'
        });
        const gutter = this.make('div', ['link-tool__gutter', 'gutter', 'gutter-bottom']);
        holder.appendChild(this.nodes.previewer);
        holder.appendChild(gutter);

        if (this.data.meta.height) {
            holder.style.height = this.data.meta.height;
        }
        new ResizeDrag(holder, this.api, {
            onStartDrag: () => {
                this.nodes.container.classList.add('dragging');
            },
            onEndDrag: () => {
                this.nodes.container.classList.remove('dragging');
            },
            onDrag: debounce(1000, false, (data) => this.freshPreview(data)),
        });
        return holder;
    }

    startFetching(event) {
        let url = this.nodes.input.textContent;

        if (event.type === 'paste') {
            url = (event.clipboardData || window.clipboardData).getData('text');
        }
        this.freshPreview({link: url});
    }

    freshPreview(data) {
        console.log(data);
        if (data.link) {
            this.nodes.previewer.setAttribute('src', data.link);
        }
        this.data = Object.assign(this.data, data);
    }

    /**
     * Helper method for elements creation
     *
     * @param tagName
     * @param classNames
     * @param attributes
     * @returns {HTMLElement}
     */
    make(tagName, classNames = null, attributes = {}) {
        const el = document.createElement(tagName);

        if (Array.isArray(classNames)) {
            el.classList.add(...classNames);
        } else if (classNames) {
            el.classList.add(classNames);
        }

        for (const attrName in attributes) {
            el[attrName] = attributes[attrName];
        }

        return el;
    }
}
