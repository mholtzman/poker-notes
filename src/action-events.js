const actionEvent = (action, amount, player) => ({ action, amount, player });
const foldEvent = actionEvent.bind(null, "fold", 0);
const checkEvent = actionEvent.bind(null, "check", 0);
const postEvent = actionEvent.bind(null, "post");
const callEvent = actionEvent.bind(null, "call");
const betEvent = actionEvent.bind(null, "bet");
const raiseEvent = actionEvent.bind(null, "raise");

const add = (streetAction, actionEvent) => [...streetAction, actionEvent];
const addAll = (streetAction, actionEvents) => [...streetAction, ...actionEvents];
const last = actions => actions.slice().pop();
const defaultAction = lastEvent => (!lastEvent && checkEvent) || foldEvent;



export {
    foldEvent as Fold,
    checkEvent as Check,
    postEvent as Post,
    callEvent as Call,
    betEvent as Bet,
    raiseEvent as Raise
};

export default {
    add,
    addAll,
    last,
    defaultAction
};