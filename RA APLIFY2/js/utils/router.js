// ========================== //
// RAPLIFY - Router          //
// ========================== //

const Router = {
    _routes: {},
    _currentRoute: null,
    _history: [],

    register(path, handler) {
        this._routes[path] = handler;
    },

    navigate(path, params = {}) {
        if (this._currentRoute) {
            this._history.push(this._currentRoute);
        }
        this._currentRoute = { path, params };
        this._render(path, params);
    },

    back() {
        if (this._history.length > 0) {
            const prev = this._history.pop();
            this._currentRoute = prev;
            this._render(prev.path, prev.params);
        }
    },

    _render(path, params) {
        const handler = this._routes[path];
        if (handler) {
            const content = document.getElementById('app-content');
            content.innerHTML = '';
            content.className = 'page-enter';
            handler(content, params);
        }
    },

    getCurrentRoute() {
        return this._currentRoute;
    },

    clearHistory() {
        this._history = [];
        this._currentRoute = null;
    }
};
