class LineStudier {
  constructor(chessBoard) {
    this.chessBoard_ = chessBoard;
    this.chess_ = new Chess();
    this.studyState_ = null;
  }

  study(line) {
    // Cancel the pending completion promise.
    if (this.studyState_ && !this.studyState_.isComplete) {
      this.studyState_.completionPromiseResolveFn(false);
    }

    var studyState = new StudyState_(line);
    this.chess_.load(line.startPosition);
    var completionPromise = new Promise(function(resolve, reject) {
      studyState.completionPromiseResolveFn = resolve;
    });
    this.studyState_ = studyState;

    this.chessBoard_.setOrientationForColor(line.color);
    this.updateBoard_();

    if (line.opponentFirstMove) {
      this.applyMove_(line.opponentFirstMove);
      setTimeout(
          this.updateBoard_.bind(this), Config.OPPONENT_FIRST_MOVE_DELAY_MS);
    }
    return completionPromise;
  }

  tryMove(move) {
    if (!this.studyState_ || this.studyState_.isComplete) {
      console.error('Inappropripate call to tryMove.');
      return null;
    }

    var expectedMove = this.studyState_.line.moves[this.studyState_.moveIndex];
    if (!move.equals(expectedMove)) {
      this.updateBoard_();
      return;
    }

    this.applyMove_(expectedMove);
    this.updateBoard_();
    if (this.studyState_.moveIndex >= this.studyState_.line.moves.length - 2) {
      // TODO(jven): Prevent subsequent moves on the board when the line is
      // complete.
      this.studyState_.isComplete = true;
      this.studyState_.completionPromiseResolveFn(true);
      return;
    }

    var opponentReply =
        this.studyState_.line.moves[this.studyState_.moveIndex + 1];
    this.applyMove_(opponentReply);
    this.studyState_.moveIndex += 2;
    setTimeout(this.updateBoard_.bind(this), Config.OPPONENT_REPLY_DELAY_MS);
  }

  applyMove_(move) {
    this.chess_.move({
      from: move.fromSquare,
      to: move.toSquare,
      promotion: 'q'
    });
  }

  updateBoard_() {
    this.chessBoard_.setStateFromChess(this.chess_);
  }
}

class StudyState_ {
  constructor(line) {
    this.line = line;
    this.moveIndex = 0;
    this.isComplete = false;
    this.completionPromiseResolveFn = null;
  }
}