import { BoardTheme } from '../../../protocol/boardtheme';
import { assert } from '../../../util/assert';

export interface BoardThemeInfo {
  buttonEl: HTMLElement,
  setCssClass: string,
  previewCssClass: string
}

export type BoardThemeInfoMap = Map<BoardTheme, BoardThemeInfo>;

export function allThemes(): BoardThemeInfoMap {
  const ans = new Map<BoardTheme, BoardThemeInfo>();
  defaultTheme_(ans, BoardTheme.BLUE, 'blue');
  defaultTheme_(ans, BoardTheme.BROWN, 'brown');
  defaultTheme_(ans, BoardTheme.GRAY, 'gray');
  defaultTheme_(ans, BoardTheme.GREEN, 'green');
  defaultTheme_(ans, BoardTheme.LEATHER, 'leather');
  defaultTheme_(ans, BoardTheme.MARBLE, 'marble');
  defaultTheme_(ans, BoardTheme.PURPLE, 'purple');
  defaultTheme_(ans, BoardTheme.WOOD_1, 'wood1');
  defaultTheme_(ans, BoardTheme.WOOD_2, 'wood2');
  defaultTheme_(ans, BoardTheme.WOOD_3, 'wood3');

  return ans;
}


function defaultTheme_(
    map: Map<BoardTheme, BoardThemeInfo>,
    boardTheme: BoardTheme,
    themeName: string): void {
  theme_(
      map,
      boardTheme,
      `${themeName}BoardThemeButton`,
      `${themeName}BoardTheme`,
      `${themeName}BoardThemePreview`);
}


function theme_(
    map: Map<BoardTheme, BoardThemeInfo>,
    boardTheme: BoardTheme,
    buttonElId: string,
    setCssClass: string,
    previewCssClass: string): void {
  map.set(
      boardTheme,
      {
        buttonEl: assert(document.getElementById(buttonElId)),
        setCssClass: setCssClass,
        previewCssClass: previewCssClass
      });
}
