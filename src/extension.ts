import * as vscode from 'vscode';
import backtrack from './backtrack';

export function activate(context: vscode.ExtensionContext) {

  let disposable = vscode.commands.registerCommand('scss-comments.commentScss', () => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const documentUri = editor.document.uri;

      // Error if the file is not SCSS
      if (!documentUri.fsPath.endsWith('.scss')) {
        vscode.window.showWarningMessage('This is not an SCSS file.');
        return;
      }

      let text = editor.document.getText();
      let lines = text.split(/\r?\n/);
      let newLines: Array<string> = [];

      lines.forEach((line, index) => {
        newLines.push(line);

        if (line.trim().endsWith('{') || line.trim().endsWith('}')) {
          // Backtrack up the file to find where to insert a comment
          backtrack(newLines, index);
        }
      });

      // Join the array of lines back into a string
      text = newLines.join('\n');

      // Write the file back to the editor
      editor.edit((editBuilder) => {
        editBuilder.replace(
          new vscode.Range(
            editor.document.positionAt(0),
            editor.document.positionAt(editor.document.getText().length)
          ),
          text
        );
      });
    }
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
