
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

