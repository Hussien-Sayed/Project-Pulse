
            export const BrowserWindow = class {
                constructor(opts) { this.opts = opts; this.events = {}; }
                loadFile(f) { this.file = f; }
                on(e, cb) { this.events[e] = cb; }
                focus() {}
                isVisible() { return true; }
                hide() {}
                show() {}
                close() { if(this.events['closed']) this.events['closed'](); }
            };
        