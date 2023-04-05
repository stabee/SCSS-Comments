import * as vscode from 'vscode';

// Configuration variables
const config = vscode.workspace.getConfiguration('scss-comments');
const replaceExistingComments = config.get('replaceExistingComments') as boolean;

// 2d array of SCSS selectors from the previous blocks
const levels: Array<Array<string>> = [];

/**
 * Backtrack
 * @description Wrapper for the main recursive function
 */
export default function backtrack(newLines: Array<string>, lineNumber: number) {
  backtrackRecursive(levels, newLines, lineNumber, []);
}

/**
 * Backtrack recursive
 * @description Backtrack up the file to find where to insert a comment
 */
function backtrackRecursive(
  levels: Array<Array<string>>,
  newLines: Array<string>,
  lineNumber: number,
  linesToAddBack: Array<string>
) {	
  let currLine = newLines[newLines.length - 1];

  // Reached an '@' - add back all lines and do not create a comment
  if (currLine.trim().startsWith('@')) {
    const lineToAddBack = linesToAddBack.pop();

    if (lineToAddBack) {
      newLines.push(lineToAddBack);
    }

    levels.push([]);
    return;
  }

  // Reached the end of a block - pop the last level
  if (currLine.trim().endsWith('}')) {
    levels.pop();
    return;
  }

  // Reached the top of the file, a comment, or an '@' - add back all lines and do not create a comment
  if (
    lineNumber <= 0
    || (currLine.trim().startsWith('//') && !replaceExistingComments)
    || currLine.trim().startsWith('*/')
    || currLine.trim().startsWith('/*')
  ) {
    while (linesToAddBack.length > 0) {
      const lineToAddBack = linesToAddBack.pop();

      if (lineToAddBack) {
        newLines.push(lineToAddBack);
      }
    }

    return;
  }

  // Reached an empty line - add comments
  if (currLine.trim().length <= 0) {
    let comments: Array<String> = [];

    if (levels.length > 1) {
      createComments(levels, 0, "", comments);
    }

    while (comments.length > 0) {
      newLines.push(`${' '.repeat((levels.length - 1) * 2)}// ${comments.pop()}`);
    }

    while (linesToAddBack.length > 0) {
      const lineToAddBack = linesToAddBack.pop();

      if (lineToAddBack) {
        newLines.push(lineToAddBack);
      }
    }

    return;

  // Reached the start of a block - start backtracking
  } else if (currLine.trim().endsWith('{')) {
    const lineToAddBack = newLines.pop();
    const commentToMake = lineToAddBack?.split('{')[0].trim();

    if (lineToAddBack) {
      linesToAddBack.push(lineToAddBack);
    }

    if (commentToMake) {
      levels.push([commentToMake?.trim()]);
    }

    backtrackRecursive(levels, newLines, lineNumber - 1, linesToAddBack);

  // Reached a comment and the replaceExistingComments setting is on - keep backtracking
  } else if (currLine.trim().startsWith('//') && replaceExistingComments) {
    newLines.pop();

    backtrackRecursive(levels, newLines, lineNumber - 1, linesToAddBack);
  } else {
    const lineToAddBack = newLines.pop();

    if (lineToAddBack) {
      linesToAddBack.push(lineToAddBack);
      levels[levels.length - 1].push(lineToAddBack.trim());
    }

    backtrackRecursive(levels, newLines, lineNumber - 1, linesToAddBack);
  }
}

/**
 * Create comments
 * @description Create comments from the levels array
 */
function createComments(levels: Array<Array<string>>, idx: number, currString: String, comments: Array<String>) {
  if (idx > levels.length - 1) {
    comments.push(currString);
    return;
  }

  levels[idx].forEach((selector) => {
    let toAdd = "";
    if (selector.startsWith("&")) {
      toAdd = currString + selector.slice(1);
    } else if (selector.endsWith('&') || selector.endsWith('&,')) {
      const toSlice = selector.endsWith('&') ? -1 : -2;

      toAdd = `${selector.slice(0, toSlice)}${currString}`;
    } else {
      toAdd = ` ${currString} ${selector}`;
    }

    if (toAdd.trim().endsWith(',') && idx !== levels.length - 1) {
      toAdd = toAdd.slice(0, -1);
    }

    createComments(levels, idx + 1, toAdd.trim(), comments);
  });
}