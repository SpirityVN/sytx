import { Injectable } from '@nestjs/common';
import { find, split } from 'lodash';
import { SYNTAX_LIST } from 'src/constants';
@Injectable()
export class MessageSyntaxService {
  detectMessageSyntax(syntax: string): { syntax: string; params: string[] } {
    let pattern = /^(\/\w+)\s?((?<=\s).*)?$/gis;
    let parseSyntax = pattern.exec(syntax);

    if (!parseSyntax) return undefined;

    let _syntax: string = parseSyntax[1];
    let _params: string[] = split(parseSyntax[2], ' ');

    let syntaxValid = find(SYNTAX_LIST, (v) => v.syntax === _syntax);
    if (!syntaxValid) throw new Error('Syntax invalid');

    return {
      syntax: _syntax,
      params: _params,
    };
  }
}
