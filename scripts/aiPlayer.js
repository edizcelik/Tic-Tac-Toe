
/*
 *
 * AI Player
 *
 */

//action that ai would make
 const AIAction = function(pos) {
 	this.movePosition = pos;

 	//minimax value that action leads to
 	this.minimaxVal = 0;

 	this.applyTo = function(state) {
 		const next = new State(state);

 		next.board[this.movePosition] = state.turn;

 		if (state.turn === globalObject.aiSymbol) {
 			//increment the move count
 			next.aiMovesCount++;
 		}

 		next.advanceTurn();

 		return next;
 	};
 };

 //functions that sorts the actions (to be used in Array.prototype.sort()): 
 
 //ascending sort
 AIAction.ascending = function(firstAction, secondAction) {
 	if (firstAction.minimaxVal < secondAction.minimaxVal) {
 		return -1; //firstAction goes before secondAction
 	} 
 	else if (firstAction.minimaxVal > secondAction.minimaxVal) {
 		return 1; //firstAction goes after secondAction
 	}
 	else {
 		//draw
 		return 0;
 	}
 };

//descending sort
AIAction.descending = function(firstAction, secondAction) {
 	if (firstAction.minimaxVal > secondAction.minimaxVal) {
 		return -1; //firstAction goes before secondAction
 	} 
 	else if (firstAction.minimaxVal < secondAction.minimaxVal) {
 		return 1; //firstAction goes after secondAction
 	}
 	else {
 		//draw
 		return 0;
 	}
 };


 //AI Player
 const AI = function() {
 	let game = {};

 	function minimaxValue(state) {
 		if (state.isTerminal()) {
 			return Game.score(state);
 		} else {
 			let stateScore;

 			if (state.turn === globalObject.humanSymbol) {
 				//human wants to maximize. So we give a very small initial value
 				stateScore = -1000;
 			} else {
 				//ai wants to minimize
 				stateScore = 1000;
 			}

 			const availablePositions = state.emptyCells();

 			//next available states
 			const availableNextStates = availablePositions.map(pos => {
 				const action = new AIAction(pos);

 				const nextState = action.applyTo(state);

 				return nextState;
 			});

 			//calculate the minimax value recursively for all available next state
 			availableNextStates.forEach(nextState => {
 				const nextScore = minimaxValue(nextState);
 				if (state.turn === globalObject.humanSymbol) {
 					//human maximize; if nextScore is greater than it will want to make that move leading to greater score for him
 					if (nextScore > stateScore)
 						stateScore = nextScore;
 				}
 				else {
 					//ai minimize
 					if (nextScore < stateScore)
 						stateScore = nextScore;
 				}
 			});

 			return stateScore;
 		}
 	}

 	function aiTakeMove(symbol) {
 		//available states
 		const available = game.currentState.emptyCells();

 		let availableActions = available.map(pos => {
 			const action = new AIAction(pos);
 			const next = action.applyTo(game.currentState);

 			//minimax value of the action
 			action.minimaxVal = minimaxValue(next);

 			return action;
 		});

 		if (symbol === globalObject.humanSymbol) {
 			//human maximizes
 			availableActions.sort(AIAction.descending);
 		} else {
 			//ai minimizes
 			availableActions.sort(AIAction.ascending);
 		}

 		const chosenAction = availableActions[0]; //chooses the most optimal action
 		const next = chosenAction.applyTo(game.currentState);

 		ui.insertAt(chosenAction.movePosition, symbol);

 		game.advanceTo(next);
 	}

 	//tell which game it plays
 	this.plays = function(_game) {
 		game = _game;
 	};

 	//notify that it is its turn
 	this.notify = function(symbol) {
 		aiTakeMove(symbol);
 	};
 };