class TreeView {
  constructor(
      treeViewElement,
      colorChooserWhiteElement,
      colorChooserBlackElement,
      emptyTreeElement,
      treeButtonsElement,
      treeButtonLeftElement,
      treeButtonRightElement,
      treeButtonTrashElement,
      repertoireModel,
      treeNodeHandler,
      chessBoard) {
    this.treeViewElement_ = treeViewElement;
    this.colorChooserWhiteElement_ = colorChooserWhiteElement;
    this.colorChooserBlackElement_ = colorChooserBlackElement;
    this.emptyTreeElement_ = emptyTreeElement;
    this.treeButtonsElement_ = treeButtonsElement;
    this.treeButtonLeftElement_ = treeButtonLeftElement;
    this.treeButtonRightElement_ = treeButtonRightElement;
    this.treeButtonTrashElement_ = treeButtonTrashElement;
    this.repertoireModel_ = repertoireModel;
    this.treeNodeHandler_ = treeNodeHandler;
    this.chessBoard_ = chessBoard;
  }

  refresh() {
    Tooltips.hideAll();

    this.treeViewElement_.innerHTML = '';
    var state = new State_();
    var firstRowEl = this.createRowEl_(0);
    state.rowEl = firstRowEl;
    state.plyToIndent[0] = 0;

    // Show/hide the empty tree element as necessary.
    var isModelEmpty = this.repertoireModel_.isEmpty();
    this.treeViewElement_.classList.toggle('hidden', isModelEmpty);
    this.emptyTreeElement_.classList.toggle('hidden', !isModelEmpty);
    this.treeButtonsElement_.classList.toggle('hidden', isModelEmpty);

    // Disable the tree buttons as necessary.
    var hasPrevious = this.repertoireModel_.hasPreviousPgn();
    this.treeButtonLeftElement_.classList.toggle('disabled', !hasPrevious);
    this.treeButtonLeftElement_.classList.toggle('selectable', hasPrevious);

    var hasNext = this.repertoireModel_.hasNextPgn();
    this.treeButtonRightElement_.classList.toggle('disabled', !hasNext);
    this.treeButtonRightElement_.classList.toggle('selectable', hasNext);

    var canTrash = this.repertoireModel_.canRemoveSelectedPgn();
    this.treeButtonTrashElement_.classList.toggle('disabled', !canTrash);
    this.treeButtonTrashElement_.classList.toggle('selectable', canTrash);

    // Update the tree view.
    var selectedNode = null;
    this.repertoireModel_.traverseDepthFirstPreorder(viewInfo => {
      state.plyToIndent.splice(viewInfo.lastMovePly + 1);

      var newRow = false;
      if (state.plyToIndent[viewInfo.lastMovePly]) {
        state.indent = state.plyToIndent[viewInfo.lastMovePly];
        state.rowEl = this.createRowEl_(state.indent);
        newRow = true;
      }
      var newNode = this.appendNodeEl_(state, viewInfo, newRow);
      if (viewInfo.isSelected) {
        selectedNode = newNode;
      }
      if (viewInfo.numChildren > 1) {
        state.plyToIndent[viewInfo.lastMovePly + 1] = state.indent + 1;
      }
    });

    // Update the chess board.
    const color = this.repertoireModel_.getRepertoireColor();
    this.chessBoard_.setStateFromChess(
        this.repertoireModel_.getChessForState());
    this.chessBoard_.setOrientationForColor(color);

    // Update the color chooser buttons.
    this.colorChooserWhiteElement_.classList.toggle(
        'selectedColor', color == Color.WHITE);
    this.colorChooserBlackElement_.classList.toggle(
        'selectedColor', color == Color.BLACK);

    // Scroll the tree view so that the selected node is in view.
    if (selectedNode) {
      var scrollTop = this.treeViewElement_.offsetTop
          + this.treeViewElement_.scrollTop;
      var scrollBottom = scrollTop + this.treeViewElement_.offsetHeight;
      if (selectedNode.offsetTop < scrollTop
          || selectedNode.offsetTop > scrollBottom) {
        this.treeViewElement_.scrollTop = selectedNode.offsetTop
            - this.treeViewElement_.offsetTop;
      }
    }
  }

  createRowEl_(indent) {
    var rowEl = document.createElement('div');
    rowEl.style.paddingLeft = Config.TREE_ROW_PADDING_PX_PER_INDENT * indent +
        'px';
    this.treeViewElement_.appendChild(rowEl);
    return rowEl;
  }

  appendNodeEl_(state, viewInfo, newRow) {
    var cell = document.createElement('div');
    var label = '(start)'
    if (viewInfo.lastMoveString) {
      label = viewInfo.lastMoveColor == Color.WHITE
          ? viewInfo.lastMoveVerboseString
          : (newRow
              ? viewInfo.lastMoveVerboseString
              : viewInfo.lastMoveString);
    }
    cell.innerText = label;
    cell.classList.add('treeViewNode');
    cell.onclick = this.treeNodeHandler_.onClick.bind(
        this.treeNodeHandler_, viewInfo.pgn);
    cell.classList.toggle('selectedNode', viewInfo.isSelected);
    
    if (viewInfo.warnings.length) {
      // Indicate warnings.
      cell.classList.add('warningNode');
      const template = document.getElementById('warningTooltipContentTemplate');
      tippy(cell, {
        a11y: false,
        animateFill: false,
        animation: 'fade',
        content() {
          const content = document.createElement('div');
          content.innerHTML = template.innerHTML;
          const contentList =
              content.querySelector('.warningTooltipContent-list');
          viewInfo.warnings.forEach(w => {
            const newElement = document.createElement('li');
            newElement.innerHTML = w;
            contentList.appendChild(newElement);
          });
          return content;
        },
        delay: 0,
        duration: 0,
        placement: 'bottom',
        theme: 'warningTooltip'
      });
    } else if (viewInfo.transposition) {
      // Indicate transposition.
      cell.classList.add('transpositionNode');
      const template = document.getElementById(
          'transpositionTooltipContentTemplate');
      tippy(cell, {
        a11y: false,
        animateFill: false,
        animation: 'fade',
        content() {
          const content = document.createElement('div');
          content.innerHTML = template.innerHTML;
          content.querySelector('.transpositionTooltipContent-title')
              .innerHTML = viewInfo.transposition.title;
          content.querySelector('.transpositionTooltipContent-body')
              .innerHTML = viewInfo.transposition.message;
          return content;
        },
        delay: 0,
        duration: 0,
        placement: 'bottom',
        theme: 'transpositionTooltip'
      });
    }

    state.rowEl.appendChild(cell);
    return cell;
  }
}

class State_ {
  constructor() {
    this.indent = 0;
    this.plyToIndent = [];
    this.rowEl = null;
  }
}