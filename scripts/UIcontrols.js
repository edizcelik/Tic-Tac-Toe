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