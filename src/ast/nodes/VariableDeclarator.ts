import Node from '../Node';
import extractNames from '../utils/extractNames';
import Pattern from './Pattern';
import Expression from './Expression';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import MagicString from 'magic-string';
import { ObjectPath } from '../variables/VariableReassignmentTracker';

export default class VariableDeclarator extends Node {
	type: 'VariableDeclarator';
	id: Pattern;
	init: Expression | null;

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		this.id.reassignPath(path, options);
	}

	initialiseDeclarator (parentScope: Scope, kind: string) {
		this.initialiseScope(parentScope);
		this.init && this.init.initialise(this.scope);
		this.id.initialiseAndDeclare(this.scope, kind, this.init);
	}

	// TODO Deleting this does not break any tests. Find meaningful test or delete.
	render (code: MagicString, es: boolean) {
		extractNames(this.id).forEach(name => {
			const variable = this.scope.findVariable(name);

			if (!es && variable.exportName && variable.isReassigned) {
				if (this.init) {
					code.overwrite(this.start, this.id.end, variable.getName(es));
				} else if (this.module.bundle.treeshake) {
					code.remove(this.start, this.end);
				}
			}
		});

		super.render(code, es);
	}
}
