/*
 * Controls
 *  
 * Get the human symbol from user's selection, default is 'X'
 */


//default globalObject to be modified accordingly as the game goes on
const globalObject = {
	humanSymbol: 'X',
	aiSymbol: 'O',
	human: 0,
	ai: 0
};

$('.symbolBtn').on('click', function() {
	const $this = $(this);
	if (!$this.hasClass('selected')) {
		$('.symbolBtn.selected').toggleClass('selected');
		$this.toggleClass('selected');
	}
	const humanSymbol = $this.text().trim();
	globalObject.humanSymbol = humanSymbol;

	//set the ai symbol accordingly
	globalObject.aiSymbol = (globalObject.humanSymbol === "X") ? "O" : "X";
});

$('.startBtn').on('click', function() {
	const $this = $(this);
	if (!$this.hasClass('blackened')) {
		/* Add classes to button to indicate they shouldn't be clicked during the game */
		$this.addClass('blackened');
		$('.symbolBtn').addClass("blackened");

		//instantiate the ai player and set it as the autoPlayer
		const aiPlayer = new AI();
		globalObject.game = new Game(aiPlayer);

		console.log(globalObject.game.status);

		//tell ai that it plays this game
		aiPlayer.plays(globalObject.game);

		//start the game
		globalObject.game.start();
	}
});

$('.cell').each(function() {
	let $this = $(this);
	$this.on('click', function() {
		if (globalObject.game.status !== "ended" && !$this.hasClass('occupied')) {
			console.log($this[0].dataset.index);
			const cellIndex = $this[0].dataset.index; //note; type returned is string
			
			//instantiate the game state
			const next = new State(globalObject.game.currentState);

			//fill in the board array
			next.board[cellIndex] = globalObject.humanSymbol;
			//insert the symbol to the view
			ui.insertAt(cellIndex, globalObject.humanSymbol);

			//advance the turn
			next.advanceTurn();
			globalObject.game.advanceTo(next);
		}
	});
});

/* ui Object */
const ui = {
	currentView: ""
};

ui.insertAt = function(index, symbol) {
	const board = $('.cell');
	const targetCell = $(board[index]);

	if (!targetCell.hasClass('occupied')) {
		(symbol === "X") ? targetCell.addClass("x") : targetCell.addClass("o");
		targetCell.html(symbol);
		targetCell.addClass('occupied');
	}
};

ui.switchViewTo = function(turn) {
	function _switch(_turn) {
		ui.currentView = "#" + _turn;
		$(ui.currentView).fadeIn("slow");

		if (_turn === "aiTurn") {
			$(ui.currentView).fadeOut("fast");
		}
	}

	if (globalObject.game.status === "beginning") {
		_switch(turn);
	} else {
		$(ui.currentView).fadeOut({
			duration: "slow",
			done: function() {
				_switch(turn);
			}
		});
	}
};


/*
 * Representation of the Game:
 */

 //constructor for a game state
 const State = function(old) {
 	//whose turn is it
 	this.turn = "";

 	//count the moves made by ai player
 	this.aiMovesCount = 0;

 	//result of the game in this state
 	this.result = "running";

 	//board configuration
 	this.board = [];

 	if (typeof old !== "undefined") {
 		//copy the old state into this state
 		this.turn = old.turn;
 		this.aiMovesCount = old.aiMovesCount;
 		this.result = old.result;

 		const len = old.board.length;
 		this.board = new Array(len);
 		for (let i=0; i < len; i++) {
 			this.board[i] = old.board[i];
 		}
 	}

 	//advance the turn
 	this.advanceTurn = function() {
 		this.turn = this.turn === globalObject.humanSymbol ? globalObject.aiSymbol : globalObject.humanSymbol;
 	};

 	//the empty cells on the board
 	this.emptyCells = function() {
 		const indices = [];
 		for (let i=0; i<9; i++) {
 			if (this.board[i] === "E") {
 				indices.push(i);
 			}
 		}
 		return indices;
 	};

 	//check if the state is a terminal state
 	this.isTerminal = function() {
 		const board = this.board;
 		let winner = "";

 		//rows
 		for (let i=0; i <= 6; i = i+3) {
 			if (board[i] !== "E" && board[i] === board[i+1] && board[i+1] === board[i+2]){
 				winner = (board[i] === globalObject.humanSymbol) ? "human" : "ai";
 				this.result = winner +"-won";
 				return true;
 			}
 		}

 		//columns
 		for (let i=0; i <= 2; i++) {
 			if (board[i] !== "E" && board[i] === board[i+3] && board[i+3] === board[i+6]) {
 				winner = (board[i] === globalObject.humanSymbol) ? "human" : "ai";
 				this.result = winner +"-won";
 				return true;
 			}
 		}

 		//diagonals
 		for (let i=0, j=4; i <= 2; i = i+2, j = j-2) {
 			if (board[i] !== "E" && board[i] === board[i+j] && board[i+j] === board[i+2*j]) {
 				winner = (board[i] === globalObject.humanSymbol) ? "human" : "ai";
 				this.result = winner +"-won";
 				return true;
 			}
 		}

 		//if no-one wins, chech the emptyCells
 		const available = this.emptyCells();
 		if (available.length === 0) {
 			//no empty cells left, it's a draw
 			this.result = "draw";
 			return true;
 		}
 		else {
 			//otherwise, game continues
 			return false;
 		}
 	};
 };

 //the Game class
const Game = function(autoPlayer) {
	this.ai = autoPlayer;

	this.currentState = new State();
	this.currentState.board = ["E", "E", "E",
							   "E", "E", "E",
							   "E", "E", "E"];
	//human plays first
	this.currentState.turn = globalObject.humanSymbol;

	//game status
	this.status = "beginning";

	//advance the game
	this.advanceTo = function(state) {
		this.currentState = state;
		if(state.isTerminal()) {
			this.status = "ended";

			/* Remove classes from buttons to indicate the game has ended and that the user can make selections again */
			$('.startBtn').removeClass('blackened');
			$('.symbolBtn').removeClass("blackened");

			if (state.result === "human-won") {
				globalObject.human++;
				ui.switchViewTo("won");
			}
			else if (state.result === "ai-won") {
				globalObject.ai++;
				ui.switchViewTo("lost");
			}
			else {
				ui.switchViewTo("draw");
			}

			//update the score on the view
			$("#finalScore").html(`
					<span> ${globalObject.human} </span>
					<span> &mdash; </span>
					<span> ${globalObject.ai} </span>
				`);

			/* Clear out everything on the view after a game ends, so a new game can start */
			setTimeout(function() {
				$('.cell').each(function() {
					const $this = $(this);
					$this.html("");
					if ($this.hasClass("o")) $this.removeClass("o");
					if ($this.hasClass("x")) $this.removeClass("x");
					if ($this.hasClass("occupied")) $this.removeClass("occupied");
				});
				$('.during').each(function() {
					const $this = $(this);
					$this.fadeOut("fast");
				});
			}, 1500);
		} else {
			if (this.currentState.turn === globalObject.humanSymbol) {
				ui.switchViewTo("humanTurn");
			} else {
				ui.switchViewTo("aiTurn");
				//notify ai that it is its turn
				this.ai.notify(globalObject.aiSymbol);
			}
		}
	};

	//start the game
	this.start = function() {
		if (this.status = "beginning") {
			this.advanceTo(this.currentState);
			this.status = "running";
		}
	};
};

//calculate the score of the human player in a given terminal state
Game.score = function(state) {
	if (state.result === "human-won") {
		//human wins, ai resist by making as much as moves it can
		return 10 - state.aiMovesCount;
	} else if (state.result === "ai-won") {
		//ai wins, ai needs to win by making as least moves as it can
		return -10 + state.aiMovesCount;
	} else {
		//draw
		return 0;
	}
};


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