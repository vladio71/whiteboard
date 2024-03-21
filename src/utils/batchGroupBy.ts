import {groupByActionTypes} from 'redux-undo'
import {v4 as uuidv4} from 'uuid';
import {extend} from "dayjs";

let start, end


export const batchGroupBy = {
    _group: null,
    _timeout: null,
    _isEnding: false,
    _confirmTimeOut: null,
    start(group = uuidv4()) {
        if (this._group === null) {
            this._isEnding = false
            this._group = group;
        }
    },
    confirmEnd() {
        this._isEnding = true
        this._confirmTimeOut = setTimeout(() => {
            this._group = null
            this._isEnding = false
        }, 150)
    },
    end() {
        // console.log('end, isEnding: ', this._isEnding)
        if (this._isEnding) {
            if (this._timeout)
                clearTimeout(this._timeout)
            if (this._confirmTimeOut)
                clearTimeout(this._confirmTimeOut)
            this._timeout = setTimeout(() => {
                this._group = null
                this._isEnding = false
            }, 100)
        }
    },
    init(rawActions) {
        const defaultGroupBy = groupByActionTypes(rawActions)
        return (action) => this._group || defaultGroupBy(action)
    }
};