/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import * as vscode from "vscode";
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('wirthx')) {
			// Reload the client if the configuration changes
			if (client) {
				client.stop().then(() => {
					client.start();
				});
			}
		}
	});

	const config = workspace.getConfiguration('wirthxLanguageServer');
	const serverModule = config.get<string>('wirthxBinary');
	const rtlPath = config.get<string>('rtlDirectory');
	if (!serverModule || !rtlPath) {
		vscode.window.showErrorMessage("WirthX Language Server configuration is incomplete. Please check your settings.");
		return;
	}



	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { command: serverModule, args: ["--rtl", rtlPath, "--lsp"] },
		debug: {
			command: serverModule,
			args: ["--rtl", rtlPath, "--lsp"]

		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'pascal' }],
		diagnosticCollectionName: "wirthx",
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/*.pas')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'WirthXLanguageServer',
		'WirthX Language Server',
		serverOptions,
		clientOptions
	);




	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
