let lastAction = null;
let isUndoAction = false
export const getLastAction = () => lastAction;
export const getIsUndoAction = () => isUndoAction;
export const lastActionMiddleware = store => next => action => {
    if (action.type == "@@redux-undo/UNDO" || action.type == "@@redux-undo/REDO") {
        isUndoAction = true
        setTimeout(() => isUndoAction = false, 1000)
    }
    lastAction = action;
    return next(action);
}