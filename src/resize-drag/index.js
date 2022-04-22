import {throttle} from 'throttle-debounce';

export default class ResizeDrag {

    constructor(el, api, {onStartDrag, onEndDrag, onDrag}) {
        this.el = el;
        this.api = api;
        this.updateHeight = throttle(100, this.updateHeight, {noLeading: false, noTrailing: false});
        this.callback = {onStartDrag, onEndDrag, onDrag};
        this.isDownBottom = false;
        this.mouseStartPos = {};

        this.bindEvent();
    }

    bindEvent() {
        const bottom = this.el.querySelector('.gutter.gutter-bottom');
        this.api.listeners.on(bottom, 'mousedown', (e) => {
            this.isDownBottom = true;
            this.mouseStartPos.x = e.clientX;
            this.mouseStartPos.y = e.clientY;
            e.stopPropagation();

            if (this.callback.onStartDrag) {
                this.callback.onStartDrag();
            }
        }, false);


        let oph = this.el.offsetHeight;
        this.api.listeners.on(document, 'mouseup', () => {
            if (!this.isDownBottom) {
                return;
            }
            this.isDownBottom = false;
            oph = this.el.offsetHeight;
            if (this.callback.onEndDrag) {
                this.callback.onEndDrag();
            }
        });

        this.api.listeners.on(document, 'mousemove', (e) => {
            if (!this.isDownBottom) {
                return;
            }
            const offset = parseInt((e.clientY - this.mouseStartPos.y) * 1.2);
           this.doResize(offset + oph);
        });
    }

    doResize(height) {
        if (height <= 300) {
            return;
        }
        if (this.callback.onDrag) {
            this.callback.onDrag({meta: {height}});
        }
        this.updateHeight(height);
    }

    updateHeight(height) {
        this.el.style.height = height + 'px';
    }
}