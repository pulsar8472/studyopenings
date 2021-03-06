import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import { Key } from 'chessground/types';
import { Color } from '../../../protocol/color';
import { SoundPlayer } from '../sound/soundplayer';
import { Board } from './board';
import { BoardHandler } from './boardhandler';

export class ChessgroundBoard implements Board {
  private chessBoard_: Api;
  private chessBoardElement_: HTMLElement;
  private soundPlayer_: SoundPlayer;

  constructor(
      boardEl: HTMLElement,
      boardHandler: BoardHandler,
      soundPlayer: SoundPlayer,
      viewOnly: boolean) {
    this.chessBoardElement_ = boardEl;
    this.soundPlayer_ = soundPlayer;
    this.chessBoard_ = Chessground(boardEl, {
      movable: { free: false },
      viewOnly: viewOnly,
      events: {
        move: (from, to) => boardHandler.onMove(from, to),
        change: () => boardHandler.onChange()
      }
    });
    boardEl.onwheel = e => boardHandler.onScroll(e);
    window.addEventListener('resize', () => this.redraw());
  }

  redraw(): void {
    this.removeClassName_('wrongMove');
    this.removeClassName_('rightMove');
    this.removeClassName_('finishLine');
    this.removeDrawings();
    this.chessBoard_.redrawAll();
  }

  setStateFromChess(chess: any): void {
    const color: 'white' | 'black' = chess.turn() == 'w' ? 'white' : 'black';
    const legalMoves = new Map();
    const moves: {from: string, to: string}[] = chess.moves({verbose: true});
    moves.forEach(m => {
      if (!legalMoves.has(m.from)) {
        legalMoves.set(m.from, []);
      }
      legalMoves.get(m.from).push(m.to);
    });
    const history = chess.history({verbose: true});
    const lastChessMove = history[history.length - 1];
    const lastMove = lastChessMove
        ? [lastChessMove.from, lastChessMove.to]
        : undefined;

    this.chessBoard_.set({
      check: chess.in_check(),
      fen: chess.fen(),
      lastMove: lastMove,
      turnColor: color,
      movable: {
        color: color,
        dests: legalMoves
      }
    });

    if (lastChessMove && lastChessMove.san.includes('x')) {
      this.soundPlayer_.playCapture();
    } else {
      this.soundPlayer_.playMove();
    }
  }

  setInitialPositionImmediately() {
    this.removeDrawings();
    this.chessBoard_.set({
      check: undefined,
      fen: 'start',
      lastMove: undefined
    });
  }

  setOrientationForColor(color: Color): void {
    let newOrientation: ('white' | 'black') = color == Color.WHITE
        ? 'white'
        : 'black';
    if (this.chessBoard_.state.orientation != newOrientation) {
      this.chessBoard_.set({orientation: newOrientation});
    }
  }

  flashRightMove(): void {
    this.removeClassName_('wrongMove');
    this.removeClassName_('finishLine');
    this.flashClassName_('rightMove');
  }

  flashWrongMove(): void {
    this.removeClassName_('rightMove');
    this.removeClassName_('finishLine');
    this.flashClassName_('wrongMove');
    this.soundPlayer_.playWrongMove();
  }

  flashFinishLine(): void {
    this.removeClassName_('wrongMove');
    this.removeClassName_('rightMove');
    this.flashClassName_('finishLine');
    this.soundPlayer_.playFinishLine();
  }

  drawCircle(square: string, color: string): void {
    this.draw_(square, null, color);
  }

  drawArrow(fromSquare: string, toSquare: string, color: string): void {
    return this.draw_(fromSquare, toSquare, color);
  }

  private draw_(
      fromSquare: string, toSquare: string | null, color: string): void {
    const newShape = [{
      orig: fromSquare as Key,
      dest: toSquare as Key,
      brush: color
    }];
    const newShapes
        = this.chessBoard_.state.drawable.autoShapes.concat(newShape);
    this.chessBoard_.setAutoShapes(newShapes);
  }

  removeDrawings(): void {
    this.chessBoard_.setAutoShapes([]);
  }

  private removeClassName_(className: string): void {
    this.chessBoardElement_.classList.remove(className);
  }

  private flashClassName_(className: string): void {
    this.chessBoardElement_.classList.remove(className);
    // This is needed to restart the animation.
    void this.chessBoardElement_.offsetWidth;
    this.chessBoardElement_.classList.add(className);
  }
}
